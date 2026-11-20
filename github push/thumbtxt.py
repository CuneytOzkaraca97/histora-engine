from PIL import Image, ImageDraw, ImageFont
F="fonts/LuckiestGuy.ttf"; INK=(36,23,38); GOLD=(255,211,74); WHITE=(255,255,255); RED=(200,52,44)
def txt(d,xy,s,size,fill,stroke=14,anchor="la"):
    f=ImageFont.truetype(F,size)
    d.text((xy[0]+8,xy[1]+10),s,font=f,fill=INK,stroke_width=stroke,stroke_fill=INK,anchor=anchor)
    d.text(xy,s,font=f,fill=fill,stroke_width=stroke,stroke_fill=INK,anchor=anchor)
def badge(d,xy,s,size,center=False):
    f=ImageFont.truetype(F,size); w=f.getlength(s); x,y=xy
    if center: x-=w/2+22
    d.rounded_rectangle((x,y,x+w+44,y+size*1.25),radius=14,fill=RED,outline=INK,width=7)
    d.text((x+22,y+size*0.14),s,font=f,fill=WHITE)
im=Image.open("stills/thumb_bg_l.png").convert("RGB"); d=ImageDraw.Draw(im)
badge(d,(40,48),"1932 · AUSTRALIA",42)
txt(d,(36,138),"DECLARED",90,WHITE); txt(d,(36,244),"WAR ON",90,WHITE)
txt(d,(36,350),"EMUS...",124,GOLD,16); txt(d,(44,520),"AND LOST.",84,WHITE)
im.save("out/thumbnail_1280x720.jpg",quality=93)
im=Image.open("stills/thumb_bg_v.png").convert("RGB"); d=ImageDraw.Draw(im)
badge(d,(540,120),"1932 · AUSTRALIA",58,True)
txt(d,(540,330),"WAR ON",150,WHITE,18,"mm"); txt(d,(540,500),"EMUS",210,GOLD,22,"mm")
txt(d,(540,1560),"AND LOST.",140,WHITE,18,"mm")
im.save("out/thumbnail_1080x1920.jpg",quality=93)
a=Image.open("out/thumbnail_1280x720.jpg"); b=Image.open("out/thumbnail_1080x1920.jpg").resize((405,720)); S=Image.new("RGB",(1700,720)); S.paste(a,(0,0)); S.paste(b,(1290,0)); S.save("stills/thumb_test.jpg")
