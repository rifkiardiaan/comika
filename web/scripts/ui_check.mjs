/*
 * UI check — driver headless Chrome via CDP (tanpa puppeteer).
 *
 * Penggunaan:
 *   1) Jalankan Chrome headless dengan remote debugging:
 *      chrome --headless=new --disable-gpu --remote-debugging-port=9222 \
 *             --user-data-dir=/tmp/chrome-cdp about:blank
 *   2) node scripts/ui_check.mjs "<url>" "<marker1>|<marker2>|..."
 *
 * Membuka URL, menunggu hingga teks halaman mengandung salah satu marker
 * (keadaan akhir) atau timeout 30 detik, lalu menampilkan cuplikan teks.
 * Exit code 0 = mencapai keadaan akhir, 1 = timeout.
 */

const url = process.argv[2]
const markers = (process.argv[3] ?? '').split('|').filter(Boolean)

if (!url) {
  console.error('usage: node scripts/ui_check.mjs <url> "<marker1>|marker2>"')
  process.exit(2)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function openTab(target) {
  const res = await fetch(`http://127.0.0.1:9222/json/new?${encodeURIComponent(target)}`, {
    method: 'PUT',
  })
  return res.json()
}

let ws
let nextId = 0
const pending = new Map()

function send(method, params = {}) {
  const id = ++nextId
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function main() {
  const tab = await openTab(url)
  ws = new WebSocket(tab.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })
  const events = []
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.error) reject(new Error(msg.error.message))
      else resolve(msg.result)
      return
    }
    if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
      const text = (msg.params.args ?? []).map((a) => a.value ?? a.description ?? '').join(' ')
      events.push(`[console.${msg.params.type}] ${text}`)
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      events.push(`[exception] ${msg.params.exceptionDetails?.text ?? ''} ${msg.params.exceptionDetails?.exception?.description ?? ''}`)
    }
    if (msg.method === 'Network.loadingFailed') {
      events.push(`[network-fail] ${msg.params.requestId} ${msg.params.errorText ?? ''} (${msg.params.blockedReason ?? ''})`)
    }
    if (msg.method === 'Log.entryAdded') {
      events.push(`[log.${msg.params.entry.level}] ${msg.params.entry.text}`)
    }
  }

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.enable')
  await send('Log.enable')
  await send('Page.navigate', { url })

  const deadline = Date.now() + 30_000
  let body = ''
  while (Date.now() < deadline) {
    await sleep(800)
    try {
      const { result } = await send('Runtime.evaluate', {
        expression: 'document.body ? document.body.innerText : ""',
        returnByValue: true,
      })
      body = result.value ?? ''
    } catch {
      // halaman sedang berpindah — lanjut
    }
    if (markers.length === 0 || markers.some((m) => body.includes(m))) break
  }

  const { result: state } = await send('Runtime.evaluate', {
    expression: 'JSON.stringify({ href: location.href, token: (localStorage.getItem("comika_token")||"").slice(0,20), user: localStorage.getItem("comika_user") ? !!JSON.parse(localStorage.getItem("comika_user")) : false })',
    returnByValue: true,
  })
  console.log('=== Tab state:', state.value)
  const found = markers.filter((m) => body.includes(m))
  console.log('=== URL:', url)
  console.log('=== Markers found:', found.length ? found.join(', ') : '(none)')
  const excerpt = body.replace(/\s+/g, ' ').slice(0, 900)
  console.log('=== Body excerpt:', excerpt)
  console.log('=== Browser events (' + events.length + '):')
  events.slice(0, 20).forEach((e) => console.log('  ' + e))

  ws.close()
  process.exit(found.length > 0 || markers.length === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error('ui_check error:', e.message)
  process.exit(1)
})