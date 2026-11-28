# Dash

Dashboard di intelligence sui concorrenti, una per cartella.

| Cartella | Dashboard |
|---|---|
| [caprai/](caprai/) | Arnaldo Caprai Intelligence: cantine di Montefalco, Umbria e gruppo Angelini Wines & Estates |
| [galdieri/](galdieri/) | Gruppo Galdieri Intelligence: analisi del gruppo (Auto, Petroli, Rent) |
| [forini/](forini/) | Forini · ACTON Intelligence: carburanti, Fuel Card, lubrificanti ed energia nel centro Italia |

Ogni cartella si costruisce da sola: `node test.js && node news.js && node render.js` → `index.html`. Le notizie si aggiornano ogni 2 ore con GitHub Actions (`.github/workflows/`).
