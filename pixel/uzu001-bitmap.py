import sys, numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, sys.path[0]); from bitmap import bayer
import os
SRC=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uzu001-recorte.png')
AZUL=(0,0,255); PAPEL=(255,255,255); W,H=3508,4961
def atk(a,mask):
    a=a.copy(); rows,cols=a.shape; ink=np.zeros_like(a,bool)
    for y in range(rows):
        for x in range(cols):
            if not mask[y,x]: continue
            o=a[y,x]; nv=1.0 if o>=.5 else 0.0; ink[y,x]=nv==0; e=(o-nv)/8
            for dx,dy in((1,0),(2,0),(-1,1),(0,1),(1,1),(0,2)):
                X,Y=x+dx,y+dy
                if 0<=X<cols and Y<rows and mask[Y,X]: a[Y,X]+=e
    return ink
def run(cell, mode, lo, hi, gamma, out, alto=0.80, detail=0):
    im=Image.open(SRC).convert('RGBA')
    L=im.convert('L')
    if detail: L=L.filter(ImageFilter.UnsharpMask(radius=40,percent=detail,threshold=0))
    ph=int(H*alto); pw=round(im.width*ph/im.height)
    cols,rows=round(pw/cell),round(ph/cell)
    g=np.asarray(L.resize((cols,rows),Image.LANCZOS),float)/255
    m=np.asarray(im.split()[3].resize((cols,rows),Image.LANCZOS))>128
    p1,p2=np.percentile(g[m],[2,99.5]); g=np.clip((g-p1)/(p2-p1),0,1)
    g=lo+(hi-lo)*g**gamma
    if mode=='atk': ink=atk(g,m)
    else:
        n=int(mode[5:]); t=np.tile(bayer(n),(rows//n+1,cols//n+1))[:rows,:cols]; ink=(g<t)&m
    tile=np.zeros((rows,cols,3),np.uint8); tile[:]=PAPEL; tile[ink]=AZUL
    tile=Image.fromarray(tile).resize((cols*cell,rows*cell),Image.NEAREST)
    page=Image.new('RGB',(W,H),PAPEL)
    # snap to grid
    x0=((W-cols*cell)//2)//cell*cell; y0=((H-rows*cell)//2)//cell*cell
    page.paste(tile,(x0,y0)); page.save(out,dpi=(300,300))
    p=page.copy(); p.thumbnail((500,707),Image.LANCZOS); p.save(out.replace('.png','-prev.png'))
    return page
if __name__=='__main__':
    a=sys.argv; run(int(a[1]),a[2],float(a[3]),float(a[4]),float(a[5]),a[6],detail=int(a[7]) if len(a)>7 else 0)
