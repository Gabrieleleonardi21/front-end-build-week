// Il registro a destra: una voce per chiamata, colorata per status.
// Viola = 403/409, i casi che il progetto deve dimostrare
export default function RegistroChiamate({ voci, svuota }) {
  function classeStato(status) {
    if (status >= 200 && status < 300) return "voce s2";
    if (status === 403) return "voce s43";
    if (status === 409) return "voce s49";
    return "voce s4";
  }

  return (
    <aside>
      <h2>
        Registro delle chiamate <button onClick={svuota}>Svuota</button>
      </h2>
      <div className="registro">
        {voci.length === 0 && (
          <div className="vuoto">
            Nessuna chiamata ancora. Usa i pulsanti di accesso rapido per iniziare.
          </div>
        )}
        {voci.map((v) => (
          <div key={v.id} className={classeStato(v.status)}>
            <div className="riga mono">
              <span className="metodo">{v.metodo}</span>
              <span>{v.path}</span>
              <span className="stato">{v.status || "ERR"}</span>
            </div>
            <div className="come">come {v.chi} — {v.ora}</div>
            <pre>{typeof v.dati === "string" ? v.dati : JSON.stringify(v.dati, null, 2)}</pre>
          </div>
        ))}
      </div>
    </aside>
  );
}
