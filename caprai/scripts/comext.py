# Export per codice doganale da Eurostat Comext DS-045409 (gratis, senza chiave) → data/export.json
# Uso (dalla cartella del progetto):
#   python3 -I scripts/comext.py --codici "200210=Pomodori interi o in pezzi" "200290=Passate e polpe" \
#          [--da 2019] [--reporter IT] [--confronto IT ES PT GR NL DE FR BE] [--top 15]
# Codici HS6: cercali su https://www.tarifdouanier.eu o nel TARIC. Gli anni senza dati annuali (l'anno in corso) finiscono in "parz".
import argparse, json, os, urllib.parse, urllib.request
from datetime import date

B = 'https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409?'
V, Q = 'VALUE_IN_EUROS', 'QUANTITY_IN_100KG'
AGG = ('WORLD', 'EXT', 'INT', 'EU', 'EA')  # partner aggregati, non paesi
NOMI = dict(x.split('=') for x in (
    'AT=Austria BE=Belgio BG=Bulgaria CY=Cipro CZ=Cechia DE=Germania DK=Danimarca EE=Estonia ES=Spagna FI=Finlandia '
    'FR=Francia GR=Grecia HR=Croazia HU=Ungheria IE=Irlanda IT=Italia LT=Lituania LU=Lussemburgo LV=Lettonia MT=Malta '
    'NL=Paesi_Bassi PL=Polonia PT=Portogallo RO=Romania SE=Svezia SI=Slovenia SK=Slovacchia GB=Regno_Unito CH=Svizzera '
    'NO=Norvegia IS=Islanda US=Stati_Uniti CA=Canada MX=Messico BR=Brasile AR=Argentina CL=Cile JP=Giappone CN=Cina '
    'HK=Hong_Kong KR=Corea_del_Sud TW=Taiwan IN=India SG=Singapore TH=Thailandia VN=Vietnam ID=Indonesia MY=Malesia PH=Filippine '
    'AU=Australia NZ=Nuova_Zelanda ZA=Sudafrica EG=Egitto MA=Marocco TN=Tunisia DZ=Algeria LY=Libia NG=Nigeria '
    'IL=Israele TR=Turchia AE=Emirati_Arabi SA=Arabia_Saudita QA=Qatar KW=Kuwait LB=Libano JO=Giordania '
    'RU=Russia UA=Ucraina BY=Bielorussia RS=Serbia BA=Bosnia AL=Albania MK=Macedonia_del_Nord ME=Montenegro GE=Georgia').split())


def get(**kw):
    q = [(k, v) for k, vs in kw.items() for v in (vs if isinstance(vs, list) else [vs])] + [('flow', 2)]
    with urllib.request.urlopen(B + urllib.parse.urlencode(q), timeout=300) as r:
        d = json.load(r)
    ids, size = d['id'], d['size']
    cats = [sorted(d['dimension'][i]['category']['index'], key=d['dimension'][i]['category']['index'].get) for i in ids]
    out = {}
    for k, v in d['value'].items():  # indice piatto json-stat → chiave per dimensione
        k, key = int(k), []
        for s, c in zip(reversed(size), reversed(cats)):
            key.append(c[k % s]); k //= s
        key = dict(zip(reversed(ids), key))
        out[(key['reporter'], key['partner'], key['product'], key['indicators'], key['time'])] = v
    return out, d


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--codici', nargs='+', required=True, help='HS6=nome')
    ap.add_argument('--da', default='2019')
    ap.add_argument('--reporter', default='IT')
    ap.add_argument('--confronto', nargs='*', default=['IT', 'ES', 'DE', 'FR', 'NL', 'PL', 'BE', 'AT'])
    ap.add_argument('--top', type=int, default=15)
    ap.add_argument('--out', default='data/export.json')
    a = ap.parse_args()
    COD = dict(c.split('=', 1) for c in a.codici); P = list(COD); R = a.reporter
    s = lambda c, rep, part, ind, t: None if all(c.get((rep, part, p, ind, t)) is None for p in P) else sum(c.get((rep, part, p, ind, t)) or 0 for p in P)
    tq = lambda q: round(q / 10)  # quintali → tonnellate

    it, d = get(reporter=R, partner='WORLD', product=P, indicators=[V, Q], freq='A', sinceTimePeriod=a.da)
    anni = sorted({int(k[4]) for k in it}); last = str(anni[-1])
    IT = {p: {str(y): [round(it[(R, 'WORLD', p, V, str(y))]), tq(it.get((R, 'WORLD', p, Q, str(y))) or 0)]
              for y in anni if (R, 'WORLD', p, V, str(y)) in it} for p in P}

    dc, _ = get(reporter=R, product=P, indicators=[V, Q], freq='A', sinceTimePeriod=a.da)
    paesi = {k[1] for k in dc if not k[1].startswith(AGG)}
    top = sorted(paesi, key=lambda x: -(s(dc, R, x, V, last) or 0))[:a.top]
    dest = [{'p': x, 'nome': NOMI.get(x, x).replace('_', ' '),
             'v': {str(y): round(v) for y in anni if (v := s(dc, R, x, V, str(y))) is not None},
             't': {str(y): tq(q) for y in anni if (q := s(dc, R, x, Q, str(y))) is not None}} for x in top]

    rc, _ = get(reporter=a.confronto, partner='WORLD', product=P, indicators=V, freq='A', sinceTimePeriod=a.da)
    rep = {r: {str(y): round(v) for y in anni if (v := s(rc, r, 'WORLD', V, str(y))) is not None} for r in a.confronto}

    # anno in corso: stessi mesi dell'anno prima, fino all'ultimo mese pubblicato
    A = int(last) + 1; parz = None
    mc, _ = get(reporter=R, partner='WORLD', product=P, indicators=[V, Q], freq='M', sinceTimePeriod=f'{A-1}-01')
    mm = [int(k[4][5:]) for k in mc if k[4].startswith(str(A))]
    if mm:
        M = max(mm); ms = lambda y: [f'{y}-{m:02d}' for m in range(1, M + 1)]
        tot = lambda y, ind: sum(mc.get((R, 'WORLD', p, ind, t)) or 0 for p in P for t in ms(y))
        MES = 'gen feb mar apr mag giu lug ago set ott nov dic'.split()
        parz = {'per': f'gen-{MES[M-1]}', 'a': [A - 1, A], 'v': [round(tot(A - 1, V)), round(tot(A, V))], 't': [tq(tot(A - 1, Q)), tq(tot(A, Q))]}
        # i 12 mesi dell'anno prima devono tornare con l'annuale (scarto < 2%)
        m12 = sum(mc.get((R, 'WORLD', p, V, f'{A-1}-{m:02d}')) or 0 for p in P for m in range(1, 13))
        a12 = sum(IT[p].get(str(A - 1), [0])[0] for p in P)
        assert not a12 or abs(m12 / a12 - 1) < 0.02, ('mensile e annuale non tornano', m12, a12)

    url = B + urllib.parse.urlencode([('reporter', R), ('partner', 'WORLD')] + [('product', p) for p in P] + [('flow', 2), ('indicators', V), ('freq', 'A'), ('sinceTimePeriod', a.da)])
    out = {'s': 'ver', 'u': url, 'codici': COD, 'anni': anni, 'it': IT, 'parz': parz, 'dest': dest, 'rep': rep, 'rp': R,
           'n': f"Eurostat Comext DS-045409, letto il {date.today():%d/%m/%Y}, aggiornamento Eurostat del {d.get('updated', '')[:10]}; export, partner WORLD; euro correnti, tonnellate = quintali/10."}
    os.makedirs(os.path.dirname(a.out) or '.', exist_ok=True)
    json.dump(out, open(a.out, 'w'), ensure_ascii=False, separators=(',', ':'))
    print('anni', anni[0], '-', last, '| top', top[:5], '| parz', parz and parz['per'], '→', a.out)


if __name__ == '__main__':
    main()
