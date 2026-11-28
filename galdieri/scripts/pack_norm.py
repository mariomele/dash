# scontorna gli sfondi bianchi (flood fill dai bordi) e porta tutte le bottiglie alla stessa altezza
import sys,os,numpy as np
from PIL import Image
from scipy import ndimage
src,dst=sys.argv[1],sys.argv[2]
SCALE={'agromonte':(520/700)**(1/3)}  # 520 g contro ~700 g: altezza proporzionale al volume
for f in sorted(os.listdir(src)):
    if not f.endswith('.png'):continue
    im=Image.open(os.path.join(src,f)).convert('RGBA');a=np.array(im).astype(int)
    if a[...,3].min()==255:  # niente trasparenza: togli lo sfondo chiaro collegato ai bordi
        rgb=a[...,:3];t=150 if 'dolce' in f else 225;light=(rgb.min(2)>t)&((rgb.max(2)-rgb.min(2))<18)
        lab,_=ndimage.label(light);edge=set(np.unique(np.r_[lab[0],lab[-1],lab[:,0],lab[:,-1]]))-{0}
        bg=np.isin(lab,list(edge))
        fg=~bg
        for y in range(fg.shape[0]):  # vetro trasparente: riempi la riga tra i bordi della bottiglia
            xs_=np.where(fg[y])[0]
            if len(xs_)>1:fg[y,xs_[0]:xs_[-1]+1]=True
        bg=~fg
        al=np.where(bg,0,255).astype(np.uint8);al=np.array(Image.fromarray(al).filter(__import__('PIL.ImageFilter',fromlist=['x']).GaussianBlur(0.8)))
        a[...,3]=al
    m=a[...,3]>24;ys,xs=np.where(m);c=a[ys.min():ys.max()+1,xs.min():xs.max()+1].astype(np.uint8)
    b=Image.fromarray(c,'RGBA');k=SCALE.get(f[:-4],1);h=round(560*k);w=round(b.width*h/b.height)
    b=b.resize((w,h),Image.LANCZOS);out=Image.new('RGBA',(w+16,600),(0,0,0,0));out.paste(b,(8,600-h-8),b)
    out.save(os.path.join(dst,f));print(f,out.size)
