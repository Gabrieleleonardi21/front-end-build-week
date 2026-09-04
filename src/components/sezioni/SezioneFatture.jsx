import { useState } from "react";
import Sezione from "../Sezione.jsx";
import Campo from "../Campo.jsx";

export default function SezioneFatture({ chiama, avvisa }) {
  const oggi = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ data: oggi, importo: "1500.50", numero: "2026/001", clienteId: "" });
  const [filtri, setFiltri] = useState({ clienteId: "", statoId: "", page: "0", size: "10" });
  const [fatturaId, setFatturaId] = useState("");
  const [statoDestinazione, setStatoDestinazione] = useState("EMESSA");

  function richiedeFatturaId() {
    if (fatturaId.trim() !== "") return true;
    avvisa("Campo vuoto: id fattura. Copialo dal registro dopo la creazione o la ricerca.");
    return false;
  }

  function creaFattura() {
    if (form.clienteId.trim() === "") {
      avvisa("Campo vuoto: id cliente. Crea prima il cliente e incolla qui il suo id.");
      return;
    }
    chiama("POST", "/api/fatture", {
      data: form.data,
      importo: form.importo || null,
      numero: form.numero,
      clienteId: form.clienteId.trim(),
    });
  }

  function cercaFatture() {
    // filtri opzionali; il filtro stato in questo backend e' per ID (uuid), non per nome
    const parametri = ["page=" + filtri.page, "size=" + filtri.size];
    if (filtri.clienteId.trim()) parametri.push("clienteId=" + encodeURIComponent(filtri.clienteId.trim()));
    if (filtri.statoId.trim()) parametri.push("statoId=" + encodeURIComponent(filtri.statoId.trim()));
    chiama("GET", "/api/fatture?" + parametri.join("&"));
  }

  return (
    <Sezione titolo="Fatture" sottotitolo="nascono in BOZZA; filtro per clienteId e statoId (uuid); transizione dedicata">
      <div className="operazione">
        <Campo etichetta="data" tipo="date" valore={form.data} cambia={(v) => setForm({ ...form, data: v })} />
        <Campo etichetta="importo" valore={form.importo} cambia={(v) => setForm({ ...form, importo: v })} classe="corto" />
        <Campo etichetta="numero" valore={form.numero} cambia={(v) => setForm({ ...form, numero: v })} />
        <Campo etichetta="id cliente" valore={form.clienteId} cambia={(v) => setForm({ ...form, clienteId: v })} classe="uuid mono" segnaposto="uuid" />
        <button className="primaria" onClick={creaFattura}>Crea fattura (CONTABILE)</button>
      </div>
      <div className="operazione">
        <Campo etichetta="id cliente (filtro)" valore={filtri.clienteId} cambia={(v) => setFiltri({ ...filtri, clienteId: v })} classe="uuid mono" segnaposto="uuid" />
        <Campo etichetta="id stato (filtro)" valore={filtri.statoId} cambia={(v) => setFiltri({ ...filtri, statoId: v })} classe="uuid mono" segnaposto="uuid dello stato" />
        <Campo etichetta="pagina" valore={filtri.page} cambia={(v) => setFiltri({ ...filtri, page: v })} classe="corto" />
        <Campo etichetta="per pagina" valore={filtri.size} cambia={(v) => setFiltri({ ...filtri, size: v })} classe="corto" />
        <button onClick={cercaFatture}>Cerca fatture</button>
      </div>
      <div className="operazione">
        <Campo etichetta="id fattura" valore={fatturaId} cambia={setFatturaId} classe="uuid mono" segnaposto="uuid" />
        <div className="campo">
          <span>nuovo stato (nome)</span>
          <input list="statiSuggeriti" value={statoDestinazione} onChange={(e) => setStatoDestinazione(e.target.value)} />
          <datalist id="statiSuggeriti">
            <option>EMESSA</option><option>PAGATA</option><option>SCADUTA</option><option>INSOLUTA</option><option>BOZZA</option>
          </datalist>
        </div>
        <button
          className="primaria"
          onClick={() => richiedeFatturaId() && chiama("PATCH", "/api/fatture/" + fatturaId.trim() + "/stato", { nuovoStato: statoDestinazione })}
        >
          Cambia stato
        </button>
        <button
          onClick={() =>
            richiedeFatturaId() &&
            chiama("PUT", "/api/fatture/" + fatturaId.trim(), {
              data: form.data,
              importo: form.importo || null,
              numero: form.numero,
            })
          }
        >
          PUT (data/importo/numero sopra)
        </button>
        <button className="pericolo" onClick={() => richiedeFatturaId() && chiama("DELETE", "/api/fatture/" + fatturaId.trim())}>
          Elimina (ADMIN)
        </button>
      </div>
    </Sezione>
  );
}
