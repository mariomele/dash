// node e2e.js → apre index.html in Chrome headless, visita ogni sezione (e le lenti della Partita) su computer e telefono:
// zero errori in console e nessuno scroll orizzontale a 390 px. Serve Playwright (o playwright-core): PW=/percorso/playwright-core
const path = require('path');
let pw; for (const m of [process.env.PW, 'playwright', 'playwright-core', path.join(require('os').homedir(), 'node_modules/playwright-core')].filter(Boolean)) { try { pw = require(m); break; } catch (e) {} }
if (!pw) { console.log('e2e saltato: Playwright non trovato (npm i -D playwright-core, oppure PW=<percorso>)'); process.exit(0); }
(async () => {
  const b = await pw.chromium.launch(), bad = [];
  for (const [w, h, n] of [[1440, 950, 'computer'], [390, 844, 'telefono']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    p.on('pageerror', e => bad.push(`${n}: ${e.message}`)); p.on('console', m => m.type() === 'error' && bad.push(`${n} console: ${m.text()}`));
    await p.goto('file://' + path.join(__dirname, 'index.html'));
    const r = await p.evaluate(() => { const out = []; ORD.forEach(s => { location.hash = s; show(); if (document.documentElement.scrollWidth > innerWidth + 1) out.push('scroll orizzontale in ' + s); });
      if (ORD.includes('partita')) { location.hash = 'partita'; plenti().L.forEach(l => { ST.pl = l[0]; show(); }); ['esagoni','mappa','campus','campo'].forEach(b => { ST.pb = b; show(); hexify(); }); ST.mv = VX[0][0] + '*50'; show(); ST.mv = ''; show(); }
      return { n: ORD.length, out }; }).catch(e => ({ n: 0, out: ['errore: ' + e.message.split('\n')[0]] }));
    bad.push(...r.out.map(x => `${n}: ${x}`)); console.log(`${n}: ${r.n} sezioni visitate`);
  }
  await b.close();
  if (bad.length) { console.error('PROBLEMI:\n- ' + bad.join('\n- ')); process.exit(1); }
  console.log('e2e ok');
})();
