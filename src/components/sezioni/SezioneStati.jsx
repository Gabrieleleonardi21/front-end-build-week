import { useState } from "react";
import Sezione from "../Sezione.jsx";
import Campo from "../Campo.jsx";

export default function SezioneStati({ chiama, avvisa }) {
  const [nuovoNome, setNuovoNome] = useState("");
  const [statoId, setStatoId] = useState("");
  const [nomeModifica, setNomeModifica] = useState("");

  function richiedeId() {
    if (statoId.trim() !== "") return true;
    avvisa("Campo vuoto: id stato. Copialo dal registro dopo 'Elenca stati'.");
    return false;
  }

  return (
    <Sezione titolo="Stati fattura" sottotitolo="/api/stato_fatture — CRUD di CONTABILE e ADMIN">
      <div className="operazione">
        <button onClick={() => chiama("GET", "/api/stato_fatture")}>
          Elenca stati (copia gli id: servono al filtro fatture)
        </button>
        <Campo etichetta="nome nuovo stato" valore={nuovoNome} cambia={setNuovoNome} segnaposto="es. CONTESTATA" />
        <button className="primaria" onClick={() => chiama("POST", "/api/stato_fatture", { nome: nuovoNome })}>
          Crea stato
        </button>
      </div>
      <div className="operazione">
        <Campo etichetta="id stato" valore={statoId} cambia={setStatoId} classe="uuid mono" segnaposto="uuid" />
        <Campo etichetta="nuovo nome" valore={nomeModifica} cambia={setNomeModifica} segnaposto="es. RIMBORSATA" />
        <button onClick={() => richiedeId() && chiama("PUT", "/api/stato_fatture/" + statoId.trim(), { nome: nomeModifica })}>
          Modifica
        </button>
        <button className="pericolo" onClick={() => richiedeId() && chiama("DELETE", "/api/stato_fatture/" + statoId.trim())}>
          Elimina (409 se in uso)
        </button>
      </div>
    </Sezione>
  );
}
