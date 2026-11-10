#!/usr/bin/env python3
"""
Generator ERD visual (HTML) untuk Front-End System POS Capstone Project.

Sumber model  : kode frontend di src/ (PosContext.jsx, data/initialData.js, komponen)
                 + docs/ERD.md (entitas non-kasir yang direncanakan)
                 + docs/Perencanaan Sistem(1).docx (RBAC admin/kasir)

Jalankan:  python3 docs/generate-erd-visual.py
Output  :  docs/erd-visual.html

Struktur data:
  E      = definisi entitas  (x, y, w, h, label, status, atribut[])
            status 'done' -> sudah ada di kode frontend ini
            status 'plan' -> direncanakan (docs/ERD.md / Perencanaan Sistem)
  EDGES  = relasi            ([titik_path], child, parent, optional)
            titik_path[0]  = sisi/entang child
            titik_path[-1] = sisi/entang parent (panah menunjuk parent)
"""
import html as H
import os

# =====================================================================
#  ENTITAS
# =====================================================================
E = {
 'user':          (40, 60, 240, 135, 'user', 'plan',
   ['id  PK', 'nama', 'username', 'role (admin|kasir)', 'shift', 'created_at']),
 'pelanggan':     (40, 240, 240, 175, 'pelanggan', 'plan',
   ['id  PK', 'nama', 'email', 'phone', 'alamat', 'npwp',
    'loyalty_program_id  FK?', 'created_at', 'updated_at']),
 'loyalty':       (40, 460, 240, 140, 'loyalty_program', 'plan',
   ['id  PK', 'nama', 'poin_per_rupiah', 'rata_poin_ke_rupiah', 'aktif',
    'created_at', 'updated_at']),
 'keranjang':     (40, 650, 240, 185, 'keranjang', 'done',
   ['id', 'produk_id  FK', 'nama', 'harga', 'qty', 'catatan']),
 'kategori':      (330, 60, 240, 115, 'kategori', 'done',
   ['id  PK', 'nama', 'icon', 'created_at']),
 'produk':        (330, 240, 240, 180, 'produk', 'done',
   ['id  PK', 'nama', 'sku', 'kategori_id  FK', 'harga_jual', 'stok',
    'image', 'deskripsi']),
 'transaksi':     (620, 240, 245, 245, 'transaksi', 'done',
   ['id  PK', 'kode', 'tanggal', 'kasir_id  FK', 'pelanggan_id  FK?',
    'order_type (enum)', 'payment_method (enum)', 'nomor_meja',
    'subtotal', 'pajak', 'diskon_nominal', 'total', 'jumlah_bayar',
    'kembalian', 'status']),
 'item_trx':      (620, 560, 245, 195, 'item_transaksi', 'done',
   ['id  PK', 'transaksi_id  FK', 'produk_id  FK', 'diskon_id  FK?',
    'nama', 'harga', 'qty', 'catatan', 'subtotal']),
 'diskon':        (915, 560, 250, 195, 'diskon', 'plan',
   ['id  PK', 'kode', 'nama', 'tipe (persentase|nominal)', 'nilai',
    'mulai_berlaku', 'akhir_berlaku', 'kuota', 'used_quota', 'aktif',
    'created_at', 'updated_at']),
}

def box(k):
    x, y, w, h = E[k][:4]
    return (x, y, x + w, y + h)

# =====================================================================
#  RELASI  (child -> parent)
# =====================================================================
EDGES = [
 # kategori -> produk  (kategori di atas produk, satu kolom)
 ([(450, 175), (450, 240)], 'kategori', 'produk', False),
 # produk -> item_transaksi
 ([(570, 330), (595, 330), (595, 600), (620, 600)], 'produk', 'item_trx', False),
 # keranjang -> produk (state sementara, isi disalin dari produk)
 ([(280, 742), (295, 742), (295, 450), (450, 450), (450, 420)],
  'keranjang', 'produk', False),
 # transaksi -> item_transaksi
 ([(820, 485), (820, 560)], 'transaksi', 'item_trx', False),
 # item_transaksi -> diskon (opsional)
 ([(865, 600), (915, 600)], 'item_trx', 'diskon', True),
 # pelanggan -> loyalty_program (opsional)
 ([(160, 415), (160, 460)], 'pelanggan', 'loyalty', True),
 # pelanggan -> transaksi (opsional: menggantikan customerName)
 ([(280, 330), (305, 330), (305, 25), (780, 25), (780, 240)],
  'pelanggan', 'transaksi', True),
 # user -> transaksi (kasir / created_by)
 ([(280, 127), (288, 127), (288, 8), (800, 8), (800, 240)],
  'user', 'transaksi', False),
]

# =====================================================================
#  VERIFIKASI GEOMETRI
#  - garis relasi tidak boleh menembus kotak entitas lain
#  - titik awal/akhir harus berada pada sisi kotak child/parent
#  - garis relasi tidak boleh saling berpotongan (dihindari lewat routing)
# =====================================================================
def seg_hits_rect(p, q, r, pad=1):
    x1, y1, x2, y2 = r
    if abs(p[0] - q[0]) < 0.01:                     # vertikal
        if not (x1 - pad <= p[0] <= x2 + pad):
            return False
        lo, hi = sorted([p[1], q[1]])
        return not (hi <= y1 or lo >= y2)
    else:                                            # horizontal
        if not (y1 - pad <= p[1] <= y2 + pad):
            return False
        lo, hi = sorted([p[0], q[0]])
        return not (hi <= x1 or lo >= x2)

def seg_cross(p, q, r, s):
    def o(a, b, c):
        v = (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0])
        return (v > 0) - (v < 0)
    d1, d2 = o(r, s, p), o(r, s, q)
    d3, d4 = o(p, q, r), o(p, q, s)
    return d1 * d2 < 0 and d3 * d4 < 0

errs = 0
for pts, child, parent, opt in EDGES:
    for i in range(len(pts) - 1):
        p, q = pts[i], pts[i+1]
        for k in E:
            if k in (child, parent):
                continue
            if seg_hits_rect(p, q, box(k)):
                print(f"X CROSS: {child}->{parent} seg {p}-{q} menembus kotak {k}")
                errs += 1
    rb, cb = box(parent), box(child)
    end, st = pts[-1], pts[0]
    if not (rb[0]-3 <= end[0] <= rb[2]+3 and rb[1]-3 <= end[1] <= rb[3]+3):
        print(f"X ENDPOINT: {child}->{parent} end {end} bukan di sisi {parent}"); errs += 1
    if not (cb[0]-3 <= st[0] <= cb[2]+3 and cb[1]-3 <= st[1] <= cb[3]+3):
        print(f"X START: {child}->{parent} start {st} bukan di sisi {child}"); errs += 1

cross = 0
for i in range(len(EDGES)):
    for j in range(i + 1, len(EDGES)):
        for a in range(len(EDGES[i][0]) - 1):
            for b in range(len(EDGES[j][0]) - 1):
                if seg_cross(EDGES[i][0][a], EDGES[i][0][a+1],
                             EDGES[j][0][b], EDGES[j][0][b+1]):
                    print(f"X GARIS BERPOTONGAN: {EDGES[i][1]}->{EDGES[i][2]}  x  "
                          f"{EDGES[j][1]}->{EDGES[j][2]}")
                    cross += 1
print(f"BOX-CROSS ERRORS: {errs} | persilangan garis: {cross}")

# =====================================================================
#  BUILD SVG
# =====================================================================
W, HT = 1210, 930
S = []
S.append(f'<svg viewBox="0 0 {W} {HT}" xmlns="http://www.w3.org/2000/svg">')
S.append('''<defs>
  <marker id="ah" markerWidth="9" markerHeight="7" refX="8.5" refY="3.5" orient="auto">
    <polygon points="0 0, 9 3.5, 0 7" fill="#64748b"/></marker>
  <marker id="ah2" markerWidth="9" markerHeight="7" refX="8.5" refY="3.5" orient="auto">
    <polygon points="0 0, 9 3.5, 0 7" fill="#fbbf24"/></marker>
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.5"/></pattern>
</defs>''')
S.append('<rect width="100%" height="100%" fill="url(#grid)"/>')

# grup / boundary
S.append('<rect x="28" y="48" width="552" height="797" rx="12" fill="rgba(6,78,59,0.05)" '
         'stroke="#34d399" stroke-width="1" stroke-dasharray="8,4"/>')
S.append('<text x="40" y="40" fill="#34d399" font-size="9" font-weight="600">'
         'MASTER DATA &amp; REFERENSI</text>')
S.append('<rect x="602" y="222" width="276" height="551" rx="12" fill="rgba(8,51,68,0.05)" '
         'stroke="#22d3ee" stroke-width="1" stroke-dasharray="8,4"/>')
S.append('<text x="614" y="214" fill="#22d3ee" font-size="9" font-weight="600">'
         'ALUR TRANSAKSI POS</text>')
S.append('<rect x="900" y="542" width="280" height="231" rx="12" fill="rgba(76,29,149,0.06)" '
         'stroke="#a78bfa" stroke-width="1" stroke-dasharray="8,4"/>')
S.append('<text x="912" y="534" fill="#a78bfa" font-size="9" font-weight="600">'
         'PROMO &amp; LOYALTY</text>')

# relasi (digambar lebih dulu -> berada di belakang kotak)
for pts, child, parent, opt in EDGES:
    d = 'M ' + ' L '.join(f'{x} {y}' for x, y in pts)
    if opt:
        S.append(f'<path d="{d}" fill="none" stroke="#fbbf24" stroke-width="1.6" '
                 f'stroke-dasharray="5,4" marker-end="url(#ah2)"/>')
    else:
        S.append(f'<path d="{d}" fill="none" stroke="#64748b" stroke-width="1.4" '
                 f'marker-end="url(#ah)"/>')

# label relasi (nama kolom FK)
S.append('<text x="500" y="196" fill="#64748b" font-size="8">kategori_id &gt; kategori.id</text>')
S.append('<text x="640" y="588" fill="#fbbf24" font-size="8">diskon_id?</text>')
S.append('<text x="186" y="446" fill="#fbbf24" font-size="8">loyalty_program_id?</text>')
S.append('<text x="430" y="18" fill="#fbbf24" font-size="8">pelanggan_id? (ganti customerName)</text>')
S.append('<text x="812" y="230" fill="#64748b" font-size="8">kasir_id</text>')

# kotak entitas
for k, (x, y, w, h, label, status, attrs) in E.items():
    if status == 'done':
        fill, stroke = 'rgba(6,78,59,0.4)', '#34d399'
    else:
        fill, stroke = 'rgba(76,29,149,0.4)', '#a78bfa'
    dash = ' stroke-dasharray="6,4"' if k == 'keranjang' else ''
    S.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="#0f172a"/>')
    S.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{fill}" '
             f'stroke="{stroke}" stroke-width="1.5"{dash}/>')
    badge = '  (sementara)' if k == 'keranjang' else ''
    S.append(f'<text x="{x+w/2}" y="{y+22}" fill="white" font-size="12" font-weight="600" '
             f'text-anchor="middle">{H.escape(label)}{badge}</text>')
    if attrs:
        S.append(f'<line x1="{x}" y1="{y+32}" x2="{x+w}" y2="{y+32}" stroke="#475569" stroke-width="1"/>')
        ty = y + 49
        for a in attrs:
            col = '#e2e8f0' if 'PK' in a else '#94a3b8'
            S.append(f'<text x="{x+12}" y="{ty}" fill="{col}" font-size="9">{H.escape(a)}</text>')
            ty += 13

# label kardinalitas: "N" di sisi child, "1" di sisi parent
for pts, child, parent, opt in EDGES:
    a, b = pts[0], pts[-1]
    dx, dy = b[0]-a[0], b[1]-a[1]
    L = max((dx*dx + dy*dy) ** 0.5, 1)
    ux, uy = dx/L, dy/L
    nx, ny = -uy, ux
    d = min(20, L * 0.32)
    c_start = (a[0] + ux*d + nx*10, a[1] + uy*d + ny*10)
    c_end   = (b[0] - ux*d - nx*10, b[1] - uy*d - ny*10)
    col = '#fbbf24' if opt else '#94a3b8'
    for (pt, txt) in ((c_end, '1'), (c_start, 'N')):
        S.append(f'<text x="{pt[0]:.0f}" y="{pt[1]:.0f}" fill="{col}" font-size="9" '
                 f'font-weight="600" text-anchor="middle">{txt}</text>')

# legenda
lx, ly = 40, 878
S.append(f'<text x="{lx}" y="{ly}" fill="white" font-size="10" font-weight="600">Legend</text>')
S.append(f'<rect x="{lx}" y="{ly+12}" width="16" height="10" rx="2" fill="rgba(6,78,59,0.4)" '
         f'stroke="#34d399" stroke-width="1"/>')
S.append(f'<text x="{lx+22}" y="{ly+21}" fill="#94a3b8" font-size="8">'
         f'Sudah ada di kode project ini</text>')
S.append(f'<rect x="{lx+240}" y="{ly+12}" width="16" height="10" rx="2" '
         f'fill="rgba(76,29,149,0.4)" stroke="#a78bfa" stroke-width="1"/>')
S.append(f'<text x="{lx+262}" y="{ly+21}" fill="#94a3b8" font-size="8">'
         f'Direncanakan (docs/ERD.md)</text>')
S.append(f'<rect x="{lx+470}" y="{ly+12}" width="16" height="10" rx="2" '
         f'fill="rgba(6,78,59,0.4)" stroke="#34d399" stroke-width="1" stroke-dasharray="4,3"/>')
S.append(f'<text x="{lx+492}" y="{ly+21}" fill="#94a3b8" font-size="8">'
         f'State sementara (keranjang)</text>')
S.append(f'<line x1="{lx+720}" y1="{ly+17}" x2="{lx+736}" y2="{ly+17}" stroke="#64748b" stroke-width="1.4"/>')
S.append(f'<polygon points="{lx+736},{ly+17} {lx+728},{ly+13.5} {lx+728},{ly+20.5}" fill="#64748b"/>')
S.append(f'<text x="{lx+742}" y="{ly+21}" fill="#94a3b8" font-size="8">Relasi wajib</text>')
S.append(f'<line x1="{lx+860}" y1="{ly+17}" x2="{lx+876}" y2="{ly+17}" stroke="#fbbf24" '
         f'stroke-width="1.4" stroke-dasharray="4,4"/>')
S.append(f'<polygon points="{lx+876},{ly+17} {lx+868},{ly+13.5} {lx+868},{ly+20.5}" fill="#fbbf24"/>')
S.append(f'<text x="{lx+882}" y="{ly+21}" fill="#94a3b8" font-size="8">Relasi opsional (FK nullable)</text>')
S.append(f'<text x="{lx}" y="{ly+38}" fill="#475569" font-size="8">'
         f'1 = satu induk (parent)  ·  N = banyak anak (child)  ·  arah panah menuju parent  ·  '
         f'sumber: kode src/ + docs/ERD.md</text>')
S.append('</svg>')
svg = '\n'.join(S)

# =====================================================================
#  HTML
# =====================================================================
HTML = '''<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ERD Front-End System POS Capstone Project</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'JetBrains Mono', monospace; background:#020617; min-height:100vh; padding:2rem; color:#fff; }
  .container { max-width:1320px; margin:0 auto; }
  .header { margin-bottom:1rem; }
  .header-row { display:flex; align-items:center; gap:1rem; margin-bottom:.5rem; }
  .pulse-dot { width:12px; height:12px; background:#34d399; border-radius:50%; animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  h1 { font-size:1.5rem; font-weight:700; letter-spacing:-.025em; }
  .subtitle { color:#94a3b8; font-size:.875rem; margin-left:1.75rem; }
  .warn { margin-top:1rem; padding:.85rem 1rem; border-radius:.6rem; border:1px solid #fbbf24;
          background:rgba(120,53,15,.25); color:#fcd34d; font-size:.75rem; line-height:1.6; }
  .warn b { color:#fff; }
  .warn code { color:#fde68a; }
  .diagram-container { background:rgba(15,23,42,.5); border-radius:1rem; border:1px solid #1e293b;
                        padding:1.5rem; overflow-x:auto; margin-top:1.25rem; }
  svg { width:100%; min-width:1100px; display:block; }
  .cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:1rem; margin-top:2rem; }
  .card { background:rgba(15,23,42,.5); border-radius:.75rem; border:1px solid #1e293b; padding:1.25rem; }
  .card-header { display:flex; align-items:center; gap:.5rem; margin-bottom:.75rem; }
  .card-dot { width:8px; height:8px; border-radius:50%; }
  .card-dot.violet{background:#a78bfa} .card-dot.emerald{background:#34d399}
  .card-dot.amber{background:#fbbf24} .card-dot.cyan{background:#22d3ee}
  .card h3 { font-size:.875rem; font-weight:600; }
  .card ul { list-style:none; color:#94a3b8; font-size:.72rem; }
  .card li { margin-bottom:.45rem; line-height:1.55; }
  .card li b { color:#e2e8f0; font-weight:600; }
  .card li code { color:#fbbf24; font-size:.68rem; }
  table.rel { width:100%; border-collapse:collapse; margin-top:.75rem; font-size:.7rem; }
  table.rel th, table.rel td { text-align:left; padding:.35rem .5rem; border-bottom:1px solid #1e293b; }
  table.rel th { color:#fbbf24; font-weight:600; }
  table.rel td { color:#94a3b8; }
  table.rel td:first-child { color:#e2e8f0; }
  .note { color:#64748b; font-size:.7rem; margin-top:.75rem; line-height:1.55; }
  .footer { text-align:center; margin-top:1.5rem; color:#475569; font-size:.75rem; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="header-row"><div class="pulse-dot"></div>
      <h1>ERD — Front-End System POS Capstone Project</h1></div>
    <p class="subtitle">9 entitas · 8 relasi · model diturunkan dari kode <code>src/</code>
       + <code>docs/ERD.md</code> + dokumen Perencanaan Sistem</p>
  </div>

  <div class="warn">
    <b>Catatan sumber:</b> model ini disusun untuk <b>project POS frontend ini</b> (React + Vite, state di
    <code>PosContext</code>, data mock di <code>src/data/initialData.js</code>). Entitas backend Codasuaka yang
    <b>tidak ada di project ini</b> — <code>Instansi</code>, <code>Outlet</code>,
    <code>KategoriTransaksi</code>, <code>TransaksiKas</code>, <code>ApprovalLog</code> — serta
    <code>Stok</code> sebagai tabel terpisah (di sini <b>stok adalah kolom</b> pada <code>produk</code>)
    <b>tidak dimuat</b>. Multi-tenancy / <code>TenantScope</code> juga tidak relevan karena project ini
    tidak punya backend. <code>order_type</code> dan <code>payment_method</code> dimodelkan sebagai
    <b>atribut enum</b>, bukan tabel, karena di kode keduanya memang literal string.
  </div>

  <div class="diagram-container">
__SVG__
  </div>

  <div class="cards">
    <div class="card">
      <div class="card-header"><div class="card-dot emerald"></div>
        <h3>Sudah Ada di Kode (project ini)</h3></div>
      <ul>
        <li>• <b>produk</b> — <code>INITIAL_PRODUCTS</code>: id, name, sku, category, price, stock, image, description</li>
        <li>• <b>kategori</b> — <code>INITIAL_CATEGORIES</code>: id, name, icon (kopi, non-kopi, makanan, snack, dessert)</li>
        <li>• <b>transaksi</b> — <code>INITIAL_TRANSACTIONS</code>: id, date, cashier, orderType, tableNumber, customerName, subtotal, tax, discount, total, paymentMethod, amountPaid, change, status</li>
        <li>• <b>item_transaksi</b> — array <code>trx.items[]</code>: id, name, price, quantity, note</li>
        <li>• <b>keranjang</b> — state <code>cart[]</code> di <code>PosContext</code> (sementara, tidak dipersist)</li>
        <li>• Persistensi saat ini <code>localStorage</code>: <code>pos_products</code>, <code>pos_transactions</code></li>
      </ul>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-dot violet"></div>
        <h3>Direncanakan (docs/ERD.md)</h3></div>
      <ul>
        <li>• <b>pelanggan</b> — id, nama, email, phone, alamat, npwp, created_at, updated_at</li>
        <li>• <b>diskon</b> — id, kode, nama, tipe, nilai, masa berlaku, kuota, used_quota, aktif</li>
        <li>• <b>loyalty_program</b> — id, nama, poin_per_rupiah, rata_poin_ke_rupiah, aktif</li>
        <li>• <b>user</b> — id, nama, username, role (admin/kasir), shift — untuk RBAC sesuai dokumen Perencanaan Sistem</li>
        <li>• Planned change 1: <code>transaksi.customerName</code> (string) &rarr; <code>transaksi.pelanggan_id</code> (FK)</li>
        <li>• Planned change 2: <code>produk.category</code> (string) &rarr; <code>produk.kategori_id</code> (FK)</li>
        <li>• Planned change 3: <code>transaksi.cashier</code> (hardcoded) &rarr; <code>transaksi.kasir_id</code> (FK)</li>
      </ul>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-dot amber"></div>
        <h3>Relasi Kunci</h3></div>
      <table class="rel">
        <tr><th>Child</th><th>Parent</th><th>Kolom FK</th></tr>
        <tr><td>produk</td><td>kategori</td><td>kategori_id</td></tr>
        <tr><td>item_transaksi</td><td>transaksi</td><td>transaksi_id</td></tr>
        <tr><td>item_transaksi</td><td>produk</td><td>produk_id</td></tr>
        <tr><td>item_transaksi</td><td>diskon</td><td>diskon_id (nullable)</td></tr>
        <tr><td>transaksi</td><td>pelanggan</td><td>pelanggan_id (nullable)</td></tr>
        <tr><td>transaksi</td><td>user</td><td>kasir_id</td></tr>
        <tr><td>pelanggan</td><td>loyalty_program</td><td>loyalty_program_id (nullable)</td></tr>
        <tr><td>keranjang</td><td>produk</td><td>produk_id (sementara)</td></tr>
      </table>
      <p class="note">Konvensi FK: snake_case + suffix <code>_id</code>. Relasi opsional ditandai garis
      putus-putus amber. Semua entitas planned memakai <code>created_at</code> / <code>updated_at</code>.
      <b>Tidak ada tabel stok terpisah</b> — pengurangan stok terjadi di <code>produk.stock</code>
      (<code>PosContext.completeTransaction</code>).</p>
    </div>
  </div>

  <p class="footer">ERD Front-End System POS Capstone Project · generated dari src/ + docs/ERD.md ·
     generator: docs/generate-erd-visual.py</p>
</div>
</body>
</html>'''

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'erd-visual.html')
open(out, 'w').write(HTML.replace('__SVG__', svg))
print('written', out)
