# Criteri e soluzioni riutilizzabili (da CaliMat)

Appunti di riferimento per impostare future app allo stesso modo, con le stesse
soluzioni tecniche già validate su CaliMat.

## Stack usato

- **GitHub** — repository e versionamento del codice sorgente.
- **Supabase** — backend: autenticazione utenti + database Postgres (con Row
  Level Security per isolare i dati per utente).
- **GitKraken** — client grafico per tutte le operazioni Git (niente CLI).
- **Cloudflare Pages** — hosting statico con auto-deploy ad ogni push su GitHub.
- **PWABuilder** — genera l'APK/TWA Android a partire dalla PWA, per pubblicarla
  come app installabile senza riscrivere nulla.

### Convenzioni di naming da riusare

- Le costanti di connessione a Supabase vanno chiamate sempre così, per poter
  incollare velocemente i dati in ogni nuovo progetto senza doverle rinominare
  nel codice:
  ```js
  const SUPABASE_URL = '...';
  const SUPABASE_KEY = '...';
  ```
- Il file del service worker va chiamato semplicemente **`sw.js`** (non
  `service-worker.js`), registrato con `navigator.serviceWorker.register('/sw.js')`.

---

## Come si è tolta la barra degli indirizzi di Chrome dall'app sul telefono

Il problema riguarda due contesti diversi, risolti in due modi diversi:

1. **PWA installata (Aggiungi a schermata Home, senza APK)**
   Nel `manifest.json` il campo `"display"` deve essere impostato su
   `"standalone"` (o `"fullscreen"`). Questo, insieme a un `start_url` e
   `scope` corretti, fa sì che Chrome apra l'app senza barra degli indirizzi
   né UI del browser, mostrando solo la webview a tutto schermo.
   Vanno inoltre presenti nell'`<head>` i meta tag:
   - `<meta name="mobile-web-app-capable" content="yes">`
   - `<meta name="apple-mobile-web-app-capable" content="yes">` (per iOS)
   - `<link rel="manifest" href="/manifest.json">`

2. **APK Android generato con PWABuilder (TWA — Trusted Web Activity)**
   Qui la barra sparisce solo se Android **verifica** che l'app è davvero
   proprietaria di quel dominio (altrimenti mostra comunque la barra come
   fallback di sicurezza). La verifica avviene tramite **Digital Asset Links**:
   - Va pubblicato un file `assetlinks.json` su
     `https://tuodominio/.well-known/assetlinks.json`, contenente
     l'**impronta SHA-256 (fingerprint)** del keystore usato per firmare l'APK.
   - **Punto critico che causava il problema**: ogni volta che si rigenera
     l'APK da PWABuilder viene creato per default un **nuovo keystore**, con
     una fingerprint diversa da quella pubblicata in `assetlinks.json` → la
     verifica fallisce silenziosamente e Chrome mostra di nuovo la barra
     indirizzi dentro l'app.
   - **Soluzione definitiva**: riutilizzare sempre lo **stesso file
     `signing.keystore`** originale ad ogni nuova build (non farne generare
     uno nuovo a PWABuilder), così la fingerprint resta identica e
     `assetlinks.json` non va mai aggiornato dopo la prima pubblicazione.
     Se per qualsiasi motivo cambia il keystore, bisogna ricalcolare la
     fingerprint e aggiornare `assetlinks.json` di conseguenza.

---

## Come si è risolto il problema della coda delle modifiche fatte offline

Approccio: **localStorage-first + coda di sincronizzazione con retry**.

- Ogni lettura/scrittura dati passa prima da `localStorage` (mai solo dal
  network): l'app **funziona sempre**, anche senza connessione, perché legge/
  scrive localmente per prima cosa.
- Ogni funzione che scrive su Supabase (`save*ToDB`, `delete*ToDB`, ecc.) è
  avvolta in un `try/catch`:
  - se la chiamata **va a buon fine** → tutto normale, si aggiorna un
    indicatore visivo di stato sincronizzazione (pallino verde).
  - se la chiamata **fallisce** (es. offline) → l'operazione viene accodata
    in un array salvato in `localStorage` sotto una chiave dedicata (es.
    `cm_pending_sync`), con dentro: nome funzione da richiamare, argomenti,
    timestamp, numero di tentativi già fatti. Il pallino diventa rosso.
- Una funzione centrale (`flushPendingSync`) svuota la coda:
  - richiamata quando torna la connessione (evento `online`)
  - richiamata quando la finestra torna in foreground (`visibilitychange`,
    `focus`)
  - richiamata anche a intervalli regolari (polling ogni 10s) come rete di
    sicurezza, se `navigator.onLine` è vero
  - prima di rifare i tentativi, rinfresca la sessione di autenticazione
    (un token scaduto durante il periodo offline farebbe fallire tutto)
  - ogni item accodato ha un **numero massimo di tentativi** (es. 8): oltre
    quella soglia resta in coda ma smette di essere ritentato automaticamente
    ad ogni retry, per non far lampeggiare in continuo l'indicatore di stato
    su errori persistenti (es. dato ormai in conflitto).
- Punto chiave: gli **ID sono generati lato client** (es.
  `crypto.randomUUID()`) e mai dal server. Questo è ciò che rende possibile
  usare l'app offline e mettere in coda le operazioni: se l'ID venisse
  assegnato dal server al salvataggio, un salvataggio offline non avrebbe un
  ID valido con cui essere referenziato dal resto dei dati locali.

---

## Come è fatta la parte alta dell'app (header)

Barra fissa in cima, sotto la status bar del telefono, con due elementi
allineati agli estremi (`display:flex; justify-content:space-between`):

- **A sinistra**: il logo/nome dell'app, testo semplice (non un'immagine),
  con l'ultima parte del nome colorata con il colore accento per dare
  identità visiva senza bisogno di un file immagine.
- **A destra**: un "pill" cliccabile (`user-pill`) — un contenitore
  arrotondato con bordo, che contiene:
  - un **pallino di stato sincronizzazione** (`sync-dot`): verde = tutto
    sincronizzato, arancione pulsante = sincronizzazione in corso, rosso =
    ci sono modifiche in coda non ancora inviate (vedi sezione sopra);
  - l'**email dell'utente loggato**, come testo accanto al pallino.
  - l'intero pill ha un `onclick` che apre la finestra (modale) delle
    **impostazioni** — nessun link separato, tutta la card è cliccabile.

Il vantaggio di questo pattern è che un solo elemento in alto a destra
comunica contemporaneamente "chi sono loggato" e "stato della sincronizzazione
dati", e allo stesso tempo è il punto d'accesso a tutte le impostazioni
dell'app, senza bisogno di un'icona a parte.
