from comum import *
w,h,px = load(LAB+'/fase19-f8a-hawkmon/biblioteca/oficiais/ds_dawndusk/sr40896_hawkmon.png')
bg = px[0][0]; print(w,h,bg)
seen=[[False]*w for _ in range(h)]
for y in range(h):
    for x in range(w):
        if px[y][x]!=bg and not seen[y][x]:
            st=[(x,y)]; seen[y][x]=True; x0=x1=x; y0=y1=y; n=0
            while st:
                a,b=st.pop(); n+=1; x0=min(x0,a);x1=max(x1,a);y0=min(y0,b);y1=max(y1,b)
                for dx in(-1,0,1):
                    for dy in(-1,0,1):
                        c,d=a+dx,b+dy
                        if 0<=c<w and 0<=d<h and not seen[d][c] and px[d][c]!=bg: seen[d][c]=True; st.append((c,d))
            if n>40: print((x0,y0,x1,y1), x1-x0+1, y1-y0+1, n)
