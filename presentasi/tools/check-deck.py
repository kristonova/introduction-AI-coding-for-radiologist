#!/usr/bin/env python3
"""Pemeriksaan statis deck presentasi.

Menegakkan aturan yang tidak boleh dilanggar dan yang mudah terlewat saat
menyunting 46 slide:

1. Privasi. Deck tidak boleh merujuk `dataset/` sama sekali - direktori itu
   berisi berkas dengan nama pasien asli. Hanya `assets/pediatric_opg/` (CC0)
   yang boleh menjadi sumber.
2. Aset. Setiap path gambar yang disebut slide benar-benar ada di disk.
3. Widget. Setiap `widget:` yang disebut slide terdaftar di widgets*.js.
4. Kelengkapan. Setiap slide punya id unik, judul atau label, dan catatan
   presenter - catatan itu yang membuat deck bisa dipakai ulang.
5. Offline. Tidak ada URL eksternal yang dimuat saat runtime.
6. Manifest figur cocok dengan isi folder.

    python presentasi/tools/check-deck.py

Keluar dengan kode 1 bila ada pelanggaran. Pemeriksaan tata letak (apakah isi
slide muat di panggung 1280x720) tidak bisa dilakukan tanpa browser; lihat
bagian "Verifikasi" di README deck.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

DECK = Path(__file__).resolve().parents[1]
ASSETS = DECK / 'assets'
SLIDE_FILES = sorted((ASSETS / 'deck').glob('slides-*.js'))
WIDGET_FILES = sorted((ASSETS / 'deck').glob('widgets*.js'))

problems: list[str] = []
notes: list[str] = []


def fail(msg: str) -> None:
    problems.append(msg)


def read(p: Path) -> str:
    return p.read_text(encoding='utf-8')


# --------------------------------------------------------------------------
# 1. Privasi - tidak boleh ada jejak direktori dataset
# --------------------------------------------------------------------------

def check_privacy() -> None:
    pattern = re.compile(r'\bdataset/(?!card)', re.IGNORECASE)
    for p in list(SLIDE_FILES) + WIDGET_FILES + [DECK / 'index.html']:
        for i, line in enumerate(read(p).splitlines(), 1):
            if pattern.search(line):
                fail(f'{p.name}:{i} merujuk direktori dataset/ '
                     f'(berisi nama pasien asli, tidak boleh dipakai deck)')
    notes.append('privasi: tidak ada rujukan ke dataset/')


# --------------------------------------------------------------------------
# 2. Aset yang dirujuk harus ada
# --------------------------------------------------------------------------

def check_assets() -> None:
    ref = re.compile(r'["\'](assets/[A-Za-z0-9_\-./]+\.(?:png|jpg|jpeg|svg|webp|otf|woff2|css|js))["\']')
    seen: set[str] = set()
    for p in list(SLIDE_FILES) + WIDGET_FILES + [DECK / 'index.html']:
        for m in ref.finditer(read(p)):
            seen.add(m.group(1))

    # Widget menyusun sebagian path saat berjalan (mis. 'f7-opg-' + CASE + '.png'),
    # sehingga tidak tertangkap pemindaian literal di atas. Kombinasi yang mungkin
    # dibentuk widget diperiksa satu per satu di sini.
    cases = ['test_cate1_000', 'test_cate1_001', 'test_cate1_004', 'test_cate1_012']
    frames = ['asli', 'he', 'clahe10', 'clahe20', 'clahe40', 'clahe80']
    for c in cases:
        seen.add(f'assets/figures/f7-opg-{c}.png')
        for conf in ('025', '045'):
            seen.add(f'assets/figures/f7-overlay-{c}-conf{conf}.png')
    for f in frames:
        seen.add(f'assets/figures/f3-kontras-{f}.png')
        seen.add(f'assets/figures/f4-kontras-{f}-hist.png')

    missing = sorted(r for r in seen if not (DECK / r).exists())
    for r in missing:
        fail(f'aset tidak ditemukan: {r}')
    notes.append(f'aset: {len(seen) - len(missing)}/{len(seen)} berkas ditemukan '
                 f'(termasuk path yang disusun widget saat berjalan)')


# --------------------------------------------------------------------------
# 3-4. Slide: id unik, judul, catatan, widget terdaftar
# --------------------------------------------------------------------------

def check_slides() -> None:
    ids: list[str] = []
    registered = set()
    for p in WIDGET_FILES:
        registered |= set(re.findall(r"W\['([a-z0-9\-]+)'\]", read(p)))

    used_widgets = set()
    for p in SLIDE_FILES:
        text = read(p)
        # Setiap slide adalah satu blok D.push({ ... }). Sebagian slide disusun
        # di dalam IIFE bersarang sehingga indentasi penutupnya berbeda; pola di
        # bawah karena itu menerima indentasi berapa pun.
        for block in re.findall(r'D\.push\(\{(.*?)\n\s*\}\);', text, re.S):
            m = re.search(r"id:\s*'([^']+)'", block)
            if not m:
                fail(f'{p.name}: ada D.push tanpa id')
                continue
            sid = m.group(1)
            ids.append(sid)

            if not re.search(r"notes:\s*'", block):
                fail(f'{sid}: tidak punya catatan presenter (notes)')
            if not re.search(r"(title|label):\s*'", block):
                fail(f'{sid}: tidak punya title maupun label')
            if not re.search(r'chapter:\s*\d', block):
                fail(f'{sid}: tidak punya nomor bab (chapter)')

            w = re.search(r"widget:\s*'([^']+)'", block)
            if w:
                used_widgets.add(w.group(1))
                if w.group(1) not in registered:
                    fail(f'{sid}: memakai widget "{w.group(1)}" yang tidak terdaftar')
                if 'data-widget="' + w.group(1) + '"' not in block:
                    fail(f'{sid}: menyebut widget "{w.group(1)}" tetapi markupnya '
                         f'tidak memuat data-widget yang cocok')

    dupes = {i for i in ids if ids.count(i) > 1}
    for d in sorted(dupes):
        fail(f'id slide ganda: {d}')

    unused = registered - used_widgets
    for u in sorted(unused):
        fail(f'widget "{u}" terdaftar tetapi tidak dipakai slide mana pun')

    notes.append(f'slide: {len(ids)} slide, semuanya punya id unik, judul, dan catatan')
    notes.append(f'widget: {len(registered)} terdaftar, {len(used_widgets)} dipakai')


# --------------------------------------------------------------------------
# 5. Offline - tidak ada sumber daya eksternal yang dimuat
# --------------------------------------------------------------------------

def check_offline() -> None:
    url = re.compile(r'(?:src|href)\s*=\s*["\']https?://', re.IGNORECASE)
    for p in list(SLIDE_FILES) + WIDGET_FILES + [DECK / 'index.html']:
        for i, line in enumerate(read(p).splitlines(), 1):
            if url.search(line):
                fail(f'{p.name}:{i} memuat sumber daya eksternal; deck harus utuh dari file://')

    for p in (ASSETS / 'ds').rglob('*.css'):
        for i, line in enumerate(read(p).splitlines(), 1):
            if '@import' in line and 'http' in line and not line.lstrip().startswith(('/*', '*')):
                fail(f'ds/{p.name}:{i} masih mengimpor font dari internet')
    notes.append('offline: tidak ada sumber daya eksternal yang dimuat')


# --------------------------------------------------------------------------
# 6. Manifest figur cocok dengan isi folder
# --------------------------------------------------------------------------

def check_figures() -> None:
    mf = ASSETS / 'figures' / 'manifest.json'
    if not mf.exists():
        fail('assets/figures/manifest.json tidak ada; jalankan tools/build-figures.py')
        return
    manifest = json.loads(read(mf))
    listed = {f['name']: f for f in manifest['files']}
    on_disk = {p.name for p in (ASSETS / 'figures').glob('*.png')}

    for name in sorted(on_disk - set(listed)):
        fail(f'figur {name} ada di disk tetapi tidak tercatat di manifest')
    for name in sorted(set(listed) - on_disk):
        fail(f'figur {name} tercatat di manifest tetapi tidak ada di disk')

    bad = []
    for name, meta in listed.items():
        p = ASSETS / 'figures' / name
        if not p.exists():
            continue
        h = hashlib.sha256(p.read_bytes()).hexdigest()
        if h != meta['sha256']:
            bad.append(name)
    for name in bad:
        fail(f'figur {name} berubah tanpa regenerasi manifest')

    total = sum(f['bytes'] for f in manifest['files'])
    notes.append(f'figur: {len(listed)} berkas, {total / 1e6:.1f} MB, checksum cocok')


def main() -> int:
    for fn in (check_privacy, check_assets, check_slides, check_offline, check_figures):
        fn()

    for n in notes:
        print(f'  ok   {n}')
    if problems:
        print()
        for p in problems:
            print(f'  GAGAL {p}')
        print(f'\n{len(problems)} masalah ditemukan.')
        return 1
    print('\nSemua pemeriksaan lolos.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
