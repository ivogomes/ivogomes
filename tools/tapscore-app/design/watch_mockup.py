#!/usr/bin/env python3
"""Render a visual mockup of the TapScore Apple Watch UI (3 frames) to PNG."""
from PIL import Image, ImageDraw, ImageFont

S = 2  # supersample for crispness
def px(n): return int(round(n * S))

# fonts (macOS)
FB = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FR = "/System/Library/Fonts/Supplemental/Arial.ttf"
import os
if not os.path.exists(FB): FB = FR
def bold(sz): return ImageFont.truetype(FB, px(sz))
def reg(sz):  return ImageFont.truetype(FR, px(sz))

BG      = (14, 19, 28)
BEZEL   = (23, 24, 28)
BEZEL_E = (43, 44, 49)
SCREEN  = (11, 18, 32)
AZURE   = (14, 165, 233)
CORAL   = (244, 63, 94)
LIME    = (201, 230, 75)
WHITE   = (255, 255, 255)
INK_A   = (234, 247, 255)
INK_B   = (255, 233, 236)
SUB     = (159, 176, 195)
STEEL   = (203, 213, 225)

W, H = px(860), px(410)
img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

def rr(draw, x, y, w, h, r, **kw):
    draw.rounded_rectangle([px(x), px(y), px(x + w), px(y + h)], radius=px(r), **kw)

def watch(ox, oy, kind, caption):
    # bezel + crown
    rr(d, ox, oy, 220, 300, 56, fill=BEZEL, outline=BEZEL_E, width=px(2))
    rr(d, ox + 219, oy + 118, 10, 46, 5, fill=(58, 59, 65))

    # screen content on its own layer, then round-mask it
    sw, sh = px(192), px(272)
    scr = Image.new("RGB", (sw, sh), SCREEN)
    s = ImageDraw.Draw(scr)

    def stext(x, y, txt, font, fill, anchor="la"):
        s.text((px(x), px(y)), txt, font=font, fill=fill, anchor=anchor)

    if kind in ("main", "tb"):
        s.rectangle([0, 0, sw, px(136)], fill=AZURE)
        s.rectangle([0, px(136), sw, sh], fill=CORAL)
        stext(16, 12, "YOU", bold(15), INK_A)
        s.ellipse([px(168), px(17), px(180), px(29)], fill=LIME)   # serve dot
        stext(16, 244, "OPP", bold(15), INK_B)
        if kind == "main":
            stext(96, 66, "40", bold(60), WHITE, "mm")
            stext(96, 116, "4 GAMES", reg(12), INK_A, "mm")
            stext(96, 204, "30", bold(60), WHITE, "mm")
            stext(96, 250, "2 GAMES", reg(12), INK_B, "mm")
        else:  # tie-break
            stext(96, 70, "7", bold(66), WHITE, "mm")
            stext(96, 202, "5", bold(66), WHITE, "mm")
    else:  # win
        # trophy
        s.polygon([(px(97), px(60)), (px(123), px(60)), (px(119), px(80)), (px(101), px(80))], fill=LIME)
        s.arc([px(86), px(60), px(100), px(80)], 90, 260, fill=LIME, width=px(3))
        s.arc([px(120), px(60), px(134), px(80)], 280, 90, fill=LIME, width=px(3))
        s.rectangle([px(108), px(86), px(112), px(95)], fill=LIME)
        rr(s, 99, 95, 22, 5, 2, fill=LIME)
        stext(96, 118, "You win!", bold(22), WHITE, "mm")
        stext(96, 150, "6-4  ·  7-5", bold(16), STEEL, "mm")
        rr(s, 28, 172, 136, 42, 21, fill=LIME)
        stext(96, 193, "New match", bold(15), SCREEN, "mm")

    # round-mask the screen and paste
    mask = Image.new("L", (sw, sh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, sw, sh], radius=px(44), fill=255)
    img.paste(scr, (px(ox + 14), px(oy + 14)), mask)

    # pill on the split line (drawn on top, in canvas coords)
    if kind == "main":
        rr(d, ox + 78, oy + 139, 64, 22, 11, fill=SCREEN, outline=(255, 255, 255), width=px(1))
        d.text((px(ox + 110), px(oy + 150)), "SET 1-0", font=bold(11), fill=WHITE, anchor="mm")
    elif kind == "tb":
        rr(d, ox + 66, oy + 138, 88, 24, 12, fill=SCREEN, outline=LIME, width=px(1))
        d.text((px(ox + 110), px(oy + 150)), "TIE-BREAK", font=bold(11), fill=LIME, anchor="mm")

    d.text((px(ox + 110), px(oy + 328)), caption, font=reg(15), fill=SUB, anchor="mm")

watch(20, 20, "main", "Scoring — tap a half")
watch(320, 20, "tb", "Tie-break — 6-6")
watch(620, 20, "win", "Match won (or tie)")

d.text((px(430), px(388)), "Digital Crown = undo        ·        Long-press = menu",
       font=reg(15), fill=SUB, anchor="mm")

out = os.path.join(os.path.dirname(__file__), "watch-mockup.png")
img.save(out)
print("wrote", out, img.size)
