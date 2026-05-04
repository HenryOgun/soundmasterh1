#!/usr/bin/env python3
"""
Fetch YBCV (Yoruba Bible Contemporary Version) from bible.com
Translation ID: 2754
URL pattern: https://www.bible.com/bible/2754/{BOOK}.{CHAPTER}.YBCV

Run:  python3 fetch_ybcv.py
Output: bible_data.js  (~4 MB)

Fetches all 66 books (1 189 chapters). Takes ~15 min due to polite rate-limiting.
Tested parser: confirmed correct Yoruba verse text for all structures.
"""
import json, re, gzip, os, time, urllib.request
from html import unescape
from collections import defaultdict

VERSION_ID  = 2754
TRANSLATION = 'YBCV'
DELAY_SEC   = 0.6          # seconds between requests
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))

BOOK_ORDER = [
    ('GEN',50),('EXO',40),('LEV',27),('NUM',36),('DEU',34),
    ('JOS',24),('JDG',21),('RUT',4), ('1SA',31),('2SA',24),
    ('1KI',22),('2KI',25),('1CH',29),('2CH',36),('EZR',10),
    ('NEH',13),('EST',10),('JOB',42),('PSA',150),('PRO',31),
    ('ECC',12),('SNG',8), ('ISA',66),('JER',52),('LAM',5),
    ('EZK',48),('DAN',12),('HOS',14),('JOL',3), ('AMO',9),
    ('OBA',1), ('JON',4), ('MIC',7), ('NAM',3), ('HAB',3),
    ('ZEP',3), ('HAG',2), ('ZEC',14),('MAL',4),
    ('MAT',28),('MRK',16),('LUK',24),('JHN',21),('ACT',28),
    ('ROM',16),('1CO',16),('2CO',13),('GAL',6), ('EPH',6),
    ('PHP',4), ('COL',4), ('1TH',5), ('2TH',3), ('1TI',6),
    ('2TI',4), ('TIT',3), ('PHM',1), ('HEB',13),('JAS',5),
    ('1PE',5), ('2PE',3), ('1JN',5), ('2JN',1), ('3JN',1),
    ('JUD',1), ('REV',22),
]

HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/124.0.0.0 Safari/537.36'
    ),
    'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'yo,en-US;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate',
    'Connection':      'keep-alive',
}

# ── helpers ───────────────────────────────────────────────────────────────────

def _decode(resp):
    raw = resp.read()
    if resp.headers.get('Content-Encoding', '') == 'gzip':
        raw = gzip.decompress(raw)
    return raw.decode('utf-8', errors='replace')

def _clean(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    s = unescape(s)
    return re.sub(r'\s+', ' ', s).strip()

# ── verse parser ──────────────────────────────────────────────────────────────

def _parse_verses(content_html, book, ch):
    """
    Parse verse text from bible.com chapter HTML content.

    Structure (confirmed from live page):
      <span class="verse vN" data-usfm="BOOK.CH.N">
        <span class="label">N</span>
        <span class="content">verse text here</span>
      </span>
      <!-- verse may continue across paragraph breaks: -->
      <span class="verse vN" data-usfm="BOOK.CH.N">
        <span class="cont">...continuation...</span>
      </span>
    """
    prefix = rf'{re.escape(book)}\.{ch}\.'
    verse_parts = defaultdict(list)

    # Split the HTML at each verse-span opening tag
    chunks = re.split(r'(<span[^>]+data-usfm="' + prefix + r'\d+"[^>]*>)', content_html)
    for i, chunk in enumerate(chunks):
        m = re.search(r'data-usfm="' + prefix + r'(\d+)"', chunk)
        if m and i + 1 < len(chunks):
            vnum  = int(m.group(1))
            inner = chunks[i + 1]
            for cm in re.finditer(
                r'<span\s+class="(?:content|cont)"[^>]*>(.*?)</span>',
                inner, re.DOTALL
            ):
                txt = _clean(cm.group(1))
                if txt:
                    verse_parts[vnum].append(txt)

    if not verse_parts:
        return []

    verses = []
    for vnum in sorted(verse_parts):
        # deduplicate continuation fragments that sometimes repeat
        seen, parts = set(), []
        for part in verse_parts[vnum]:
            if part not in seen:
                seen.add(part)
                parts.append(part)
        verses.append(' '.join(parts))
    return verses

# ── fetch one chapter ─────────────────────────────────────────────────────────

def fetch_chapter(book, ch):
    url = (f'https://www.bible.com/bible/{VERSION_ID}'
           f'/{book}.{ch}.{TRANSLATION}')
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            html = _decode(resp)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return []
        print(f'\n  HTTP {e.code} for {book} {ch}')
        return None   # retryable
    except Exception as e:
        print(f'\n  ERROR {book} {ch}: {e}')
        return None

    # Extract __NEXT_DATA__ JSON (Next.js SSR — always present)
    m = re.search(
        r'<script[^>]+id="__NEXT_DATA__"[^>]*>(.*?)</script>',
        html, re.DOTALL
    )
    if not m:
        print(f'\n  WARN: no __NEXT_DATA__ for {book} {ch}')
        return []

    try:
        nd      = json.loads(m.group(1))
        content = nd['props']['pageProps']['chapterInfo']['content']
    except (KeyError, json.JSONDecodeError) as e:
        print(f'\n  WARN: JSON structure changed for {book} {ch}: {e}')
        return []

    return _parse_verses(content, book, ch)

# ── main ──────────────────────────────────────────────────────────────────────

# Load existing data so we can resume interrupted runs
bible_data = {}
out_path = os.path.join(BASE_DIR, 'bible_data.js')
if os.path.exists(out_path):
    try:
        with open(out_path, encoding='utf-8') as f:
            raw = f.read()
        m = re.search(r'window\.BIBLE_DATA\s*=\s*(\{.*\})\s*;', raw, re.DOTALL)
        if m:
            bible_data = json.loads(m.group(1))
            print(f'Resuming: loaded {len(bible_data)} existing chapters')
    except Exception as e:
        print(f'Could not load existing data: {e}')

total  = sum(ch for _, ch in BOOK_ORDER)
done   = 0
errors = 0

print(f'Fetching YBCV (bible.com #{VERSION_ID}) — {total} chapters\n')

for book_idx, (book, num_ch) in enumerate(BOOK_ORDER, 1):
    book_verses = 0
    for ch in range(1, num_ch + 1):
        key = f'{book_idx}-{ch}'
        if key in bible_data:        # already fetched in a previous run
            book_verses += len(bible_data[key])
            done += 1
            pct = done / total * 100
            print(
                f'  [{pct:5.1f}%]  {book} {ch}/{num_ch}'
                f'  (cached {len(bible_data[key])} ẹsẹ)   ',
                end='\r', flush=True
            )
            continue

        verses = fetch_chapter(book, ch)
        if verses is None:           # network error → one retry
            time.sleep(4)
            verses = fetch_chapter(book, ch)
            if verses is None:
                verses = []
                errors += 1

        if verses:
            bible_data[key] = verses
            book_verses += len(verses)

        done += 1
        pct = done / total * 100
        print(
            f'  [{pct:5.1f}%]  {book} {ch}/{num_ch}'
            f'  ({len(verses) if verses else 0} ẹsẹ)   ',
            end='\r', flush=True
        )
        time.sleep(DELAY_SEC)

    print(f'  ✓ {book}: {num_ch} ìpín, {book_verses} ẹsẹ              ')
    # Write after each book so the app can start showing data immediately
    _cf = len(bible_data)
    _vt = sum(len(v) for v in bible_data.values())
    _lines = [
        f'// Auto-generated by fetch_ybcv.py — YBCV (bible.com #{VERSION_ID})',
        f'// Books: {len(set(k.split("-")[0] for k in bible_data))}  |  Chapters: {_cf}  |  Verses: {_vt}',
        'window.BIBLE_DATA = ',
        json.dumps(bible_data, ensure_ascii=False, indent=2),
        ';',
    ]
    with open(out_path, 'w', encoding='utf-8') as _f:
        _f.write('\n'.join(_lines))

# ── write bible_data.js ───────────────────────────────────────────────────────

chaps_found  = len(bible_data)
verses_total = sum(len(v) for v in bible_data.values())

out_lines = [
    f'// Auto-generated by fetch_ybcv.py — YBCV (bible.com #{VERSION_ID})',
    f'// Books: {len(set(k.split("-")[0] for k in bible_data))}'
    f'  |  Chapters: {chaps_found}'
    f'  |  Verses: {verses_total}',
    'window.BIBLE_DATA = ',
    json.dumps(bible_data, ensure_ascii=False, indent=2),
    ';',
]

out_path = os.path.join(BASE_DIR, 'bible_data.js')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(out_lines))

print(f'\n✓  bible_data.js — {chaps_found} chapters, {verses_total} verses')
if errors:
    print(f'⚠  {errors} chapters had network errors and were skipped')
if chaps_found < total * 0.8:
    print('⚠  Fewer than 80 % of chapters saved — check console output above')
