import { useState } from "react";
import Sezione from "../Sezione.jsx";
import Campo from "../Campo.jsx";

export default function SezioneUtenti({ chiama, avvisa, sessioni, aggiornaRuoloSessione }) {
  const [utenteId, setUtenteId] = useState("");
  const [ruolo, setRuolo] = useState("CONTABILE");

  async function cambiaRuolo() {
    if (utenteId.trim() === "") {
      avvisa("Campo vuoto: id utente. Usa 'Elenca utenti' e copia l'id dal registro.");
      return;
    }
    const r = await chiama("PATCH", "/api/utenti/" + utenteId.trim() + "/ruolo", { ruolo });
    // se ho una sessione aperta per l'utente promosso, aggiorno l'etichetta:
    // il SUO token pero' resta con il ruolo vecchio, deve rifare login
    if (r.status === 200 && r.dati && r.dati.email && sessioni[r.dati.email]) {
      aggiornaRuoloSessione(r.dati.email, r.dati.ruolo + " (rifare login)");
    }
  }

  return (
    <Sezione
      titolo="Utenti"
      sottotitolo="solo ADMIN — lista e promozione (poi rifare login: il token vecchio resta col ruolo vecchio)"
    >
      <div className="operazione">
        <button onClick={() => chiama("GET", "/api/utenti")}>Elenca utenti</button>
      </div>
      <div className="operazione">
        <Campo etichetta="id utente" valore={utenteId} cambia={setUtenteId} classe="uuid mono" segnaposto="uuid" />
        <div className="campo">
          <span>nuovo ruolo</span>
          <select value={ruolo} onChange={(e) => setRuolo(e.target.value)}>
            <option>CONTABILE</option>
            <option>COMMERCIALE</option>
            <option>ADMIN</option>
            <option>USER</option>
          </select>
        </div>
        <button className="primaria" onClick={cambiaRuolo}>Cambia ruolo</button>
      </div>
    </Sezione>
  );
}
