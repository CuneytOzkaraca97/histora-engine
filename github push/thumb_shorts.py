import sys; sys.path.insert(0,'.')
from PIL import Image, ImageDraw, ImageFont
F="fonts/LuckiestGuy.ttf"; INK=(36,23,38); GOLD=(255,211,74); WHITE=(255,255,255); RED=(200,52,44)
def txt(d,xy,s,size,fill,stroke=18,anchor="mm"):
    f=ImageFont.truetype(F,size)
    d.text((xy[0]+9,xy[1]+11),s,font=f,fill=INK,stroke_width=stroke,stroke_fill=INK,anchor=anchor)
    d.text(xy,s,font=f,fill=fill,stroke_width=stroke,stroke_fill=INK,anchor=anchor)
def badge(d,cx,y,s,size):
    f=ImageFont.truetype(F,size); w=f.getlength(s); x=cx-w/2-26
    d.rounded_rectangle((x,y,x+w+52,y+size*1.25),radius=16,fill=RED,outline=INK,width=8)
    d.text((x+26,y+size*0.14),s,font=f,fill=WHITE)
im=Image.open("stills/thumb_bg_v.png").convert("RGB"); d=ImageDraw.Draw(im)
badge(d,540,110,"1932 · AUSTRALIA",60)
txt(d,(540,300),"DECLARED",150,WHITE)
txt(d,(540,455),"WAR ON",150,WHITE)
txt(d,(540,640),"EMUS...",210,GOLD,22)
txt(d,(540,1540),"AND LOST.",150,WHITE)
im.save("out/thumbnail_shorts_1080x1920.jpg",quality=93)
a=Image.open("out/thumbnail_shorts_1080x1920.jpg").resize((405,720)); a.save("stills/thumb_v2_prev.jpg")
