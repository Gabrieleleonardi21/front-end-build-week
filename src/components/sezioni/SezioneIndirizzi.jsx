import { useState } from "react";
import Sezione from "../Sezione.jsx";
import Campo from "../Campo.jsx";

export default function SezioneIndirizzi({ chiama, avvisa }) {
  const [form, setForm] = useState({ via: "Via Roma", civico: "10", citta: "Roma", provincia: "RM", cap: "00100" });
  const [indirizzoId, setIndirizzoId] = useState("");

  function richiedeId() {
    if (indirizzoId.trim() !== "") return true;
    avvisa("Campo vuoto: id indirizzo. Copialo dal registro dopo 'Elenca indirizzi'.");
    return false;
  }

  // per il PATCH parziale: solo i campi compilati entrano nel body
  function soloCompilati() {
    const body = {};
    Object.entries(form).forEach(([chiave, valore]) => {
      if (valore.trim() !== "") body[chiave] = valore.trim();
    });
    return Object.keys(body).length > 0 ? body : null;
  }

  return (
    <Sezione titolo="Indirizzi" sottotitolo="POST/PUT/PATCH per COMMERCIALE e ADMIN — nessuna cancellazione prevista">
      <div className="operazione">
        <Campo etichetta="via" valore={form.via} cambia={(v) => setForm({ ...form, via: v })} />
        <Campo etichetta="civico" valore={form.civico} cambia={(v) => setForm({ ...form, civico: v })} classe="corto" />
        <Campo etichetta="città" valore={form.citta} cambia={(v) => setForm({ ...form, citta: v })} />
        <Campo etichetta="provincia" valore={form.provincia} cambia={(v) => setForm({ ...form, provincia: v })} classe="corto" />
        <Campo etichetta="cap" valore={form.cap} cambia={(v) => setForm({ ...form, cap: v })} classe="corto" />
        <button className="primaria" onClick={() => chiama("POST", "/api/indirizzi", form)}>Crea indirizzo</button>
      </div>
      <div className="operazione">
        <button onClick={() => chiama("GET", "/api/indirizzi")}>Elenca indirizzi</button>
        <Campo etichetta="id indirizzo" valore={indirizzoId} cambia={setIndirizzoId} classe="uuid mono" segnaposto="uuid" />
        <button onClick={() => richiedeId() && chiama("GET", "/api/indirizzi/" + indirizzoId.trim())}>Dettaglio</button>
        <button onClick={() => richiedeId() && chiama("PUT", "/api/indirizzi/" + indirizzoId.trim(), form)}>
          PUT (tutti i campi sopra)
        </button>
        <button
          onClick={() => {
            if (!richiedeId()) return;
            const body = soloCompilati();
            if (body === null) { avvisa("Compila almeno un campo indirizzo per il PATCH."); return; }
            chiama("PATCH", "/api/indirizzi/" + indirizzoId.trim(), body);
          }}
        >
          PATCH (solo i campi compilati)
        </button>
      </div>
    </Sezione>
  );
}
