import { useState } from "react";
import Sezione from "../Sezione.jsx";
import Campo from "../Campo.jsx";

export default function SezioneAuth({ chiama, salvaSessione }) {
  // form di registrazione precompilato per creare il CONTABILE,
  // l'unico ruolo che il DataSeeder non crea
  const [reg, setReg] = useState({
    email: "contabile@buildweek4.it",
    password: "contabile1234",
    nome: "Contabile",
    cognome: "Iniziale",
  });
  const [log, setLog] = useState({ email: "contabile@buildweek4.it", password: "contabile1234" });

  function registra() {
    // POST /api/utenti: aperta a tutti, il ruolo USER lo decide il server
    chiama("POST", "/api/utenti", reg);
  }

  async function accedi(email, password, ruoloNoto) {
    const r = await chiama("POST", "/api/auth/login", { email, password });
    // il backend risponde { "token": "..." }
    if (r.status === 200 && r.dati && r.dati.token) {
      salvaSessione(email, r.dati.token, ruoloNoto);
    }
  }

  return (
    <Sezione
      titolo="Autenticazione"
      sottotitolo="utenti seed pronti all'uso — il CONTABILE va creato e promosso"
      aperta={true}
    >
      <div className="operazione">
        <button className="primaria" onClick={() => accedi("admin@buildweek4.it", "admin1234", "ADMIN")}>
          Accedi come ADMIN
        </button>
        <button className="primaria" onClick={() => accedi("commerciale@buildweek4.it", "commerciale1234", "COMMERCIALE")}>
          Accedi come COMMERCIALE
        </button>
        <button className="primaria" onClick={() => accedi("user@buildweek4.it", "user1234", "USER")}>
          Accedi come USER
        </button>
      </div>
      <div className="operazione">
        <Campo etichetta="email" valore={reg.email} cambia={(v) => setReg({ ...reg, email: v })} />
        <Campo etichetta="password" valore={reg.password} cambia={(v) => setReg({ ...reg, password: v })} />
        <Campo etichetta="nome" valore={reg.nome} cambia={(v) => setReg({ ...reg, nome: v })} />
        <Campo etichetta="cognome" valore={reg.cognome} cambia={(v) => setReg({ ...reg, cognome: v })} />
        <button onClick={registra}>Registra (nasce USER)</button>
      </div>
      <div className="operazione">
        <Campo etichetta="email" valore={log.email} cambia={(v) => setLog({ ...log, email: v })} />
        <Campo etichetta="password" valore={log.password} cambia={(v) => setLog({ ...log, password: v })} />
        <button onClick={() => accedi(log.email, log.password, null)}>Accedi e salva identità</button>
      </div>
    </Sezione>
  );
}
