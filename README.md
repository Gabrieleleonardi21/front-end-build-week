# Console di test React — build-week-4

Frontend di test per il backend EPIC ENERGY SERVICES (porta 3001).
Stack: React 18 + Vite, nessuna altra dipendenza.

## Prerequisito nel backend: CORS

Le chiamate partono da http://localhost:5173, quindi il backend deve
accettarle. Tre passi (una volta sola):

1. Aggiungere `CorsConfig.java` in `src/main/java/com/example/buildweek4/security/`
2. In `SecurityConfig`, dentro la catena, aggiungere `.cors(cors -> {})`
   subito prima di `.csrf(csrf -> csrf.disable())`
3. In `JwtFilter.shouldNotFilter` includere il preflight:
   `return request.getMethod().equals("OPTIONS") || isLogin || isRegistrazione;`

## Avvio

```
npm install
npm run dev
```

Poi aprire http://localhost:5173 con il backend acceso.

## Uso

- I tre pulsanti di accesso rapido usano gli utenti del DataSeeder
  (admin / commerciale / user). Il CONTABILE non è tra i seed: il form di
  registrazione è precompilato per crearlo, poi va promosso dall'ADMIN
  e deve fare login.
- Ogni login salva un'identità nel menu in alto: da lì si cambia utente
  al volo per testare i permessi. Dopo una promozione, l'utente promosso
  deve rifare login (il token vecchio conserva il ruolo vecchio).
- Il registro a destra logga ogni chiamata con status e risposta; viola
  = 403/409, i casi che il progetto deve dimostrare. Gli id (uuid) si
  copiano dalle risposte e si incollano nei campi id.
- Il filtro fatture per stato usa l'ID dello stato (uuid), non il nome:
  si recupera con "Elenca stati".
