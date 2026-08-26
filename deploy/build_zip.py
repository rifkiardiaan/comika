import zipfile
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZIP_PATH = os.path.join(PROJECT_ROOT, "deploy", "comika-infinityfree.zip")
ENV_PROD = os.path.join(PROJECT_ROOT, "deploy", ".env.production")

# Remove old ZIP
if os.path.exists(ZIP_PATH):
    os.remove(ZIP_PATH)

def add_directory(zf, src_dir, arc_prefix):
    """Recursively add a directory to the zip."""
    skip_dirs = {'node_modules', '.git', 'tests', 'test',
                 'storage/framework/sessions',
                 'storage/framework/views',
                 'storage/logs', '.idea', '.vscode'}
    skip_ext = ('.md', '.lock', '.log')
    skip_files = {'.DS_Store', 'Thumbs.db', '.gitignore'}
    for root, dirs, files in os.walk(src_dir):
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        for f in files:
            if any(f.endswith(ext) for ext in skip_ext):
                continue
            if f in skip_files:
                continue
            full_path = os.path.join(root, f)
            rel = os.path.relpath(full_path, src_dir).replace(os.sep, '/')
            arc_name = arc_prefix + "/" + rel
            zf.write(full_path, arc_name)

with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zf:
    prefix = "public_html"

    # 1. Frontend files -> public_html/
    dist_dir = os.path.join(PROJECT_ROOT, "web", "dist")
    for f in os.listdir(dist_dir):
        full = os.path.join(dist_dir, f)
        if os.path.isfile(full):
            zf.write(full, prefix + "/" + f)

    # 2. assets/ -> public_html/assets/
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.isdir(assets_dir):
        for f in os.listdir(assets_dir):
            zf.write(os.path.join(assets_dir, f), prefix + "/assets/" + f)

    # 3. .htaccess -> public_html/.htaccess
    htaccess_src = os.path.join(PROJECT_ROOT, "deploy", "infinityfree", ".htaccess")
    if os.path.exists(htaccess_src):
        zf.write(htaccess_src, prefix + "/.htaccess")

    # 4. Backend -> public_html/app/
    backend_dir = os.path.join(PROJECT_ROOT, "backend")
    add_directory(zf, backend_dir, prefix + "/app")

    # 5. Replace .env with production version
    if os.path.exists(ENV_PROD):
        zf.write(ENV_PROD, prefix + "/app/.env")
        print("Using production .env from:", ENV_PROD)

    # 6. Backend public/ -> public_html/app/public/
    backend_public = os.path.join(backend_dir, "public")
    if os.path.isdir(backend_public):
        for f in os.listdir(backend_public):
            full = os.path.join(backend_public, f)
            if os.path.isfile(full):
                zf.write(full, prefix + "/app/public/" + f)

size_mb = os.path.getsize(ZIP_PATH) / (1024 * 1024)
print("ZIP created:", ZIP_PATH, "(%.1f MB)" % size_mb)

# Verify
with zipfile.ZipFile(ZIP_PATH, 'r') as zf:
    names = zf.namelist()
    print("Total files:", len(names))

    # Check .env content
    env_content = zf.read(prefix + "/app/.env").decode()
    for line in env_content.split('\n'):
        if line.startswith(('APP_URL', 'DB_HOST', 'DB_DATABASE', 'DB_USERNAME', 'FRONTEND_URL', 'CORS_ALLOWED')):
            print(" ", line)

    # Top-level
    top = set()
    for n in names:
        parts = n.split('/')
        if len(parts) >= 2:
            top.add(parts[1])
    print("Top-level in public_html/:", sorted(top))

    # Demo pages
    demo = [n for n in names if 'demo-pages' in n]
    print("Demo pages:", len(demo))
