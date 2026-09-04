import { useState } from "react";
import Sezione from "../Sezione.jsx";
import Campo from "../Campo.jsx";

export default function SezioneNote({ chiama, avvisa }) {
  const [contenuto, setContenuto] = useState("Cliente interessato alla tariffa business");
  const [clienteId, setClienteId] = useState("");
  const [notaId, setNotaId] = useState("");
  const [nuovoContenuto, setNuovoContenuto] = useState("");

  return (
    <Sezione titolo="Note" sottotitolo="COMMERCIALE e ADMIN — il CONTABILE deve ricevere 403">
      <div className="operazione">
        <Campo etichetta="contenuto" valore={contenuto} cambia={setContenuto} classe="largo" />
        <Campo etichetta="id cliente" valore={clienteId} cambia={setClienteId} classe="uuid mono" segnaposto="uuid" />
        <button
          className="primaria"
          onClick={() => {
            if (clienteId.trim() === "") { avvisa("Campo vuoto: id cliente."); return; }
            chiama("POST", "/api/note", { contenuto, clienteId: clienteId.trim() });
          }}
        >
          Scrivi nota
        </button>
        <button
          onClick={() => {
            // il filtro clienteId e' opzionale: senza, tornano tutte le note visibili al chiamante
            const filtro = clienteId.trim() ? "?clienteId=" + encodeURIComponent(clienteId.trim()) : "";
            chiama("GET", "/api/note" + filtro);
          }}
        >
          Leggi note (filtro cliente opzionale)
        </button>
      </div>
      <div className="operazione">
        <Campo etichetta="id nota" valore={notaId} cambia={setNotaId} classe="uuid mono" segnaposto="uuid" />
        <button
          onClick={() => {
            if (notaId.trim() === "") { avvisa("Campo vuoto: id nota."); return; }
            chiama("GET", "/api/note/" + notaId.trim());
          }}
        >
          Dettaglio nota
        </button>
        <Campo etichetta="nuovo contenuto" valore={nuovoContenuto} cambia={setNuovoContenuto} classe="largo" segnaposto="testo aggiornato" />
        <button
          onClick={() => {
            if (notaId.trim() === "") { avvisa("Campo vuoto: id nota."); return; }
            chiama("PATCH", "/api/note/" + notaId.trim(), { contenuto: nuovoContenuto });
          }}
        >
          PATCH nota
        </button>
      </div>
    </Sezione>
  );
}
