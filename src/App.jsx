import { useState } from "react";
import BarraIdentita from "./components/BarraIdentita.jsx";
import RegistroChiamate from "./components/RegistroChiamate.jsx";
import SezioneAuth from "./components/sezioni/SezioneAuth.jsx";
import SezioneUtenti from "./components/sezioni/SezioneUtenti.jsx";
import SezioneIndirizzi from "./components/sezioni/SezioneIndirizzi.jsx";
import SezioneClienti from "./components/sezioni/SezioneClienti.jsx";
import SezioneStati from "./components/sezioni/SezioneStati.jsx";
import SezioneFatture from "./components/sezioni/SezioneFatture.jsx";
import SezioneNote from "./components/sezioni/SezioneNote.jsx";

// ---- lettura del ruolo (funzioni pure, fuori dal componente) ----

// Normalizza le forme in cui un backend puo' scrivere il ruolo:
// "ROLE_ADMIN", ["ADMIN"], [{ authority: "ROLE_ADMIN" }] -> "ADMIN"
function normalizzaRuolo(valore) {
  let grezzo = valore;
  if (Array.isArray(grezzo)) grezzo = grezzo[0];
  if (grezzo && typeof grezzo === "object") {
    grezzo = grezzo.authority || grezzo.ruolo || grezzo.role || grezzo.nome;
  }
  if (typeof grezzo !== "string") return null;
  const pulito = grezzo.trim().split(" ")[0].replace(/^ROLE_/i, "").toUpperCase();
  if (pulito === "") return null;
  return pulito;
}

// Cerca il ruolo dentro un oggetto di risposta, provando i nomi di campo
// piu' comuni e scendendo nell'eventuale utente annidato
function ruoloDaOggetto(oggetto) {
  if (!oggetto || typeof oggetto !== "object") return null;
  const candidati = [oggetto.ruolo, oggetto.role, oggetto.roles, oggetto.authorities];
  for (const candidato of candidati) {
    const trovato = normalizzaRuolo(candidato);
    if (trovato) return trovato;
  }
  return ruoloDaOggetto(oggetto.utente) || ruoloDaOggetto(oggetto.user);
}

// Decodifica il payload di un JWT (base64url) senza librerie: su questo
// backend contiene solo { sub, iat, exp }, ma se un domani il ruolo ci
// finisse dentro lo leggiamo senza chiamate
function leggiPayloadToken(token) {
  try {
    const parte = String(token).split(".")[1];
    if (!parte) return null;
    const base64 = parte.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

// Cerca coppie email -> ruolo dentro una risposta qualsiasi (lista utenti,
// registrazione, cambio ruolo): cosi' la console impara i ruoli man mano
function raccogliRuoli(dati, accumulatore) {
  const trovati = accumulatore || {};
  if (Array.isArray(dati)) {
    for (const elemento of dati) raccogliRuoli(elemento, trovati);
    return trovati;
  }
  if (dati && typeof dati === "object") {
    const ruolo = ruoloDaOggetto(dati);
    if (typeof dati.email === "string" && ruolo) trovati[dati.email] = ruolo;
    if (dati.utente) raccogliRuoli(dati.utente, trovati);
    if (dati.user) raccogliRuoli(dati.user, trovati);
    if (dati.content) raccogliRuoli(dati.content, trovati);   // liste paginate
  }
  return trovati;
}

// Lo stato che deve essere condiviso da tutta l'app (sessioni, identità,
// registro) vive qui in App; le sezioni ricevono solo le funzioni chiama()
// e avvisa() e gestiscono da sole i loro form con useState locali
export default function App() {
  const [baseUrl, setBaseUrl] = useState("http://localhost:3001");
  const [sessioni, setSessioni] = useState({});         // email -> { token, ruolo }
  const [identitaAttiva, setIdentitaAttiva] = useState(null);
  const [voci, setVoci] = useState([]);                 // registro delle chiamate
  const [ruoliNoti, setRuoliNoti] = useState({});       // email -> ruolo, appreso dalle risposte

  // ---- registro ----
  function scriviLog(metodo, path, status, dati) {
    let chi = "anonimo";
    if (identitaAttiva && sessioni[identitaAttiva]) {
      chi = identitaAttiva + " (" + sessioni[identitaAttiva].ruolo + ")";
    }
    const voce = {
      id: crypto.randomUUID(),
      metodo, path, status, dati, chi,
      ora: new Date().toLocaleTimeString(),
    };
    setVoci((precedenti) => [voce, ...precedenti]);
  }

  // avviso locale (nessuna chiamata partita): usato dai controlli sui campi id
  function avvisa(messaggio) {
    scriviLog("CHK", "(controllo locale, nessuna chiamata)", 0, messaggio);
  }

  // ---- motore delle chiamate: unica funzione fetch per tutta l'app ----
  // extra (opzionale): { token } forza un token diverso da quello dell'identità
  // attiva, { silenzioso: true } non scrive la voce nel registro
  async function chiama(metodo, path, body, extra) {
    const opzioni = { method: metodo, headers: {} };
    if (body !== undefined) {
      opzioni.headers["Content-Type"] = "application/json";
      opzioni.body = JSON.stringify(body);
    }
    let token = null;
    if (extra && extra.token) token = extra.token;
    else if (identitaAttiva) token = sessioni[identitaAttiva].token;
    if (token) opzioni.headers["Authorization"] = "Bearer " + token;

    const silenzioso = Boolean(extra && extra.silenzioso);

    try {
      const res = await fetch(baseUrl.replace(/\/$/, "") + path, opzioni);
      const testo = await res.text();
      let dati = null;
      try { dati = testo ? JSON.parse(testo) : null; } catch { dati = testo; }
      // ogni risposta che cita email + ruolo aggiorna la mappa dei ruoli noti
      const imparati = raccogliRuoli(dati);
      if (Object.keys(imparati).length > 0) {
        setRuoliNoti((precedenti) => ({ ...precedenti, ...imparati }));
      }
      if (!silenzioso) scriviLog(metodo, path, res.status, dati);
      return { status: res.status, dati };
    } catch (err) {
      if (!silenzioso) {
        scriviLog(metodo, path, 0,
          "Backend non raggiungibile su " + baseUrl +
          " — è avviato sulla porta 3001? CORS configurato? (" + err.message + ")");
      }
      return { status: 0, dati: null };
    }
  }

  // ---- ruolo effettivo dell'utente appena loggato ----
  // Il token porta solo l'id, quindi il ruolo si chiede al backend:
  // /api/utenti/me e' la via diretta e vale per tutti i ruoli; se manca
  // (backend non aggiornato) si ripiega sulla lista utenti, che pero'
  // vede solo l'ADMIN, e infine sui ruoli imparati da risposte precedenti
  async function scopriRuolo(email, token) {
    const me = await chiama("GET", "/api/utenti/me", undefined, { token, silenzioso: true });
    if (me.status === 200) {
      const daMe = ruoloDaOggetto(me.dati);
      if (daMe) return { ruolo: daMe, come: "GET /api/utenti/me" };
    }

    const lista = await chiama("GET", "/api/utenti", undefined, { token, silenzioso: true });
    if (lista.status === 200) {
      const imparati = raccogliRuoli(lista.dati);
      if (imparati[email]) return { ruolo: imparati[email], come: "GET /api/utenti" };
    }

    if (ruoliNoti[email]) {
      return { ruolo: ruoliNoti[email], come: "una risposta precedente del backend" };
    }

    const dalToken = ruoloDaOggetto(leggiPayloadToken(token));
    if (dalToken) return { ruolo: dalToken, come: "payload del token" };

    return { ruolo: null, come: null, statoMe: me.status, statoLista: lista.status };
  }

  // ---- sessioni ----
  // ruoloAtteso e' solo un ripiego (i pulsanti di accesso rapido sanno quale
  // utente seed stanno usando): se il backend risponde, vince il ruolo vero
  async function salvaSessione(email, token, ruoloAtteso) {
    const esito = await scopriRuolo(email, token);
    let ruolo = esito.ruolo;
    if (!ruolo) ruolo = ruoloAtteso;
    if (!ruolo) ruolo = "SCONOSCIUTO";

    if (esito.ruolo) {
      scriviLog("ID", "(identità)", 200,
        "Ruolo di " + email + ": " + ruolo + " — letto da " + esito.come);
    } else {
      scriviLog("ID", "(identità)", 0,
        "Ruolo di " + email + " non ricavabile: il token contiene solo l'id, " +
        "GET /api/utenti/me ha risposto " + esito.statoMe + " (backend da riavviare?) " +
        "e GET /api/utenti " + esito.statoLista + " (la lista la vede solo l'ADMIN). " +
        "Intanto uso " + ruolo);
    }

    setSessioni((precedenti) => ({ ...precedenti, [email]: { token, ruolo } }));
    setIdentitaAttiva(email);
  }

  // usata dopo un cambio ruolo per aggiornare l'etichetta della sessione
  function aggiornaRuoloSessione(email, ruolo) {
    setSessioni((precedenti) => {
      if (!precedenti[email]) return precedenti;
      return { ...precedenti, [email]: { ...precedenti[email], ruolo } };
    });
  }

  return (
    <>
      <BarraIdentita
        baseUrl={baseUrl}
        setBaseUrl={setBaseUrl}
        sessioni={sessioni}
        identitaAttiva={identitaAttiva}
        setIdentitaAttiva={setIdentitaAttiva}
      />
      <main>
        <section>
          <SezioneAuth chiama={chiama} salvaSessione={salvaSessione} />
          <SezioneUtenti chiama={chiama} avvisa={avvisa} sessioni={sessioni} aggiornaRuoloSessione={aggiornaRuoloSessione} />
          <SezioneIndirizzi chiama={chiama} avvisa={avvisa} />
          <SezioneClienti chiama={chiama} avvisa={avvisa} />
          <SezioneStati chiama={chiama} avvisa={avvisa} />
          <SezioneFatture chiama={chiama} avvisa={avvisa} />
          <SezioneNote chiama={chiama} avvisa={avvisa} />
        </section>
        <RegistroChiamate voci={voci} svuota={() => setVoci([])} />
      </main>
    </>
  );
}
