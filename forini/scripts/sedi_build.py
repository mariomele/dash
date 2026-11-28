# uso: python3 -I build.py <progetto>  → data/sedi.json, data/geo.json
# Fonti: anagrafica impianti attivi MIMIT (CSV), mappa Acton (wpgmza markers), filiali Beyfin (coordinate dal sito), indirizzi dai siti (Nominatim).
import sys,os,json,time,math,urllib.request,urllib.parse
SC=os.path.dirname(os.path.abspath(__file__));W=os.path.join(SC,'..','web');M=os.path.join(SC,'..','mimit')
OUT=sys.argv[1]
MIMIT_U='https://www.mimit.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv'
UA={'User-Agent':'dashboard-geocoder/1.0 (research)'}
CF=os.path.join(SC,'nomi_cache.json');C=json.load(open(CF)) if os.path.exists(CF) else {}
def nom(path,q):
    k=path+'?'+urllib.parse.urlencode(q)
    if k not in C:
        time.sleep(1.1)
        C[k]=json.load(urllib.request.urlopen(urllib.request.Request('https://nominatim.openstreetmap.org/'+k,headers=UA),timeout=30))
        json.dump(C,open(CF,'w'))
    return C[k]
def fwd(*qs):
    for i,q in enumerate(qs):
        r=nom('search',{'q':q,'format':'json','limit':1,'countrycodes':'it'})
        if r: return float(r[0]['lat']),float(r[0]['lon']),i
    raise SystemExit('non trovato: '+qs[0])
def rev(lat,lon):
    a=nom('reverse',{'lat':round(lat,5),'lon':round(lon,5),'format':'json','zoom':10,'accept-language':'it'}).get('address',{})
    return a.get('city') or a.get('town') or a.get('village') or a.get('municipality'),(a.get('ISO3166-2-lvl6') or '').replace('IT-','')

# regioni (openpolis) per assegnare la regione a ogni punto
G=json.load(open(os.path.join(M,'regions.geojson')))
REG=[]
for f in G['features']:
    g=f['geometry'];polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    REG.append((f['properties']['reg_name'].split('/')[0],[p[0] for p in polys]))
def inring(x,y,r):
    c=False;j=len(r)-1
    for i in range(len(r)):
        xi,yi=r[i];xj,yj=r[j]
        if (yi>y)!=(yj>y) and x<(xj-xi)*(y-yi)/(yj-yi)+xi: c=not c
        j=i
    return c
def regione(lat,lon):
    for n,rs in REG:
        if any(inring(lon,lat,r) for r in rs): return n
    # punto sulla costa appena fuori dal poligono: regione più vicina
    return min(REG,key=lambda t:min((p[0]-lon)**2+(p[1]-lat)**2 for r in t[1] for p in r[::5]))[0]
def km(a,b,c,d): return 6371*2*math.asin(math.sqrt(math.sin(math.radians(c-a)/2)**2+math.cos(math.radians(a))*math.cos(math.radians(c))*math.sin(math.radians(d-b)/2)**2))
tc=lambda s:' '.join(w.capitalize() if len(w)>2 or i==0 else w.lower() for i,w in enumerate(s.title().split())).replace("D'","d'").replace("Dell'","dell'")

S=[]
def add(id,nome,tipo,citta,prov,lat,lon,s,u,n):
    S.append({'id':id,'nome':nome,'tipo':tipo,'citta':citta,'prov':prov,'regione':regione(lat,lon),'paese':'IT','lat':round(lat,5),'lon':round(lon,5),'s':s,'u':u,'n':n})

# 1) sedi, depositi, filiali e sportelli dichiarati sui siti
FO='https://forini.com/';ALA='https://www.alacarburanti.com/contatti/';EN='https://www.enerpetroli.it/chi-siamo/'
ES='https://it.linkedin.com/company/estra-spa';UE='https://www.umbriaenergy.it/contatti';BY='https://www.beyfin.it/contatti-filiali-beyfin/'
SITI=[
 ('ala','Sede legale Ala Carburanti (gruppo Gradi Gualtiero)','sede','Quarrata','PT',ALA,'Registered office: Strada statale 66 n. 833-835, Catena di Quarrata',['Catena, Quarrata','Quarrata']),
 ('ala','Sede operativa Ala Carburanti','sede operativa','Quarrata','PT',ALA,'Headquarters: Strada statale 66 n. 416, Casini di Quarrata',['Casini, Quarrata','Quarrata']),
 ('enerpetroli','Sede e deposito Enerpetroli','sede','Viterbo','VT',EN,'Via Garbini 101: uffici e deposito di prodotti petroliferi',['Via Garbini 101, Viterbo','Via Garbini, Viterbo']),
 ('enerpetroli','Deposito commerciale di Gallese Scalo','deposito','Gallese','VT',EN,'deposito commerciale con uffici',['Gallese Scalo','Gallese']),
 ('enerpetroli','Deposito commerciale di Roma','deposito','Roma','RM',EN,'deposito commerciale con uffici; indirizzo non indicato, punto sul comune',['Roma']),
 ('enerpetroli','Deposito commerciale di Tarquinia','deposito','Tarquinia','VT',EN,'deposito aperto di recente; indirizzo non indicato, punto sul comune',['Tarquinia']),
 ('estra','Sede legale Estra S.p.A.','sede','Prato','PO','https://www.greenreport.it/partners/estra-spa','Via Ugo Panziera 16, sede legale e amministrativa; oggi la vendita luce e gas è sotto il marchio AliaEstra (estra.it rimanda ad aliaestra.it)',['Via Ugo Panziera 16, Prato','Via Ugo Panziera, Prato']),
 ('estra','Sede Estra di Siena','sede operativa','Siena','SI',ES,'Viale Toselli 9/A; indirizzo letto nell\'estratto di ricerca della pagina LinkedIn aziendale (la pagina non si apre senza accesso)',['Viale Toselli 9, Siena','Viale Toselli, Siena']),
 ('estra','Sede Estra di Arezzo','sede operativa','Arezzo','AR',ES,'Via Igino Cocchi 14; indirizzo letto nell\'estratto di ricerca della pagina LinkedIn aziendale (la pagina non si apre senza accesso)',['Via Igino Cocchi 14, Arezzo','Via Igino Cocchi, Arezzo']),
 ('umbriaenergy','Sede Umbria Energy S.p.A.','sede','Terni','TR',UE,'Via Giordano Bruno 7',['Via Giordano Bruno 7, Terni','Via Giordano Bruno, Terni']),
 ('umbriaenergy','Sportello di Terni, Viale Cesare Battisti','sportello','Terni','TR',UE,'Viale Cesare Battisti 7 (flagship store aperto a settembre)',['Viale Cesare Battisti 7, Terni','Viale Cesare Battisti, Terni']),
 ('umbriaenergy','Sportello di Terni, Corso Tacito','sportello','Terni','TR',UE,'Corso Tacito 82',['Corso Tacito 82, Terni','Corso Tacito, Terni']),
 ('umbriaenergy','Sportello di Terni, Via Bruno Capponi','sportello','Terni','TR',UE,'Via Bruno Capponi 100',['Via Bruno Capponi 100, Terni','Via Bruno Capponi, Terni']),
 ('umbriaenergy','Sportello di Perugia','sportello','Perugia','PG',UE,'Via della Madonna Alta 59',['Via della Madonna Alta 59, Perugia','Via della Madonna Alta, Perugia']),
 ('umbriaenergy','Sportello di Bastia Umbra','sportello','Bastia Umbra','PG',UE,'Piazza Umberto I 2/3: a Bastia Umbra, la città della sede Forini',['Piazza Umberto I, Bastia Umbra','Bastia Umbra']),
]
for id,nome,tipo,citta,prov,u,n,qs in SITI:
    la,lo,i=fwd(*qs)
    if i==len(qs)-1 and len(qs)>1 and 'punto sul comune' not in n: n+='; coordinate della località (via non trovata su OpenStreetMap)'
    add(id,nome,tipo,citta,prov,la,lo,'dic',u,n)

add('forini','Sede Forini S.p.A. (ACTON)','sede','Bastia Umbra','PG',43.0763747,12.5416795,'dic',FO,'Via del Popolo 9; sede di tutti i marchi Acton (Special Fuel, Fuel Card, Lubes, Energia); coordinate dal segnaposto della sede sulla mappa dei distributori Acton')
# 2) filiali Beyfin: coordinate dai link «Visualizza sulla mappa» del sito
import re,html
t=open(os.path.join(W,'beyfin_fil.html'),errors='ignore').read()
t=t[[m.start() for m in re.finditer('data-regione',t)][20]-300:]
t=re.sub(r'(?s)<(script|style|svg).*?</\1>',' ',t)
t=re.sub(r'<a [^>]*href="http://www.google.com/maps/place/([-0-9.]+),([-0-9.]+)"[^>]*>',r' @@\1,\2@@ ',t)
t=re.sub(r'<[^>]+>','|',t);t=re.sub(r'\s+',' ',html.unescape(t));t=re.sub(r'(\| ?)+','|',t)
seen=set()
for via,cap,citta,prov,la,lo in re.findall(r'\|([^|]+)\|(\d{5}) - ([^|(]+)\((\w\w)\) \|.*?@@([-0-9.]+),([-0-9.]+)@@',t):
    if (la,lo) in seen: continue
    seen.add((la,lo));citta=citta.strip()
    if citta=='Campi Bisenzio': add('beyfin','Sede direzionale Beyfin S.p.A. SB','sede',citta,prov,float(la),float(lo),'dic',BY,'Via Vingone 94, loc. S. Angelo a Lecore; anche filiale Toscana. Sede a Campi Bisenzio (FI), non a Prato')
    else: add('beyfin','Filiale Beyfin di '+citta,'filiale',citta,prov,float(la),float(lo),'dic',BY,via+'; filiale per GPL e combustibili (assistenza, guasti, forniture)')

# 3) stazioni dall'anagrafica MIMIT (estrazione del 26/11/2026)
rows=[l.rstrip('\n').split('|') for l in open(os.path.join(M,'anagrafica.csv'),encoding='utf-8',errors='replace')][2:]
RULE={'forini':(('Acton1Q',),('FORINI S.P.A.',)),'beyfin':(('Beyfin',),('BEYFIN',)),'ala':(('Ala',),('ALA CARBURANTI S.R.L.',)),'enerpetroli':(('Enerpetroli',),('ENERPETROLI S.R.L.',))}
ST={};NOME={'forini':'Forini','beyfin':'Beyfin','ala':'Ala Carburanti','enerpetroli':'Enerpetroli'}
for id,(ban,ges) in RULE.items():
    L=[]
    for r in rows:
        if len(r)<10 or not r[8] or not r[9]: continue
        if r[2] in ban or any(g in r[1].upper() for g in ges):
            la,lo=float(r[8]),float(r[9])
            if any(km(la,lo,x[0],x[1])<0.05 for x in L): continue  # stesso impianto registrato due volte
            L.append((la,lo,r))
    ST[id]=L
for id,L in ST.items():
    for la,lo,r in L:
        b=r[2];own=b in RULE[id][0];mine=any(g in r[1].upper() for g in RULE[id][1])
        # niente nomi dei gestori terzi: spesso sono persone fisiche
        n='bandiera '+b+(', gestita direttamente' if own and mine else ', gestore terzo' if own else ', gestita da '+NOME[id])
        n+='; '+tc(r[5].split(',')[0].strip())+' (impianto MIMIT '+r[0]+')'
        add(id,'Stazione '+b+' di '+tc(r[6]),'stazione',tc(r[6]),r[7],la,lo,'ver',MIMIT_U,n)

# 4) mappa dei distributori Acton: i punti che il registro non attribuisce a Forini/Acton
A=json.load(open(os.path.join(W,'acton_markers_all.json')))
mim=[(x['lat'],x['lon'],x['n'].lower()) for x in S if x['id']=='forini' and x['tipo']=='stazione']
# stesso impianto: entro 1 km, o stessa via entro 10 km (le coordinate della mappa e del registro a volte divergono di qualche km)
st=lambda a:a.split(',')[0].lower().replace('via ','').replace('viale ','').strip()
extra=0
for m in A:
    if m['map_id']!='2': continue
    la,lo=float(m['lat']),float(m['lng'])
    if any(km(la,lo,a,b)<1 or (km(la,lo,a,b)<10 and len(st(m['address']))>4 and st(m['address']) in t) for a,b,t in mim): continue
    if km(la,lo,43.0764,12.5417)<0.1: continue  # è la sede, già sopra
    citta,prov=rev(la,lo)
    add('forini','Punto vendita '+m['title'].strip()+' · mappa Acton','stazione',citta,prov,la,lo,'dic','https://acton.forini.com/',
        'sulla «mappa dei distributori» dove trovare i carburanti Acton, insegna '+m['title'].strip()+'; '+m['address'].split(',')[0]+'; non risulta a bandiera Acton né gestito da Forini nel registro MIMIT')
    extra+=1
json.dump(C,open(CF,'w'))
json.dump({'sedi':S},open(os.path.join(OUT,'data','sedi.json'),'w'),ensure_ascii=False,indent=1)

# 5) geo.json: regioni toccate, Douglas-Peucker 0,02°, 3 decimali
def dp(p,e):
    if len(p)<3: return p
    a,b=p[0],p[-1];dx,dy=b[0]-a[0],b[1]-a[1];L=math.hypot(dx,dy) or 1e-12
    d=[abs(dy*(q[0]-a[0])-dx*(q[1]-a[1]))/L for q in p[1:-1]];i=max(range(len(d)),key=d.__getitem__)
    return dp(p[:i+2],e)[:-1]+dp(p[i+1:],e) if d[i]>e else [a,b]
used={x['regione'] for x in S}
R=[]
for n,rs in REG:
    if n not in used: continue
    # anello chiuso: si semplifica in due metà, altrimenti il segmento di riferimento è nullo
    rr=[[[round(x,3),round(y,3)] for x,y in dp(r[:len(r)//2+1],0.02)[:-1]+dp(r[len(r)//2:],0.02)] for r in rs]
    rr=[r for r in rr if len(r)>=4]
    R.append([n,rr])
json.dump({'src':'https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson','r':R},open(os.path.join(OUT,'data','geo.json'),'w'),separators=(',',':'))
import collections
print(collections.Counter((x['id'],x['tipo']) for x in S));print('acton solo mappa',extra)
print(collections.Counter((x['id'],x['regione']) for x in S if x['tipo']=='stazione'))
print('regioni',sorted(used))
