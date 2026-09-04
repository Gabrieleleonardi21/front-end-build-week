// Input con etichetta, riusato da tutti i form.
// "classe" aggiunge varianti css: uuid (largo per gli id), corto, largo
export default function Campo({ etichetta, valore, cambia, classe = "", tipo = "text", segnaposto = "" }) {
  return (
    <div className="campo">
      <span>{etichetta}</span>
      <input
        type={tipo}
        className={classe}
        value={valore}
        placeholder={segnaposto}
        onChange={(e) => cambia(e.target.value)}
      />
    </div>
  );
}
