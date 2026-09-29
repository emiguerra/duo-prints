import sys, numpy as np
from PIL import Image, ImageOps, ImageEnhance
SRC='/Users/emiliaguerra/Desktop/duo/web duo/contentfoto/uzu001/uzu001.jpg'
AZUL=(0,0,255); PAPEL=(255,255,255)
W,H=3508,4961  # A3 300dpi
def bayer(n):
    m=np.array([[0,2],[3,1]])
    while m.shape[0]<n:
        k=m.shape[0]; m=np.block([[4*m,4*m+2],[4*m+3,4*m+1]])
    return (m+0.5)/m.size
def run(cols, mode, gamma, contrast, out, invert=False):
    im=Image.open(SRC).convert('L')
    w,h=im.size; ch=int(w*H/W); top=(h-ch)//2
    im=im.crop((0,top,w,top+ch))
    im=ImageEnhance.Contrast(im).enhance(contrast)
    rows=round(cols*H/W)
    g=np.asarray(im.resize((cols,rows),Image.LANCZOS),dtype=float)/255
    g=g**gamma
    if invert: g=1-g
    if mode.startswith('bayer'):
        n=int(mode[5:]); b=bayer(n); t=np.tile(b,(rows//n+1,cols//n+1))[:rows,:cols]
        ink=g<t
    else:  # atkinson
        a=g.copy(); ink=np.zeros_like(a,bool)
        for y in range(rows):
            for x in range(cols):
                o=a[y,x]; nv=1.0 if o>=.5 else 0.0; ink[y,x]=nv==0; e=(o-nv)/8
                for dx,dy in((1,0),(2,0),(-1,1),(0,1),(1,1),(0,2)):
                    X,Y=x+dx,y+dy
                    if 0<=X<cols and Y<rows: a[Y,X]+=e
    rgb=np.zeros((rows,cols,3),np.uint8); rgb[:]=PAPEL; rgb[ink]=AZUL
    Image.fromarray(rgb).resize((W,H),Image.NEAREST).save(out,dpi=(300,300))
    p=Image.open(out); p.thumbnail((500,700),Image.NEAREST); p.save(out.replace('.png','-prev.png'))
if __name__=='__main__':
    run(*[int(sys.argv[1]),sys.argv[2],float(sys.argv[3]),float(sys.argv[4]),sys.argv[5]], invert=len(sys.argv)>6)
