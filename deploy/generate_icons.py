"""Generate PWA icons for COMIKA app."""
from PIL import Image, ImageDraw, ImageFont
import os

SIZES = [192, 512]
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "web", "public")

for size in SIZES:
    img = Image.new("RGB", (size, size), "#7c3aed")
    draw = ImageDraw.Draw(img)

    # Gradient-like effect with circles
    for i in range(size):
        ratio = i / size
        r = int(124 * (1 - ratio) + 236 * ratio)
        g = int(58 * (1 - ratio) + 64 * ratio)
        b = int(237 * (1 - ratio) + 133 * ratio)
        draw.line([(0, i), (size, i)], fill=(r, g, b))

    # Letter C
    try:
        font_size = int(size * 0.5)
        font = ImageFont.truetype("arial.ttf", font_size)
    except Exception:
        font = ImageFont.load_default()

    text = "C"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size - tw) // 2
    y = (size - th) // 2 - int(size * 0.05)
    draw.text((x, y), text, fill="white", font=font)

    out_path = os.path.join(OUT_DIR, f"icon-{size}.png")
    img.save(out_path, "PNG")
    print(f"Created: {out_path}")

print("Done!")
