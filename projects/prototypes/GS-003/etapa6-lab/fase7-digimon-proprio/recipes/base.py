import json
P={"o":"#3a1f0a","Y":"#f0a81c","y":"#ffd24a","D":"#c06a10","w":"#fff8e8","g":"#3cb043","G":"#1d6b22","k":"#101010","m":"#b8322a"}
def g(at,rows): 
    leg={c:c for c in set("".join(rows)) if c!='.'}
    return {"op":"grid","at":at,"legend":leg,"rows":rows}
HEAD=["......oooooooooo......","....ooyyyyyyyyyyoo....","...oyyyyyyyyyyyyyyo...","..oyyYYYYYYYYYYYYyyo..",".oyYYYYYYYYYYYYYYYYyo.",".oYwwwwYYYYYYYYwwwwYo.","oYwwgkkoYYYYYYokkgwwYo","oYwgGkkoYYYYYYokkGgwYo","oYYwwwwYYYYYYYYwwwwYYo","oYYYYYYYYYYYYYYYYYYYYo","oDYYYYYYYYYYYYYYYYYYDo","oDYYooooooooooooooYYDo","oDYYwmmmmmmmmmmmmwYYDo",".oDYYooooooooooooYYDo.","..oDDYYYYYYYYYYYYDDo..","....oooooooooooooo...."]
TORSO=["oYYYYYYYYYYYYYYo","oYYyyyyyyyyyyYYo","oDYyyyyyyyyyyYDo","oDYyyyyyyyyyyYDo","oDYYyyyyyyyyYYDo","oDYYYyyyyyyYYYDo","oDDYYYYYYYYYYDDo",".oDDYYYYYYYYDDo.","..oooooooooooo.."]
LEGL=["oYYYYo","oYYYDo","oYYYDo","oYYYDo","oYYDDo","oYYDDo","oYYDDo","oYYYDo","oYYYYo","wowowo"]
LEGR=["oYYYYo","oDYYYo","oDYYYo","oDYYYo","oDDYYo","oDDYYo","oDDYYo","oDYYYo","oYYYYo","owowow"]
ARML=["oYYo.","oYYDo","oYYDo","oYYDo",".oYDo",".oYYo",".oYYo","owowo"]
ARMR=[".oYYo","oDYYo","oDYYo","oDYYo","oDYo.","oYYo.","oYYo.","owowo"]
TAIL=["..ooo",".oYYo","oYYDo","oYDo.","ooo.."]
def scene(tracks, head_rows=HEAD, extra_nodes=None, poses=None, frames=None):
    nodes={
     "root":{"layer":"body","draw":[],"at":[0,0]},
     "tail":{"layer":"tail","at":{"node":"root","point":[0,0]},"pivot":[33,36],"draw":[g([32,34],TAIL)]},
     "leg_l":{"layer":"legs","at":[0,0],"draw":[g([16,33],LEGL)]},
     "leg_r":{"layer":"legs","at":[0,0],"draw":[g([26,33],LEGR)]},
     "torso":{"layer":"body","at":{"node":"root","point":[0,0]},"draw":[g([16,25],TORSO)]},
     "arm_l":{"layer":"arms","at":{"node":"root","point":[0,0]},"pivot":[13,27],"draw":[g([11,27],ARML)]},
     "arm_r":{"layer":"arms","at":{"node":"root","point":[0,0]},"pivot":[34,27],"draw":[g([32,27],ARMR)]},
     "head":{"layer":"head","at":{"node":"root","point":[0,0]},"draw":[g([13,10],head_rows)]},
    }
    if extra_nodes: nodes.update(extra_nodes)
    v={"nodes":nodes}
    if poses: v["poses"]=poses; v["frames"]=frames
    else: v["tracks"]=tracks
    return {"palette":dict(P,**{"f1":"#ff6a00","f2":"#ffd23a","f3":"#fff6c0","t":"#7fd4ff","s":"#ffffff"}),
            "layers":[{"id":"tail","name":"Body - tail"},{"id":"legs","name":"Body - legs"},{"id":"body","name":"Body - torso"},{"id":"arms","name":"Body - arms"},{"id":"head","name":"Body - head"},{"id":"fx","name":"VFX"}],
            "views":{"south":v}}
def job(n,d): return {"canvas":[48,48],"frame_count":n,"durations_ms":d,"views":[{"id":"south","offset":[0,0]}],"source_bookends_exact":False,"overview_scale":6}
idle={"job":job(4,[220]*4),"scene":scene([
 {"node":"root","property":"at","interpolation":"step","keys":[[1,[0,0]],[2,[0,0]],[3,[0,1]],[4,[0,1]]]},
 {"node":"arm_l","property":"angle","keys":[[1,0],[3,6]]},{"node":"arm_r","property":"angle","keys":[[1,0],[3,-6]]},
 {"node":"tail","property":"angle","keys":[[1,0],[3,8]]}])}
open("idle.json","w").write(json.dumps(idle,separators=(",",":")))
print(len(json.dumps(idle)))
