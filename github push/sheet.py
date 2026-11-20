import sys,glob,os
from PIL import Image,ImageDraw
src,out=sys.argv[1],sys.argv[2]; fs=sorted(glob.glob(src+"/*.jpg")); cols=int(sys.argv[3]) if len(sys.argv)>3 else 7
tw,th=270,480; rows=(len(fs)+cols-1)//cols
S=Image.new("RGB",(cols*tw,rows*(th+22)),(20,20,20)); d=ImageDraw.Draw(S)
for i,f in enumerate(fs):
    im=Image.open(f).resize((tw,th)); x,y=(i%cols)*tw,(i//cols)*(th+22); S.paste(im,(x,y)); d.text((x+6,y+th+4),os.path.basename(f),fill=(255,255,255))
S.save(out,quality=88)
