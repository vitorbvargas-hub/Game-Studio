"""F6 (Comando 12): Agumon low-poly próprio -> passes brutos para pixelização.

Uso:
  run_blender.sh -b --factory-startup --python agumon_blender.py -- <pasta_saida> [--blend]

Tudo aqui é construído por código (elipsoides e cones). Nenhum modelo, rig ou
textura de terceiros é aberto. Fonte de anatomia: fase11-fichas-anatomia/FICHA_AGUMON.md.

Saída por pose, em <pasta_saida>/<anim>/<dir>/: fNNN_id.png e fNNN_nl.png (240x240).
  _id: cor chapada por peça (identifica o grupo de cor).
  _nl: canal R = 0.5+0.5*N.L (luz fixa no espaço da câmera), canal G = profundidade.
A pixelização (scripts/pixelize.py) roda fora do Blender, sem dependências.

Convenções: 1 unidade = 1 pixel final na horizontal. Z para cima. O personagem
olha para -Y. Câmera ortográfica fixa em -Y, inclinada 20 graus para baixo
(low top-down). As direções são o personagem girando em Z.
"""
import bpy, bmesh, sys, os, math, json, time
import numpy as np
from mathutils import Matrix, Vector

T0 = time.time()
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else '/tmp/f6_raw'
SAVE_BLEND = '--blend' in argv
SS = 4            # superamostragem: 240 px para 60
CANVAS = 60
PITCH = 20.0      # graus abaixo do horizonte
PX = 1.09         # unidades do modelo por pixel final (escala igual à do F2b: ~37 px de altura no S)
GROUND_ROW = 46   # linha do canvas onde cai a origem do mundo (ponto de apoio sob o quadril)

# ---------------------------------------------------------------- cena
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
scn = bpy.context.scene
scn.render.engine = 'BLENDER_WORKBENCH'
scn.render.resolution_x = scn.render.resolution_y = CANVAS * SS
scn.render.resolution_percentage = 100
scn.render.film_transparent = True
scn.render.image_settings.file_format = 'PNG'
scn.render.image_settings.color_mode = 'RGBA'
scn.render.image_settings.color_depth = '8'
scn.render.image_settings.compression = 15
scn.view_settings.view_transform = 'Standard'
scn.view_settings.look = 'None'
scn.view_settings.exposure = 0; scn.view_settings.gamma = 1
scn.render.dither_intensity = 0.0   # o dither de 8 bits do Blender mexia 1-2 níveis e fazia a cabeça piscar
scn.display.render_aa = 'OFF'
sh = scn.display.shading
sh.light = 'FLAT'; sh.show_shadows = False; sh.show_cavity = False
sh.show_object_outline = False; sh.show_xray = False; sh.show_backface_culling = False

cam_d = bpy.data.cameras.new('cam'); cam_d.type = 'ORTHO'; cam_d.ortho_scale = CANVAS * PX
cam_d.clip_start = 1; cam_d.clip_end = 400
cam = bpy.data.objects.new('cam', cam_d); scn.collection.objects.link(cam); scn.camera = cam
th = math.radians(90 - PITCH)
cam.rotation_euler = (th, 0, 0)
CAM_DIR = Vector((0, math.sin(th), -math.cos(th)))
CAM_UP = Vector((0, math.cos(th), math.sin(th)))
# origem do mundo (ponto de apoio no chão) cai na base da linha GROUND_ROW
below = (GROUND_ROW + 1) - CANVAS / 2
target = Vector((0, 0, 0)) + CAM_UP * below * PX
cam.location = target - CAM_DIR * 150
LIGHT = Vector((-0.45, -0.55, 0.70)).normalized()   # de cima, da esquerda e da frente (mundo = câmera fixa)

# ---------------------------------------------------------------- malha
PARTS = []   # (obj, bone, group, chain)
GROUPS = ['skin', 'belly', 'nape', 'spot', 'eye_dark', 'eye_green', 'eye_white', 'claw',
          'nostril', 'lip', 'mouth', 'fire_out', 'fire_in', 'tooth']
LEV = [0.0, 0.1, 0.4, 1.0]
def gid_color(i):
    i += 1   # índice da PEÇA; o meta.json diz o grupo de cor e a cadeia de cada uma
    return (LEV[i % 4], LEV[(i // 4) % 4], LEV[(i // 16) % 4], 1.0)
def chain_of(name, bone):
    for k in ('tail', 'jaw', 'fire'):
        if bone.startswith(k): return k
    if bone in ('head',): return 'head'
    if bone in ('torso', 'hips'): return 'body'
    side = bone[-1]
    return ('arm' if bone[:3] in ('arm', 'for') else 'leg') + side

def finish(bm, name, bone, group):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    me.color_attributes.new('nl', 'FLOAT_COLOR', 'POINT')
    ob = bpy.data.objects.new(name, me); scn.collection.objects.link(ob)
    ob.color = gid_color(len(PARTS))
    PARTS.append((ob, bone, group, chain_of(name, bone))); return ob

def ellipsoid(name, bone, group, c, r, box=2.0, rot=None, seg=16, rings=10):
    """Elipsoide (box=2) ou caixa arredondada (box=4+), centro c, raios r, em coordenadas de repouso."""
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0)
    R = rot.to_3x3() if rot else Matrix.Identity(3)
    for v in bm.verts:
        x, y, z = v.co
        if box != 2.0:
            n = (abs(x) ** box + abs(y) ** box + abs(z) ** box) ** (1.0 / box)
            x, y, z = x / n, y / n, z / n
        v.co = R @ Vector((x * r[0], y * r[1], z * r[2])) + Vector(c)
    return finish(bm, name, bone, group)

def cone(name, bone, group, base, tip, radius, seg=8):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=True, segments=seg, radius1=radius, radius2=radius * 0.15, depth=1.0)
    b = Vector(base); t = Vector(tip); d = t - b; L = d.length
    q = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix()
    for v in bm.verts:
        v.co = q @ Vector((v.co.x, v.co.y, (v.co.z + 0.5) * L)) + b
    return finish(bm, name, bone, group)

# ---------------------------------------------------------------- anatomia (repouso)
L1 = L2 = 5.3                 # coxa e canela
ANK = 1.8                     # altura do tornozelo
HZ = ANK + L1 + L2            # altura do quadril em repouso (pernas esticadas)
HX, HY = 4.5, 0.5             # articulação do quadril
def H(x, y, z): return (x, y, HZ + z)   # coordenada relativa ao quadril

BONES = {}   # nome -> (pivô, ponta, pai)
def bone(name, head, tail, parent=None): BONES[name] = (Vector(head), Vector(tail), parent)

bone('root', (0, 0, 0), (0, 0, 3))
bone('hips', H(0, 0, 0), H(0, 0, 4), 'root')
bone('torso', H(0, 0, 2), H(0, 0, 9), 'hips')
bone('head', H(0, -0.5, 11.5), H(0, -0.5, 20), 'torso')
bone('jaw', H(0, -3.0, 14.2), H(0, -12, 13.5), 'head')
bone('fire', H(0, -14, 15), H(0, -18, 15), 'root')
for s, sx in (('L', 1), ('R', -1)):
    bone('thigh.' + s, (sx * HX, HY, HZ), (sx * HX, HY, HZ - L1), 'hips')
    bone('shin.' + s, (sx * HX, HY, HZ - L1), (sx * HX, HY, ANK), 'thigh.' + s)
    bone('foot.' + s, (sx * HX, HY, ANK), (sx * HX, HY - 5, 0.8), 'shin.' + s)
    bone('arm.' + s, H(sx * 6.2, -1.0, 8.6), H(sx * 8.6, -1.6, 4.2), 'torso')
    bone('fore.' + s, H(sx * 8.6, -1.6, 4.2), H(sx * 9.2, -4.0, 0.6), 'arm.' + s)
bone('tail1', H(0, 4.5, 0.8), H(0, 10.0, 1.2), 'hips')
bone('tail2', H(0, 10.0, 1.2), H(0, 15.5, 2.0), 'tail1')
bone('tail3', H(0, 15.5, 2.0), H(0, 20.5, 3.0), 'tail2')

# tronco
ellipsoid('torso', 'torso', 'skin', H(0, 0.3, 3.4), (6.3, 5.8, 7.4))
ellipsoid('chest', 'torso', 'skin', H(0, -0.6, 8.6), (5.0, 4.6, 4.8))
ellipsoid('belly', 'torso', 'belly', H(0, -2.5, 3.0), (4.5, 4.1, 5.8))
# cabeça: crânio largo de topo chato + focinho em cunha comprido + mandíbula curta
ellipsoid('skull', 'head', 'skin', H(0, 0.5, 18.6), (10.0, 7.5, 7.2), box=3.0)
ellipsoid('snout', 'head', 'skin', H(0, -8.8, 16.6), (7.0, 8.4, 4.9), box=2.6)
ellipsoid('jaw', 'jaw', 'skin', H(0, -7.4, 12.4), (6.2, 6.6, 2.8), box=2.6)
ellipsoid('nape', 'head', 'nape', H(0, 7.0, 15.4), (5.2, 1.0, 2.0))
ellipsoid('mouth', 'head', 'mouth', H(0, -8.6, 13.9), (5.6, 6.6, 1.1))
ellipsoid('lip', 'head', 'lip', H(0, -8.8, 14.2), (6.95, 8.26, 0.42), box=2.6)
for s, sx in (('L', 1), ('R', -1)):
    ellipsoid('crown.' + s, 'head', 'skin', H(sx * 6.0, 0.5, 25.0), (2.6, 3.0, 1.6))
    ellipsoid('eyeD.' + s, 'head', 'eye_dark', H(sx * 6.5, -5.2, 20.6), (2.6, 3.1, 3.7))
    ellipsoid('eyeG.' + s, 'head', 'eye_green', H(sx * 6.9, -5.6, 20.3), (2.4, 2.9, 3.3))
    ellipsoid('eyeP.' + s, 'head', 'eye_dark', H(sx * 8.1, -6.9, 19.9), (1.3, 1.5, 2.0))
    ellipsoid('eyeW.' + s, 'head', 'eye_white', H(sx * 8.0, -7.2, 21.9), (1.15, 1.1, 1.15), seg=8, rings=6)
    ellipsoid('nostril.' + s, 'head', 'nostril', H(sx * 2.2, -15.4, 20.2), (0.75, 0.8, 0.6), seg=8, rings=6)
    # braço: curto, pendendo à frente e afastado do tronco, mão com 3 garras brancas
    ellipsoid('arm.' + s, 'arm.' + s, 'skin', H(sx * 7.6, -1.3, 6.2), (1.8, 1.9, 3.2))
    ellipsoid('fore.' + s, 'fore.' + s, 'skin', H(sx * 9.0, -2.8, 2.4), (1.7, 2.1, 2.7))
    for k, dx in enumerate((-1.2, 0.0, 1.2)):
        cone('hclaw%d.%s' % (k, s), 'fore.' + s, 'claw', H(sx * 9.1 + dx, -3.9, 0.9), H(sx * 9.2 + dx * 1.2, -5.3, -1.7), 0.85)
    # perna: coxa grossa, canela, pé grande e chato com 3 garras brancas
    ellipsoid('thigh.' + s, 'thigh.' + s, 'skin', (sx * (HX + 0.3), HY, HZ - 2.4), (2.8, 3.2, 3.9))
    ellipsoid('shin.' + s, 'shin.' + s, 'skin', (sx * (HX + 0.3), HY, HZ - L1 - 2.4), (2.3, 2.6, 3.3))
    ellipsoid('foot.' + s, 'foot.' + s, 'skin', (sx * (HX + 0.5), HY - 2.4, 1.6), (3.1, 4.6, 1.75), box=2.6)
    for k, dx in enumerate((-1.9, 0.0, 1.9)):
        cone('fclaw%d.%s' % (k, s), 'foot.' + s, 'claw', (sx * (HX + 0.5) + dx, HY - 6.0, 1.3), (sx * (HX + 0.5) + dx * 1.25, HY - 8.8, 0.45), 1.05)
# cauda curta e grossa, 3 segmentos
ellipsoid('tail1', 'tail1', 'skin', H(0, 7.2, 1.0), (4.3, 5.2, 4.2))
ellipsoid('tail2', 'tail2', 'skin', H(0, 12.4, 1.6), (3.2, 4.4, 3.0))
ellipsoid('tail3', 'tail3', 'skin', H(0, 16.6, 2.4), (2.0, 3.3, 1.9))
ellipsoid('spot', 'tail1', 'spot', H(0, 9.0, 3.5), (2.6, 3.0, 2.2))
# fogo (Pepper Breath): duas esferas concêntricas, escondidas fora do ataque
ellipsoid('fireO', 'fire', 'fire_out', H(0, -16, 15), (3.6, 3.6, 3.6), seg=12, rings=8)

# ---------------------------------------------------------------- armature
arm_d = bpy.data.armatures.new('AgumonRig'); rig = bpy.data.objects.new('AgumonRig', arm_d)
scn.collection.objects.link(rig); bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode='EDIT')
for n, (hd, tl, par) in BONES.items():
    eb = arm_d.edit_bones.new(n); eb.head = hd; eb.tail = tl; eb.roll = 0
    if par: eb.parent = arm_d.edit_bones[par]; eb.use_connect = False
bpy.ops.object.mode_set(mode='OBJECT')
REST = {n: arm_d.bones[n].matrix_local.copy() for n in BONES}
for ob, bn, grp, ch in PARTS:
    ob.parent = rig; ob.parent_type = 'BONE'; ob.parent_bone = bn
    b = arm_d.bones[bn]
    ob.matrix_parent_inverse = (REST[bn] @ Matrix.Translation((0, b.length, 0))).inverted()
ORDER = []
def _ord(n):
    if n in ORDER: return
    p = BONES[n][2]
    if p: _ord(p)
    ORDER.append(n)
for n in BONES: _ord(n)

def Rx(deg): return Matrix.Rotation(math.radians(deg), 4, 'X')
def Ry(deg): return Matrix.Rotation(math.radians(deg), 4, 'Y')
def Rz(deg): return Matrix.Rotation(math.radians(deg), 4, 'Z')
def Tr(x, y, z): return Matrix.Translation((x, y, z))

def fk(local):
    """local: nome -> matriz 4x4 em eixos do mundo, aplicada em torno do pivô do osso. Devolve a deformação por osso."""
    D = {}
    for n in ORDER:
        hd, tl, par = BONES[n]
        Dp = D[par] if par else Matrix.Identity(4)
        D[n] = Dp @ Tr(*hd) @ local.get(n, Matrix.Identity(4)) @ Tr(*(-hd))
    return D

def apply_pose(local):
    D = fk(local)
    for n in ORDER:
        par = BONES[n][2]
        Dp = D[par] if par else Matrix.Identity(4)
        rig.pose.bones[n].matrix_basis = REST[n].inverted() @ Dp.inverted() @ D[n] @ REST[n]
    return D

def leg_ik(side, hip_dz, foot_dy, foot_dz, foot_pitch=0.0):
    """IK analítica de 2 ossos no plano sagital. foot_dy < 0 = pé à frente. Devolve matrizes locais."""
    hz = HZ + hip_dz; az = ANK + foot_dz
    dy = foot_dy; dzv = hz - az
    d = min(math.hypot(dy, dzv), L1 + L2 - 0.02)
    phi = math.atan2(-dy, dzv)
    a = math.acos(max(-1, min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))))
    k = math.acos(max(-1, min(1, (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2))))
    t1 = phi + a; t2 = t1 - (math.pi - k)
    t1d, t2d = math.degrees(t1), math.degrees(t2)
    return {'thigh.' + side: Rx(-t1d), 'shin.' + side: Rx(-(t2d - t1d)), 'foot.' + side: Rx(-(foot_pitch - t2d))}

PXZ = PX / math.cos(math.radians(PITCH))   # quanto subir em Z para andar 1 px na tela

def pose_stand():
    loc = {'hips': Tr(0, 0, -2.6), 'fire': Tr(0, 0, -500)}
    for s in 'LR':
        loc.update(leg_ik(s, -2.6, -0.6, 0))
        loc['arm.' + s] = Rx(-8); loc['fore.' + s] = Rx(-12)
    loc['tail1'] = Rx(4); loc['tail2'] = Rx(5); loc['tail3'] = Rx(6)
    return loc

STRIDE = 12.0 * PX   # o pé de apoio recua STRIDE/4 = 3 px por quadro na vista lateral
def foot_track(f):
    """Posição do pé esquerdo no quadro f (0..7): (dy, dz, inclinação). Apoio em 0..4, voo em 5..7."""
    f %= 8
    if f <= 4: return (-STRIDE / 2 + STRIDE / 4 * f, 0.0, 0.0)
    return {5: (STRIDE / 4, 2.2, 22.0), 6: (0.0, 3.2, 6.0), 7: (-STRIDE / 4, 1.8, -14.0)}[f]

BOB = [0, -1, 0, 1, 0, -1, 0, 1]   # sobe-e-desce do corpo em pixels inteiros
def pose_walk(f):
    dz = -3.1 + BOB[f] * PXZ
    loc = {'hips': Tr(0, 0, dz), 'fire': Tr(0, 0, -500)}
    for s, off in (('L', 0), ('R', 4)):
        dy, fz, pit = foot_track(f + off)
        loc.update(leg_ik(s, dz, dy - 0.6, fz, pit))
        # braço balança em oposição à perna do mesmo lado
        sw = -math.cos(2 * math.pi * ((f + off) % 8) / 8.0)   # -1 = perna à frente
        loc['arm.' + s] = Rx(-4 - 26 * sw); loc['fore.' + s] = Rx(-12 - 10 * max(0.0, sw))
    ph = 2 * math.pi * f / 8.0
    # movimento secundário: a cauda balança de lado com atraso crescente por segmento e quica 2x por ciclo
    loc['tail1'] = Rz(9 * math.sin(ph - 0.7)) @ Rx(4 + 4 * math.sin(2 * ph - 0.9))
    loc['tail2'] = Rz(12 * math.sin(ph - 1.5)) @ Rx(5 + 5 * math.sin(2 * ph - 1.7))
    loc['tail3'] = Rz(14 * math.sin(ph - 2.3)) @ Rx(6 + 6 * math.sin(2 * ph - 2.5))
    return loc

FIRE0 = [None]
def pose_attack(f):
    """Pepper Breath, 9 quadros: antecipa (0-2), abre e dispara (3-4), bola sai da boca (4-6), volta (7-8)."""
    lean = [0, -6, -11, -4, 9, 8, 5, 2, 0][f]        # tronco: negativo = para trás
    headp = [0, -8, -14, -6, 6, 5, 3, 1, 0][f]       # cabeça: negativo = queixo para cima
    jaw = [0, 0, 4, 22, 30, 26, 14, 4, 0][f]
    crouch = [0, -1, -1, 0, 0, 0, 0, 0, 0][f]
    dz = -2.6 + crouch * PXZ
    loc = {'hips': Tr(0, 0, dz)}
    for s in 'LR':
        loc.update(leg_ik(s, dz, -0.6, 0))
        loc['arm.' + s] = Rx(-8 + [0, 18, 30, 10, -30, -26, -14, -4, 0][f]); loc['fore.' + s] = Rx(-12)
    loc['torso'] = Rx(lean)
    loc['head'] = Rx(headp)
    loc['jaw'] = Rx(jaw)   # abre para baixo
    loc['tail1'] = Rx(4 + [0, -4, -8, 0, 10, 8, 4, 1, 0][f]); loc['tail2'] = Rx(5 + [0, -4, -8, 0, 10, 8, 4, 1, 0][f]); loc['tail3'] = Rx(6)
    # bola de fogo: nasce na boca no quadro 4 (posição lida da cabeça já posada) e avança 6 px por quadro
    if f in (4, 5, 6):
        k = f - 4; sc = [0.7, 1.0, 1.0][k]
        if k == 0: FIRE0[0] = fk(loc)['head'] @ Vector(H(0, -16.5, 14.0))
        c = FIRE0[0] + Vector((0, -6.0 * PX * k, 0))
        piv = BONES['fire'][0]
        loc['fire'] = Tr(*(c - Vector(H(0, -16, 15)))) @ Tr(*piv) @ Matrix.Diagonal((sc, sc, sc, 1)) @ Tr(*(-piv)) @ Tr(0, 0, 0)
    else:
        loc['fire'] = Tr(0, 0, -500)
    return loc

# ---------------------------------------------------------------- render
def bake_vertex_passes():
    bpy.context.view_layer.update()
    Lv = np.array(LIGHT); Cd = np.array(CAM_DIR)
    for ob, bn, grp, ch in PARTS:
        me = ob.data; n = len(me.vertices)
        co = np.empty(n * 3, 'f'); me.vertices.foreach_get('co', co); co = co.reshape(n, 3)
        no = np.empty(n * 3, 'f'); me.vertices.foreach_get('normal', no); no = no.reshape(n, 3)
        M = np.array(ob.matrix_world)
        R3 = M[:3, :3]; sc = np.linalg.norm(R3[:, 0]); R3n = R3 / sc
        w = co @ R3.T + M[:3, 3]; wn = no @ R3n.T
        nl = np.clip(0.5 + 0.5 * (wn @ Lv), 0, 1)
        dp = np.clip((w @ Cd + 60.0) / 120.0, 0, 1)
        col = np.stack([nl, dp, np.zeros(n), np.ones(n)], 1).astype('f')
        me.color_attributes['nl'].data.foreach_set('color', col.ravel())
        me.update()

def render_pose(anim, d, idx, loc, yaw):
    rig.rotation_euler = (0, 0, math.radians(yaw))
    D = apply_pose(loc)
    if anim == 'walk':   # tornozelos projetados na tela, para medir o deslizamento do pé no próprio modelo
        rec = {}
        for sd in 'LR':
            w = Rz(yaw) @ (D['foot.' + sd] @ BONES['foot.' + sd][0])
            rec[sd] = [round(CANVAS / 2 + w.x / PX, 2), round((GROUND_ROW + 1) - w.dot(CAM_UP) / PX, 2), round(w.z, 2)]
        FOOT.setdefault(d, []).append(rec)
    bake_vertex_passes()
    dd = os.path.join(OUT, anim, d); os.makedirs(dd, exist_ok=True)
    sh.color_type = 'OBJECT'; scn.render.filepath = os.path.join(dd, 'f%03d_id.png' % idx)
    bpy.ops.render.render(write_still=True)
    sh.color_type = 'VERTEX'; scn.render.filepath = os.path.join(dd, 'f%03d_nl.png' % idx)
    bpy.ops.render.render(write_still=True)

FOOT = {}
YAW = {'S': 0, 'E': 90, 'N': 180, 'W': -90}
times = {}
t = time.time()
for d, yaw in YAW.items(): render_pose('rotations', d, 0, pose_stand(), yaw)
times['rotations'] = time.time() - t; t = time.time()
for d, yaw in YAW.items():
    for f in range(8): render_pose('walk', d, f, pose_walk(f), yaw)
times['walk'] = time.time() - t; t = time.time()
for d, yaw in YAW.items():
    for f in range(9): render_pose('attack', d, f, pose_attack(f), yaw)
times['attack'] = time.time() - t
times['total_script'] = time.time() - T0

meta = dict(groups=GROUPS, pecas_id=[dict(nome=o.name, grupo=g, cadeia=c, cor=gid_color(i)[:3]) for i, (o, b, g, c) in enumerate(PARTS)], ss=SS, canvas=CANVAS,
            pitch=PITCH, ground_row=GROUND_ROW, px=PX, stride_unidades=STRIDE, px_por_quadro_tela=STRIDE / 4 / PX, bob_px=BOB,
            pecas=len(PARTS), ossos=len(BONES), vertices=sum(len(o.data.vertices) for o, _, _, _ in PARTS),
            faces=sum(len(o.data.polygons) for o, _, _, _ in PARTS), blender=bpy.app.version_string, tempos_s=times,
            depth_range=[-60.0, 60.0], tornozelo_tela_px=FOOT)
json.dump(meta, open(os.path.join(OUT, 'meta.json'), 'w'), indent=1)
if SAVE_BLEND:
    apply_pose(pose_stand()); rig.rotation_euler = (0, 0, 0)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'agumon_f6.blend'))
print('F6_OK', json.dumps(times))
