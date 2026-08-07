"""
Generates:
    cubby/assets/icon.png        – 1024x1024, App Store icon (no alpha)
    cubby/assets/splash-icon.png – 512x512, centred mark + wordmark for splash
    cubby/assets/favicon.png     – 196x196, web favicon

Design: A small stylised piggy bank drawn with rounded geometry,
warm brown on the accentDeep background, consistent with the app theme.

Palette (from src/theme.ts):
  background   #f8efe8
  accentDeep   #4f2e20
  accent       #7c4b2f
  accentSoft   #efe0d1
  surface      #fffaf5
  textOnAccent #fffaf5
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------------------------
# Palette
# ---------------------------------------------------------------------------
BG          = (79,  46,  32)   # accentDeep – icon background
BODY        = (255, 250, 245)  # surface / textOnAccent
COIN        = (184, 122, 74)   # accentHighlight


def load_font(size: int, *, bold: bool = False):
    font_names = (
        ("DejaVuSerif-Bold.ttf", "Georgia Bold.ttf", "Times New Roman Bold.ttf")
        if bold
        else ("DejaVuSerif.ttf", "Georgia.ttf", "Times New Roman.ttf")
    )
    for font_name in font_names:
        try:
            return ImageFont.truetype(font_name, size)
        except OSError:
            continue
    return ImageFont.load_default()

# ---------------------------------------------------------------------------
# Helper: draw a rounded rectangle
# ---------------------------------------------------------------------------
def rounded_rect(draw, xy, radius, fill, outline=None, outline_width=0):
    x0, y0, x1, y1 = xy
    r = radius
    draw.rectangle([x0 + r, y0, x1 - r, y1], fill=fill)
    draw.rectangle([x0, y0 + r, x1, y1 - r], fill=fill)
    draw.ellipse([x0, y0, x0 + 2*r, y0 + 2*r], fill=fill)
    draw.ellipse([x1 - 2*r, y0, x1, y0 + 2*r], fill=fill)
    draw.ellipse([x0, y1 - 2*r, x0 + 2*r, y1], fill=fill)
    draw.ellipse([x1 - 2*r, y1 - 2*r, x1, y1], fill=fill)
    if outline and outline_width > 0:
        for delta in range(outline_width):
            d = delta
            draw.arc([x0+d, y0+d, x0+2*r-d, y0+2*r-d], 180, 270, fill=outline)
            draw.arc([x1-2*r+d, y0+d, x1-d, y0+2*r-d], 270, 360, fill=outline)
            draw.arc([x0+d, y1-2*r+d, x0+2*r-d, y1-d], 90, 180, fill=outline)
            draw.arc([x1-2*r+d, y1-2*r+d, x1-d, y1-d], 0, 90, fill=outline)
            draw.line([x0+r, y0+d, x1-r, y0+d], fill=outline)
            draw.line([x0+r, y1-d, x1-r, y1-d], fill=outline)
            draw.line([x0+d, y0+r, x0+d, y1-r], fill=outline)
            draw.line([x1-d, y0+r, x1-d, y1-r], fill=outline)


# ---------------------------------------------------------------------------
# Draw the piggy-bank icon at a given size (returns RGBA Image)
# ---------------------------------------------------------------------------
def draw_icon(size: int, *, include_background: bool = True) -> Image.Image:
    s = size
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")

    # --- Background (square, no rounded corners – Expo/Apple clips the icon) ---
    if include_background:
        draw.rectangle([0, 0, s, s], fill=BG)

    # scale factor shorthand
    def p(v): return int(v * s / 1024)

    # --- Body: fat pill shape (the piggy bank body) ---
    bx0, by0, bx1, by1 = p(160), p(310), p(800), p(740)
    body_r = p(120)
    rounded_rect(draw, [bx0, by0, bx1, by1], body_r, fill=BODY)

    # --- Head: circle to the right ---
    hcx, hcy, hr = p(780), p(400), p(140)
    draw.ellipse([hcx - hr, hcy - hr, hcx + hr, hcy + hr], fill=BODY)

    # --- Snout: smaller circle on the head ---
    scx, scy, sr = p(880), p(430), p(70)
    draw.ellipse([scx - sr, scy - sr, scx + sr, scy + sr], fill=(240, 224, 208))
    # nostrils
    noff = p(22)
    nr = p(14)
    draw.ellipse([scx - noff - nr, scy - nr, scx - noff + nr, scy + nr], fill=BG)
    draw.ellipse([scx + noff - nr, scy - nr, scx + noff + nr, scy + nr], fill=BG)

    # --- Eye ---
    ecx, ecy, er = p(820), p(330), p(22)
    draw.ellipse([ecx - er, ecy - er, ecx + er, ecy + er], fill=BG)

    # --- Ear: small circle on top of the head ---
    ear_cx, ear_cy, ear_r = p(730), p(270), p(55)
    draw.ellipse([ear_cx - ear_r, ear_cy - ear_r, ear_cx + ear_r, ear_cy + ear_r], fill=BODY)
    # inner ear
    draw.ellipse([ear_cx - p(30), ear_cy - p(30), ear_cx + p(30), ear_cy + p(30)],
                 fill=(240, 218, 198))

    # --- Coin slot: narrow rounded rect on top of body ---
    csx0, csy0 = p(440), p(295)
    csx1, csy1 = p(570), p(335)
    rounded_rect(draw, [csx0, csy0, csx1, csy1], p(18), fill=BG)

    # --- Legs: four rounded rectangles at the bottom ---
    leg_w, leg_h, leg_r = p(72), p(120), p(24)
    leg_tops = [p(680), p(680), p(680), p(680)]
    leg_xs   = [p(220), p(330), p(580), p(690)]
    for lx, lt in zip(leg_xs, leg_tops):
        rounded_rect(draw, [lx, lt, lx + leg_w, lt + leg_h], leg_r, fill=BODY)

    # --- Coin: a small gold circle "going in" (below the slot, decorative) ---
    cc_cx, cc_cy, cc_r = p(505), p(400), p(55)
    draw.ellipse([cc_cx - cc_r, cc_cy - cc_r, cc_cx + cc_r, cc_cy + cc_r],
                 fill=COIN)
    # Draw an actual '$' glyph so the symbol is unambiguous at all sizes.
    symbol_font = load_font(p(74), bold=True)

    symbol = "$"
    sx0, sy0, sx1, sy1 = draw.textbbox((0, 0), symbol, font=symbol_font)
    symbol_w = sx1 - sx0
    symbol_h = sy1 - sy0
    draw.text(
        (cc_cx - symbol_w / 2 - sx0, cc_cy - symbol_h / 2 - sy0),
        symbol,
        fill=BODY,
        font=symbol_font,
    )

    # --- Tail: small arc on the left ---
    tx0, ty0, tx1, ty1 = p(100), p(440), p(210), p(600)
    draw.arc([tx0, ty0, tx1, ty1], 200, 340, fill=BODY, width=p(22))

    return img


def draw_splash_art(size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pig_size = int(size * 0.66)
    pig = draw_icon(pig_size, include_background=False)

    pig_x = (size - pig_size) // 2
    pig_y = int(size * 0.06)
    canvas.alpha_composite(pig, (pig_x, pig_y))

    draw = ImageDraw.Draw(canvas, "RGBA")
    wordmark = "Cubby"
    wordmark_font = load_font(int(size * 0.125), bold=True)
    wx0, wy0, wx1, wy1 = draw.textbbox((0, 0), wordmark, font=wordmark_font)
    wordmark_w = wx1 - wx0
    wordmark_h = wy1 - wy0
    wordmark_x = (size - wordmark_w) / 2 - wx0
    wordmark_y = pig_y + pig_size + int(size * 0.075)

    draw.text(
        (wordmark_x, wordmark_y),
        wordmark,
        fill=BG,
        font=wordmark_font,
    )

    return canvas


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------
out_dir = Path(__file__).parent / "cubby" / "assets"
out_dir.mkdir(parents=True, exist_ok=True)

# 1024×1024 icon (no alpha – Apple requires it)
icon = draw_icon(1024).convert("RGB")
icon.save(out_dir / "icon.png", "PNG")
print(f"✓  icon.png  ({out_dir / 'icon.png'})")

# 512×512 splash art (keep alpha so the warm bg in app.json shows through)
splash = draw_splash_art(512)
splash.save(out_dir / "splash-icon.png", "PNG")
print(f"✓  splash-icon.png  ({out_dir / 'splash-icon.png'})")

# 196×196 favicon
favicon = draw_icon(196).convert("RGB")
favicon.save(out_dir / "favicon.png", "PNG")
print(f"✓  favicon.png  ({out_dir / 'favicon.png'})")

print("\nAll assets generated.")
