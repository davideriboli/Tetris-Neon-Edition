# Tetris Neon Edition 🕹️✨

Un clone moderno e vibrante del leggendario **Tetris**, realizzato interamente in **Vanilla HTML, CSS e JavaScript**. Questa versione presenta un'estetica cyberpunk neon, effetti sonori sintetizzati e una rivisitazione della colonna sonora originale. Provalo on-line con un clic su [https://davideriboli.github.io/Tetris-Neon-Edition/](https://davideriboli.github.io/Tetris-Neon-Edition/).

---

## 🎖️ Crediti e Riconoscimenti

Il gioco originale **Tetris** è stato creato nel 1984 da **Alexey Pajitnov**.  
Tutti i diritti sul marchio e sul design originale appartengono a **The Tetris Company**.  
Questa è un'opera a scopo educativo e amatoriale, ispirata a uno dei videogiochi più iconici della storia.

---

## 🛠️ Come è stato creato

Questo progetto è stato sviluppato con l'obiettivo di creare un'applicazione web completa senza l'ausilio di librerie esterne o framework pesanti. L'intero progetto è stato codificato con un prompt one shot in [Google Gemini CLI](https://github.com/google-gemini/gemini-cli). La creazione ha richiesto 06:42 minuti, utilizzando gemini-2.5-flash-lite e gemini-3-flash-preview.

### Tecnologie utilizzate:
- **HTML5 Canvas API**: Per il rendering fluido della griglia di gioco e dei pezzi (Tetromino).
- **CSS3 Moderno**: Utilizzo di variabili CSS, Flexbox e Grid per un layout responsive e filtri di "glow" per l'effetto neon.
- **Vanilla JavaScript (ES6+)**: Logica di gioco orientata agli oggetti, gestione delle collisioni e rotazione dei pezzi.
- **Web Audio API**: Per la generazione dinamica di suoni e musica. Invece di caricare file MP3 pesanti, il gioco sintetizza le onde sonore (Square, Triangle, Sawtooth) in tempo reale, garantendo un caricamento istantaneo.

### Funzionalità Speciali:
- **Ghost Piece**: Una proiezione semitrasparente che mostra l'atterraggio preciso del pezzo.
- **Hard Drop**: Pressione della barra spaziatrice per far cadere istantaneamente il pezzo.
- **Sistema di Livelli**: La velocità di caduta aumenta ogni 10 linee completate.
- **Audio Dinamico**: Musica Korobeiniki sintetizzata e feedback sonoro per ogni azione.

---

## 🎮 Istruzioni di Gioco

L'obiettivo è incastrare i pezzi che cadono per completare righe orizzontali. Ogni riga completata scompare, facendoti guadagnare punti. Se i pezzi raggiungono la cima dello schermo, è Game Over!

### Comandi:
| Tasto | Azione |
| :--- | :--- |
| **⬅️ Freccia Sinistra** | Muovi a sinistra |
| **➡️ Freccia Destra** | Muovi a destra |
| **⬆️ Freccia Su** | Ruota il pezzo |
| **⬇️ Freccia Giù** | Caduta veloce |
| **Barra Spaziatrice** | Hard Drop (Cade all'istante) |
| **Pulsante ESCI** | Torna al menu principale |

---

## 🚀 Come caricarlo online (GitHub Pages)

Per far girare questo gioco sul tuo profilo GitHub:
1. Crea un nuovo repository su GitHub.
2. Carica i file `index.html`, `style.css`, `script.js` e questo `README.md`.
3. Vai nelle **Settings** del repository.
4. Clicca su **Pages** nella barra laterale sinistra.
5. Sotto "Build and deployment", seleziona il branch `main` e clicca su **Save**.
6. Dopo pochi istanti, il tuo gioco sarà raggiungibile all'indirizzo `https://tuo-utente.github.io/nome-repo/`.

---
Realizzato con ❤️ per il gaming retrò.
