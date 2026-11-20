"""Burn word-highlighted captions onto rendered frames. Usage: python3 captions.py frames_in frames_out"""
import sys, os, re
from PIL import Image, ImageDraw, ImageFont
FPS = 30
src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
FONT = "fonts/LuckiestGuy.ttf"
WHITE, INK, GOLD = (255, 255, 255), (36, 23, 38), (255, 211, 74)

# speech segments (s) from silence detection of voice B, with the exact script words they contain
SEG = [
    (0.00, 1.36, "In nineteen thirty-two,"), (1.76, 4.27, "Australia declared war on birds."), (4.78, 5.55, "And lost."),
    (6.20, 7.21, "Western Australia."), (7.76, 10.75, "Twenty thousand emus stormed the wheat farms"), (10.93, 12.05, "and ate everything in sight."),
    (12.62, 14.24, "The farmers were old soldiers,"), (14.38, 16.06, "so they asked for machine guns."),
    (16.60, 18.01, "The army sent three men,"), (18.29, 19.22, "two machine guns,"), (19.35, 21.01, "and ten thousand bullets."),
    (21.37, 22.36, "How hard could it be?"), (22.97, 24.28, "The emus scattered"), (24.42, 25.28, "in every direction."),
    (25.80, 27.35, "The soldiers chased them in a truck."), (27.84, 29.25, "The birds were faster."), (29.88, 30.23, "You see,"),
    (30.47, 33.00, "on rough ground an emu outruns a truck,"), (33.36, 36.13, "and a flock never stands still long enough to aim."),
    (36.72, 37.44, "A month later,"), (37.62, 39.34, "the army packed up and went home."), (39.83, 41.01, "The emus stayed."),
]
def syl(w):
    w = re.sub(r"[^a-z]", "", w.lower())
    if not w: return 1
    n = len(re.findall(r"[aeiouy]+", w)); n -= 1 if w.endswith("e") and not w.endswith("le") and n > 1 else 0
    return max(1, n)
words = []  # (text, t0, t1, seg index)
for si, (a, b, txt) in enumerate(SEG):
    ws = txt.split(); wt = [syl(w) + 0.6 for w in ws]; tot = sum(wt); t = a
    for w, k in zip(ws, wt):
        d = (b - a) * k / tot; words.append((w, t, t + d, si)); t += d
# chunks: <=3 words and <=18 chars, never across segments; break after punctuation
chunks = []
cur = []
for i, w in enumerate(words):
    cur.append(i)
    nxt = words[i + 1] if i + 1 < len(words) else None
    txt = " ".join(words[j][0] for j in cur)
    if nxt is None or nxt[3] != w[3] or len(cur) >= 3 or len(txt + " " + nxt[0]) > 18 or w[0][-1] in ",.?":
        chunks.append(cur); cur = []
spans = []
for ci, c in enumerate(chunks):
    t0 = words[c[0]][1] - 0.04
    t1 = words[c[-1]][2] + 0.25
    if ci + 1 < len(chunks): t1 = min(t1, words[chunks[ci + 1][0]][1] - 0.04)
    spans.append((t0, t1, c))

SIZE = 104; font = ImageFont.truetype(FONT, SIZE); YC = 1290; STROKE = 12
def draw_chunk(im, c, t, t0, YC=1290):
    d = ImageDraw.Draw(im)
    toks = [words[j][0].upper() for j in c]
    sp = font.getlength(" ")
    widths = [font.getlength(w) for w in toks]
    # wrap to two lines if wider than 900 px
    lines = [[0]] ; acc = widths[0]
    for k in range(1, len(toks)):
        if acc + sp + widths[k] > 900: lines.append([k]); acc = widths[k]
        else: lines[-1].append(k); acc += sp + widths[k]
    pop = min(1.0, (t - t0) / 0.12)  # chunk pop-in
    lh = SIZE * 1.12; y0 = YC - lh * len(lines) / 2 + (1 - pop) * 18
    for li, ln in enumerate(lines):
        total = sum(widths[k] for k in ln) + sp * (len(ln) - 1); x = 540 - total / 2; y = y0 + li * lh
        for k in ln:
            j = c[k]; active = words[j][1] <= t < words[j][2] + 0.02 or (t >= words[j][2] and k == len(toks) - 1 and t < words[j][2] + 0.25)
            said = t >= words[j][1]
            col = GOLD if active else WHITE
            fnt = font
            if active:  # scale-pop the active word
                s = 1.0 + 0.10 * max(0.0, 1 - (t - words[j][1]) / 0.15)
                fnt = ImageFont.truetype(FONT, int(SIZE * s))
            dx = (fnt.getlength(toks[k]) - widths[k]) / 2
            d.text((x - dx + 6, y + 8), toks[k], font=fnt, fill=(36, 23, 38, 150), stroke_width=STROKE, stroke_fill=(36, 23, 38))  # drop shadow
            d.text((x - dx, y), toks[k], font=fnt, fill=col if said or k == 0 else (235, 235, 235), stroke_width=STROKE, stroke_fill=INK)
            x += widths[k] + sp

frames = sorted(f for f in os.listdir(src) if f.endswith(".jpg"))
for fn in frames:
    f = int(fn[1:5]); t = f / FPS
    im = Image.open(os.path.join(src, fn)).convert("RGB")
    for t0, t1, c in spans:
        if t0 <= t < t1: draw_chunk(im, c, t, t0, 1515 if 637 <= f <= 684 else 1460); break
    im.save(os.path.join(dst, fn), quality=95)
print("captioned", len(frames), "chunks", len(chunks))
