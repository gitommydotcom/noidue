# Noi Due

Il vostro spazio: ricordi, bigliettini, piani e date, solo per voi due.
Sito statico (HTML/CSS/JS, nessun build) pubblicato su Netlify; i dati sono su Firebase.

## Dove stanno i dati

| Cosa | Dove |
|---|---|
| Liste, ricordi, punteggi, nomi | Firestore → `couples/{codice}` (un documento) |
| Bigliettini | Firestore → `couples/{codice}/notes` |
| Sfide | Firestore → `couples/{codice}/games` |
| Vecchia chat (sola lettura) | Firestore → `couples/{codice}/messages` |
| Copie automatiche giornaliere | Firestore → `couples/{codice}/backups` |
| Account → spazio | Firestore → `users/{uid}` |
| Foto | Cloudinary (`dywtbbbuq`, preset `ml_default`) |

Netlify serve solo i file del sito: spostare o ripubblicare il sito non tocca i dati.

## Sicurezza dei dati

- Ogni modifica scrive solo il campo toccato, in una transazione sui dati più recenti: le modifiche fatte in contemporanea dall'altra persona non vengono sovrascritte.
- Una modifica che toglierebbe più di un elemento alla volta da una lista viene bloccata.
- Ogni giorno, alla prima apertura, viene salvata una copia completa (ultime 30). Si ripristina da Impostazioni → Copie automatiche, e prima del ripristino viene salvato lo stato attuale.
- Impostazioni → Scarica una copia: file JSON con tutto (liste, ricordi, bigliettini, sfide, chat).

## Se non riuscite più ad accedere

1. Schermata di accesso → "Password dimenticata?" → arriva un'email per scegliere una nuova password.
2. Se non ricordate nemmeno l'email: console Firebase → Authentication → Users mostra gli account registrati.
3. Il codice dello spazio è il nome del documento in Firestore → `couples` (es. `nd-abc12345`). Con un account nuovo, nella schermata "Benvenuti" scegliete "Avete già uno spazio?" e inserite quel codice.

## Struttura

```
index.html            schermate di accesso + guscio dell'app
css/app.css           stile
js/core.js            configurazione, utilità, icone, sheet e tasto indietro, upload foto
js/data.js            Firebase: accesso, ascolto in tempo reale, scritture sicure, backup
js/home.js            Oggi
js/lists.js           Insieme (tutte le liste)
js/gallery.js         Ricordi, viewer, "Rivivi"
js/notes.js           Bigliettini e archivio chat
js/games.js           Gioca
js/calendar.js        Calendario
js/settings.js        Impostazioni
js/sketch.js          tela da disegno
js/app.js             navigazione, ricerca, avvio
```

La versione precedente del sito è nel branch `originale`.
