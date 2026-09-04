import { useState } from "react";
import Sezione from "../Sezione.jsx";
import Campo from "../Campo.jsx";

export default function SezioneClienti({ chiama, avvisa }) {
  const [form, setForm] = useState({
    ragioneSociale: "Volt Italia",
    partitaIva: "01234567890",
    email: "info@volt.it",
    fatturatoAnnuale: "500000",
    tipo: "SRL",
    sedeLegaleId: "",
    sedeOperativaId: "",
  });
  const [pagina, setPagina] = useState({ page: "0", size: "10" });
  const [clienteId, setClienteId] = useState("");
  const [commercialeId, setCommercialeId] = useState("");
  const [nuovoTipo, setNuovoTipo] = useState("SPA");

  function richiedeClienteId() {
    if (clienteId.trim() !== "") return true;
    avvisa("Campo vuoto: id cliente. Copialo dal registro dopo la creazione o l'elenco.");
    return false;
  }

  function creaCliente() {
    if (form.sedeLegaleId.trim() === "" || form.sedeOperativaId.trim() === "") {
      avvisa("Campi vuoti: id sede legale e/o operativa. Crea prima gli indirizzi e incolla qui i loro id.");
      return;
    }
    chiama("POST", "/api/clienti", {
      ragioneSociale: form.ragioneSociale,
      partitaIva: form.partitaIva,
      email: form.email,
      fatturatoAnnuale: form.fatturatoAnnuale || null,
      tipo: form.tipo,
      logoAziendale: null,
      sedeLegaleId: form.sedeLegaleId.trim(),
      sedeOperativaId: form.sedeOperativaId.trim(),
    });
  }

  function patchCliente() {
    if (!richiedeClienteId()) return;
    // PATCH parziale: nel body finiscono solo i campi compilati
    const candidati = {
      ragioneSociale: form.ragioneSociale,
      partitaIva: form.partitaIva,
      email: form.email,
      fatturatoAnnuale: form.fatturatoAnnuale,
      sedeLegaleId: form.sedeLegaleId,
      sedeOperativaId: form.sedeOperativaId,
    };
    const body = {};
    Object.entries(candidati).forEach(([chiave, valore]) => {
      if (valore.trim() !== "") body[chiave] = valore.trim();
    });
    if (Object.keys(body).length === 0) { avvisa("Compila almeno un campo cliente per il PATCH."); return; }
    chiama("PATCH", "/api/clienti/" + clienteId.trim(), body);
  }

  return (
    <Sezione titolo="Clienti" sottotitolo="lista paginata; PATCH parziale; operazioni riservate all'ADMIN">
      <div className="operazione">
        <Campo etichetta="ragione sociale" valore={form.ragioneSociale} cambia={(v) => setForm({ ...form, ragioneSociale: v })} />
        <Campo etichetta="partita IVA" valore={form.partitaIva} cambia={(v) => setForm({ ...form, partitaIva: v })} />
        <Campo etichetta="email" valore={form.email} cambia={(v) => setForm({ ...form, email: v })} />
        <Campo etichetta="fatturato annuale" valore={form.fatturatoAnnuale} cambia={(v) => setForm({ ...form, fatturatoAnnuale: v })} classe="corto" />
        <div className="campo">
          <span>tipo</span>
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            <option>SRL</option><option>SPA</option><option>SAS</option><option>PA</option>
          </select>
        </div>
        <Campo etichetta="id sede legale" valore={form.sedeLegaleId} cambia={(v) => setForm({ ...form, sedeLegaleId: v })} classe="uuid mono" segnaposto="uuid indirizzo" />
        <Campo etichetta="id sede operativa" valore={form.sedeOperativaId} cambia={(v) => setForm({ ...form, sedeOperativaId: v })} classe="uuid mono" segnaposto="uuid indirizzo" />
        <button className="primaria" onClick={creaCliente}>Crea cliente</button>
      </div>
      <div className="operazione">
        <Campo etichetta="pagina" valore={pagina.page} cambia={(v) => setPagina({ ...pagina, page: v })} classe="corto" />
        <Campo etichetta="per pagina" valore={pagina.size} cambia={(v) => setPagina({ ...pagina, size: v })} classe="corto" />
        <button onClick={() => chiama("GET", "/api/clienti?page=" + pagina.page + "&size=" + pagina.size)}>
          Elenca clienti (paginato)
        </button>
      </div>
      <div className="operazione">
        <Campo etichetta="id cliente" valore={clienteId} cambia={setClienteId} classe="uuid mono" segnaposto="uuid" />
        <button onClick={() => richiedeClienteId() && chiama("GET", "/api/clienti/" + clienteId.trim())}>Dettaglio</button>
        <button
          onClick={() =>
            richiedeClienteId() &&
            chiama("PUT", "/api/clienti/" + clienteId.trim(), {
              ragioneSociale: form.ragioneSociale,
              partitaIva: form.partitaIva,
              email: form.email,
              fatturatoAnnuale: form.fatturatoAnnuale || null,
              tipo: form.tipo,
              logoAziendale: null,
              sedeLegaleId: form.sedeLegaleId.trim() || null,
              sedeOperativaId: form.sedeOperativaId.trim() || null,
            })
          }
        >
          PUT (tutti i campi sopra)
        </button>
        <button onClick={patchCliente}>PATCH (solo i campi compilati)</button>
        <button className="pericolo" onClick={() => richiedeClienteId() && chiama("DELETE", "/api/clienti/" + clienteId.trim())}>
          Elimina (ADMIN)
        </button>
      </div>
      <div className="operazione">
        <Campo etichetta="id commerciale da assegnare" valore={commercialeId} cambia={setCommercialeId} classe="uuid mono" segnaposto="uuid utente" />
        <button
          onClick={() => {
            if (!richiedeClienteId()) return;
            if (commercialeId.trim() === "") { avvisa("Campo vuoto: id commerciale."); return; }
            chiama("PATCH", "/api/clienti/" + clienteId.trim() + "/commerciale", { commercialeId: commercialeId.trim() });
          }}
        >
          Assegna commerciale (ADMIN)
        </button>
        <div className="campo">
          <span>nuovo tipo societario</span>
          <select value={nuovoTipo} onChange={(e) => setNuovoTipo(e.target.value)}>
            <option>SPA</option><option>SRL</option><option>SAS</option><option>PA</option>
          </select>
        </div>
        <button onClick={() => richiedeClienteId() && chiama("PATCH", "/api/clienti/" + clienteId.trim() + "/tipo", { tipo: nuovoTipo })}>
          Cambia tipo (ADMIN)
        </button>
      </div>
    </Sezione>
  );
}
