// Contenitore <details> riusato da tutte le sezioni
export default function Sezione({ titolo, sottotitolo, aperta = false, children }) {
  return (
    <details open={aperta}>
      <summary>
        {titolo} <span className="chi">{sottotitolo}</span>
      </summary>
      <div className="corpo">{children}</div>
    </details>
  );
}
