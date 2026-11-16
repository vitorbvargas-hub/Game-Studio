# Paleta P1 (05_PROPOSTA_DE_ESCALA §4) com uma letra por cor
P1 = {
 'k':'#1a0807',
 'W':'#fbf7ee','w':'#e4dccd','v':'#b4aa9b','u':'#7a7066',
 'R':'#e2473b','r':'#b82a2a','q':'#7e1b1f','p':'#4a1015',
 'G':'#5d5c68','g':'#3a3944','h':'#24232c',
 'B':'#3d3c46','b':'#2a2932','S':'#dfe1e8','s':'#9c9eac',
 'Y':'#ffe45c','y':'#f2b52e','o':'#c77a1c','n':'#7c4512',
 'E':'#8fd0f2','e':'#3b7ac2',
 'C':'#f6f6f6','c':'#b9bdc6',
}
def rgb(h): return (int(h[1:3],16),int(h[3:5],16),int(h[5:7],16))
L2C = {k:rgb(v)+(255,) for k,v in P1.items()}; L2C['.']=(0,0,0,0)
C2L = {v[:3]:k for k,v in L2C.items() if k!='.'}
def to_txt(px):
    return [''.join('.' if c[3]==0 else C2L.get(tuple(c[:3]),'?') for c in r) for r in px]
def from_txt(rows):
    return [[L2C[ch] for ch in r] for r in rows]
