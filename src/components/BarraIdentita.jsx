// La barra in alto: url del backend, selettore dell'identità attiva
// e badge colorato con il ruolo corrente
export default function BarraIdentita({ baseUrl, setBaseUrl, sessioni, identitaAttiva, setIdentitaAttiva }) {
  const ruolo = identitaAttiva ? sessioni[identitaAttiva].ruolo : "ANONIMO";
  // il ruolo puo' contenere note tipo "(rifare login)": per la classe CSS serve solo la prima parola
  const classeRuolo = ruolo.split(" ")[0];

  return (
    <header>
      <h1>
        Console di test
        <small>build-week-4 — EPIC ENERGY SERVICES</small>
      </h1>
      <div className="barra-destra">
        <div className="campo">
          <label htmlFor="baseUrl">Backend</label>
          <input
            id="baseUrl"
            className="mono"
            size="22"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
        </div>
        <div className="campo">
          <label htmlFor="selettoreSessione">Identità attiva</label>
          <select
            id="selettoreSessione"
            value={identitaAttiva || ""}
            onChange={(e) => setIdentitaAttiva(e.target.value || null)}
          >
            <option value="">— nessuna (anonimo) —</option>
            {Object.entries(sessioni).map(([email, s]) => (
              <option key={email} value={email}>
                {email} ({s.ruolo})
              </option>
            ))}
          </select>
        </div>
        <span className={"badge-ruolo " + classeRuolo}>{ruolo}</span>
      </div>
    </header>
  );
}
