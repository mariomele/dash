# Organigramma → org.json nella radice del progetto (MAI in data/ e mai pubblicato: render.js lo cifra con la password in org.pw)
# uso: python3 -I scripts/org.py organigramma.xlsx|.csv [--al AAAA-MM-GG]
# Tabella semplice, prima riga = intestazioni: Area, Reparto, Nome, Ruolo (R = responsabile, V = vice, vuoto = altri), T (facoltativa, 1 = sigla).
#   Area «Vertice»            → vertice dell'azienda (amministratori), Reparto vuoto
#   Area «Box: <titolo>»      → riquadro accanto al vertice (sede estera, consiglio…): Nome = persona, Reparto = ruolo
#   Reparto vuoto + Ruolo R   → responsabile dell'area
# Se il documento dell'azienda è un disegno a griglia (aree in colonna, reparti in MAIUSCOLO), scrivi un parser apposta:
# conta solo che esca lo stesso org.json. Ogni nome del foglio deve finire nel file (controllo in fondo).
import csv, json, re, sys, zipfile, html, datetime

def rows_xlsx(f):
    z = zipfile.ZipFile(f)
    ss = [html.unescape(''.join(re.findall(r'<t[^>]*>([^<]*)</t>', si))) for si in re.findall(r'<si>(.*?)</si>', z.read('xl/sharedStrings.xml').decode(), re.S)] if 'xl/sharedStrings.xml' in z.namelist() else []
    out = []
    for row in re.findall(r'<row[^>]*>(.*?)</row>', z.read('xl/worksheets/sheet1.xml').decode(), re.S):
        r = {}
        for col, t, body in re.findall(r'<c r="([A-Z]+)\d+"([^>]*?)(?:/>|>(.*?)</c>)', row, re.S):
            v = re.search(r'<v>([^<]*)</v>', body or '') or re.search(r'<t[^>]*>([^<]*)</t>', body or '')
            if v: r[col] = ss[int(v.group(1))] if 't="s"' in t else html.unescape(v.group(1))
        out.append([r.get(c, '') for c in 'ABCDE'])
    return out

def main(f, al=None):
    R = rows_xlsx(f) if f.endswith('.xlsx') else list(csv.reader(open(f, encoding='utf-8-sig')))
    head = [h.strip().lower() for h in R[0]]
    ix = {k: head.index(k) for k in ('area', 'reparto', 'nome', 'ruolo') if k in head}
    assert {'area', 'nome'} <= set(ix), 'servono almeno le colonne Area e Nome'
    g = lambda r, k: (r[ix[k]] if k in ix and ix[k] < len(r) else '').strip()
    gt = lambda r: (r[head.index('t')] if 't' in head and head.index('t') < len(r) else '').strip() in ('1', 'x', 'si', 'sì')
    top, box, aree, n = [], {}, {}, 0
    for r in R[1:]:
        a, u, nm, ru = g(r, 'area'), g(r, 'reparto'), g(r, 'nome'), g(r, 'ruolo').upper()[:1]
        if not nm: continue
        n += 1
        if a.lower() == 'vertice': top.append(nm); continue
        if a.lower().startswith('box:'): box.setdefault(a[4:].strip(), []).append([nm, u]); continue
        A = aree.setdefault(a, {'nome': a, 'capo': '', 'unita': []})
        if not u and ru == 'R': A['capo'] = nm; continue
        U = next((x for x in A['unita'] if x['nome'] == (u or 'Altri')), None)
        if not U: U = {'nome': u or 'Altri', 'p': []}; A['unita'].append(U)
        U['p'].append([nm, ru if ru in ('R', 'V') else '', 1 if gt(r) else 0])
    o = {'at': al or datetime.date.today().isoformat(), 'top': ' · '.join(top),
         'box': [{'k': k, 'n': v[0][0], 's': v[0][1]} for k, v in box.items()], 'aree': list(aree.values())}
    assert n == len(top) + sum(len(v) for v in box.values()) + sum(bool(a['capo']) + sum(len(u['p']) for u in a['unita']) for a in o['aree']), 'persone perse'
    json.dump(o, open('org.json', 'w'), ensure_ascii=False, indent=1)
    print('org.json', o['at'], len(o['aree']), 'aree', sum(len(a['unita']) for a in o['aree']), 'reparti', n, 'righe')

if __name__ == '__main__':
    a = sys.argv[1:]
    main(a[0], a[a.index('--al') + 1] if '--al' in a else None)
