# CasaFlow — Requisiti MVP

Versione: 0.1  
Tipo progetto: Web app mobile-first in HTML/CSS/JavaScript vanilla  
Backend: Supabase  
Utenti previsti: solo due persone, Peppe e sua moglie  
Obiettivo: coordinare faccende domestiche, spesa, bucato, cose mancanti e piccoli lavoretti familiari riducendo carico mentale e attriti quotidiani.

---

## 1. Contesto del progetto

Peppe e sua moglie lavorano entrambi, con orari e giornate diverse.

Peppe lavora con orario d’ufficio, tipicamente dal lunedì al venerdì. Sua moglie lavora come guida turistica, principalmente la mattina, con una distribuzione del lavoro meno regolare. Hanno una bambina piccola e si trovano spesso in affanno con la gestione della casa: faccende, lavatrici, spesa, pannolini, piccoli lavoretti, cose da comprare, incombenze rimandate.

La famiglia ha già un aiuto esterno, cioè una babysitter a chiamata e una donna delle pulizie una volta a settimana, ma questo non basta a prevenire disordine, dimenticanze e accumulo di attività.

Il problema principale non è creare un gestionale complesso, ma uno strumento semplice e condiviso che consenta a Peppe e sua moglie di:

- vedere cosa c’è da fare;
- capire cosa è urgente e cosa può aspettare;
- assegnarsi i compiti senza dover discutere ogni volta;
- annotare subito le cose che mancano;
- gestire il bucato e le attività domestiche ricorrenti;
- ridurre il carico mentale;
- evitare che la sera, da stanchi, le cose dimenticate diventino motivo di attrito.

---

## 2. Principio guida

L’app deve essere anti-caos e anti-colpa.

Non deve sembrare un software aziendale, né un sistema per misurare chi fa di più. Deve essere uno strumento domestico leggero, pratico, rassicurante e veloce da usare.

Tono dell’interfaccia:

- neutro;
- non giudicante;
- non punitivo;
- orientato alla riprogrammazione;
- adatto a persone stanche che vogliono gestire poche cose essenziali.

Evitare formule tipo:

- “Task scaduto!”
- “In ritardo”
- “Non completato”
- “Hai fallito”

Preferire formule tipo:

- “Da fare”
- “Da riprogrammare”
- “Lo spostiamo a domani?”
- “Essenziale per oggi”
- “Quando possibile”
- “Fatto”

---

## 3. Scopo dell’MVP

L’MVP deve consentire a due utenti, Peppe e sua moglie, di usare una web app condivisa da telefono.

Non deve essere una app pubblica. Non deve gestire famiglie multiple, inviti complessi, ruoli avanzati, store mobile, pagamenti, onboarding commerciale o profili pubblici.

Deve essere una web app privata, utilizzata solo da due persone.

L’MVP deve essere sviluppato con:

- HTML;
- CSS;
- JavaScript vanilla;
- Supabase per database e autenticazione;
- design mobile-first;
- nessun framework frontend;
- nessun React;
- nessun Vue;
- nessun Angular;
- nessun build system obbligatorio.

È accettabile partire con tre file:

- `index.html`
- `style.css`
- `app.js`

Eventualmente si può aggiungere:

- `config.example.js`
- `README.md`
- `schema.sql`

---

## 4. Utenti

Gli utenti previsti sono solo due:

1. Peppe
2. Moglie

Non servono ruoli complessi.

Ogni task può essere assegnato a:

- Peppe
- Moglie
- Chi può

Per ora non devono esistere account per babysitter o donna delle pulizie. Eventuali attività relative a loro possono essere annotate come task normali, per esempio:

- “Pagare babysitter”
- “Lasciare chiavi alla donna delle pulizie”
- “Preparare elenco cose da pulire”

---

## 5. Requisiti tecnici generali

### 5.1 Frontend

La web app deve essere:

- mobile-first;
- utilizzabile comodamente da smartphone;
- leggibile con una mano;
- veloce da caricare;
- chiara anche in condizioni di stanchezza;
- con pulsanti grandi;
- con input semplici;
- senza schermate sovraccariche.

La web app deve funzionare nei browser moderni di:

- iPhone Safari;
- Android Chrome;
- desktop browser, anche se il target primario è mobile.

### 5.2 Backend

Usare Supabase per:

- autenticazione;
- salvataggio task;
- salvataggio lista spesa / cose mancanti;
- eventuale persistenza delle preferenze base;
- sincronizzazione tra i due telefoni.

### 5.3 Autenticazione

Per l’MVP è sufficiente Supabase Auth.

Modalità accettabili:

- login email/password;
- oppure magic link.

Dato che gli utenti sono solo due, non serve registrazione pubblica libera.

Soluzione consigliata:

- creare manualmente su Supabase i due utenti autorizzati;
- nell’app consentire login solo a quegli account;
- opzionalmente controllare che l’email sia una delle due autorizzate.

Il frontend non deve esporre chiavi private. Deve usare solo la anon public key di Supabase.

### 5.4 Sicurezza minima

Implementare Row Level Security su Supabase.

Poiché gli utenti sono solo due e appartengono alla stessa “casa”, si può usare una gestione semplificata:

- una sola household;
- entrambi gli utenti leggono e scrivono i dati della stessa household;
- nessun altro utente deve poter accedere ai dati.

Per l’MVP si può usare un campo `household_id` fisso nelle tabelle e associare i due utenti a quella household.

---

## 6. Funzionalità principali

L’MVP deve avere cinque aree principali:

1. Oggi
2. Settimana
3. Spesa / Mancano cose
4. Bucato
5. Reset casa

Una navigazione inferiore o superiore deve permettere di passare rapidamente tra queste sezioni.

---

# 7. Schermata “Oggi”

## 7.1 Obiettivo

Mostrare solo ciò che serve affrontare oggi, evitando liste infinite.

La schermata “Oggi” è la schermata principale dell’app.

## 7.2 Contenuto

La schermata deve mostrare:

- task essenziali di oggi;
- task normali di oggi;
- eventuali task rimandati a oggi;
- eventuali task senza data ma marcati come essenziali.

I task devono essere ordinati così:

1. Essenziali
2. Normali
3. Bassa priorità

All’interno della stessa priorità, ordinare per data di creazione o aggiornamento.

## 7.3 Card task

Ogni task deve essere visualizzato come card con:

- titolo;
- categoria;
- assegnatario;
- priorità;
- eventuale nota breve;
- pulsante “Fatto”;
- pulsante “Domani”;
- pulsante “Modifica”;
- pulsante “Elimina” o “Archivia”.

Esempio card:

```text
Comprare pannolini
Bimba · Essenziale · Chi può

[Fatto] [Domani] [Modifica]
```

## 7.4 Azioni rapide

Da ogni task si deve poter fare:

- completare task;
- rimandare a domani;
- modificare;
- eliminare o archiviare.

Il completamento deve impostare:

- `status = done`
- `completed_at = now()`

Il rinvio a domani deve aggiornare:

- `due_date = tomorrow`
- `status = todo`

---

# 8. Schermata “Settimana”

## 8.1 Obiettivo

Separare le attività non urgenti dalla pressione quotidiana.

La schermata “Settimana” deve contenere i task con:

- data nei prossimi 7 giorni;
- nessuna data ma priorità non essenziale;
- piccoli lavoretti domestici;
- cose rimandabili.

## 8.2 Categorie tipiche

Esempi:

- sistemare lampada bagno;
- ordinare detersivi;
- cambiare lenzuola;
- sistemare vestiti bimba diventati piccoli;
- chiamare tecnico;
- fare ordine in un armadio;
- controllare documenti;
- comprare regali;
- prenotare appuntamento.

## 8.3 Vista suggerita

Raggruppare per:

- Domani;
- Prossimi giorni;
- Quando possibile.

Non serve un calendario complesso nell’MVP.

---

# 9. Schermata “Spesa / Mancano cose”

## 9.1 Obiettivo

Consentire a entrambi di annotare subito le cose che mancano, senza doverle ricordare o comunicarle a voce.

Questa sezione è fondamentale per ridurre attriti del tipo:

- “Te l’avevo detto che mancavano i pannolini”
- “Pensavo li comprassi tu”
- “Manca il latte”
- “Non abbiamo più detersivo”

## 9.2 Funzionalità

La schermata deve permettere di:

- aggiungere rapidamente un articolo;
- indicare una categoria;
- marcare come comprato;
- eliminare articolo;
- filtrare o raggruppare per categoria.

## 9.3 Campi articolo

Ogni articolo deve avere:

- titolo;
- categoria;
- stato;
- data creazione;
- eventuale nota.

Categorie iniziali:

- Bimba
- Alimentari
- Casa
- Farmacia
- Igiene
- Altro

Stati:

- Da comprare
- Comprato

## 9.4 Input rapido

L’aggiunta deve essere estremamente veloce.

Esempio:

```text
[ Pannolini misura 5            ] [Categoria: Bimba] [Aggiungi]
```

Dopo l’aggiunta, il campo testo deve svuotarsi automaticamente.

---

# 10. Schermata “Bucato”

## 10.1 Obiettivo

Gestire il flusso reale del bucato, che spesso non consiste solo nel “fare la lavatrice”, ma in una catena di passaggi.

## 10.2 Stati del bucato

La sezione deve rappresentare i seguenti stati:

1. Da lavare
2. Lavatrice da avviare
3. Da stendere / asciugare
4. Da piegare
5. Da mettere a posto

## 10.3 Implementazione MVP

Per semplicità, il bucato può essere gestito come una categoria speciale di task.

Tuttavia la UI deve avere una schermata dedicata con colonne o blocchi per stato.

Esempi:

```text
Da lavare
- Scuri
- Bimba

Da stendere
- Bianchi

Da piegare
- Asciugamani
```

## 10.4 Azioni

Ogni elemento bucato deve poter avanzare allo stato successivo.

Esempio:

- “Scuri” da “Da lavare” a “Lavatrice da avviare”
- poi a “Da stendere”
- poi a “Da piegare”
- poi a “Da mettere a posto”
- poi “Fatto”

Pulsante suggerito:

```text
Avanza
```

## 10.5 Campi

Ogni elemento bucato deve avere:

- titolo;
- stato bucato;
- assegnatario opzionale;
- nota opzionale;
- data creazione;
- data aggiornamento.

---

# 11. Schermata “Reset casa”

## 11.1 Obiettivo

Consentire un mini-riordino serale da 10-15 minuti, senza trasformarlo in una pulizia completa.

Deve aiutare la coppia a evitare che la casa degeneri, ma senza aumentare il senso di colpa.

## 11.2 Checklist reset

Checklist iniziale:

- cucina libera;
- tavolo sgombro;
- giochi bimba raccolti;
- vestiti nel cesto;
- lavastoviglie caricata o svuotata;
- cose per domani preparate.

Ogni voce deve essere spuntabile.

## 11.3 Reset giornaliero

La checklist deve potersi resettare ogni giorno.

Per l’MVP si può implementare in modo semplice:

- salvare lo stato per data;
- oppure avere un pulsante “Resetta checklist”.

## 11.4 Modalità sopravvivenza

Inserire un bottone “Modalità sopravvivenza”.

Quando attivato, mostra solo le cose minime:

- cucina minima;
- pannolini / cose bimba essenziali;
- preparare cose per domani;
- eventuali medicine o urgenze.

Questa modalità non deve eliminare dati. Deve solo filtrare la vista.

---

# 12. Aggiunta e modifica task

## 12.1 Campi task

Ogni task deve avere:

- id;
- household_id;
- title;
- description / note;
- category;
- assigned_to;
- priority;
- due_date;
- status;
- recurrence;
- created_by;
- created_at;
- updated_at;
- completed_at.

## 12.2 Categoria

Categorie iniziali:

- Bimba
- Spesa
- Bucato
- Cucina
- Pulizie
- Casa / lavoretti
- Amministrativo
- Altro

## 12.3 Assegnatario

Valori ammessi:

- Peppe
- Moglie
- Chi può

## 12.4 Priorità

Valori ammessi:

- Essenziale
- Normale
- Bassa

## 12.5 Stato

Valori ammessi:

- Da fare
- Fatto
- Archiviato

Opzionale:

- Rimandato

Tuttavia, per evitare complessità, “rimandato” può essere gestito semplicemente cambiando `due_date`.

## 12.6 Ricorrenza

Per l’MVP gestire ricorrenze semplici:

- Nessuna
- Giornaliera
- Settimanale
- Ogni 2 settimane
- Mensile

Esempi:

- “Controllare pannolini” ogni 5 giorni non è obbligatorio per MVP;
- può essere approssimato come settimanale;
- ricorrenze personalizzate possono essere una feature futura.

## 12.7 Creazione task ricorrenti

Quando un task ricorrente viene completato, l’app deve creare o aggiornare la prossima occorrenza.

Per semplicità MVP:

- quando si preme “Fatto” su un task ricorrente, creare un nuovo task identico con la prossima `due_date`;
- marcare quello corrente come completato.

Esempio:

Task: “Cambiare lenzuola”, settimanale, data oggi.  
Azione: “Fatto”.  
Risultato:

- task corrente completato;
- nuovo task “Cambiare lenzuola” creato tra 7 giorni.

---

# 13. Dashboard e navigazione

## 13.1 Navigazione

L’app deve avere navigazione semplice tra sezioni:

- Oggi
- Settimana
- Spesa
- Bucato
- Reset

Su mobile può essere una bottom navigation.

## 13.2 Header

L’header deve mostrare:

- nome app;
- stato login;
- eventuale pulsante logout;
- data di oggi.

Esempio:

```text
CasaFlow
Giovedì 4 giugno
```

## 13.3 Pulsante globale di aggiunta

Deve esistere un pulsante evidente:

```text
+ Aggiungi
```

Questo deve consentire di aggiungere rapidamente:

- task;
- articolo spesa;
- elemento bucato.

---

# 14. UI/UX

## 14.1 Stile visivo

Design desiderato:

- semplice;
- caldo;
- domestico;
- leggibile;
- non aziendale;
- non freddo;
- non eccessivamente colorato.

Usare card, spaziature generose, font leggibili.

## 14.2 Colori

Proposta:

- sfondo chiaro caldo;
- card bianche;
- accenti morbidi;
- priorità essenziale evidenziata ma non aggressiva.

Evitare rosso acceso per urgenze, salvo casi estremi.

## 14.3 Mobile-first

Layout pensato prima per smartphone:

- larghezza piena;
- pulsanti touch-friendly;
- no tabelle larghe;
- no hover-only interactions;
- no menu complessi.

## 14.4 Accessibilità minima

- contrasto sufficiente;
- font almeno 16px;
- pulsanti grandi;
- label chiare;
- form comprensibili;
- stati visivi riconoscibili.

---

# 15. Modello dati Supabase

## 15.1 Tabella `households`

```sql
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default now()
);
```

Per MVP ci sarà una sola riga, per esempio:

```text
Casa Peppe
```

## 15.2 Tabella `household_members`

```sql
create table household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamp with time zone default now(),
  unique(household_id, user_id)
);
```

Contiene solo:

- Peppe
- Moglie

## 15.3 Tabella `tasks`

```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  title text not null,
  note text,
  category text not null default 'Altro',
  assigned_to text not null default 'Chi può',
  priority text not null default 'Normale',
  due_date date,
  status text not null default 'Da fare',
  recurrence text not null default 'Nessuna',
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);
```

## 15.4 Tabella `shopping_items`

```sql
create table shopping_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  title text not null,
  category text not null default 'Altro',
  note text,
  status text not null default 'Da comprare',
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  bought_at timestamp with time zone
);
```

## 15.5 Tabella `laundry_items`

```sql
create table laundry_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  title text not null,
  laundry_status text not null default 'Da lavare',
  assigned_to text not null default 'Chi può',
  note text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);
```

## 15.6 Tabella `reset_checklist`

```sql
create table reset_checklist (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  reset_date date not null,
  label text not null,
  is_done boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

Per MVP si può anche evitare questa tabella e gestire la checklist lato frontend con rigenerazione giornaliera, ma è preferibile salvarla per sincronizzarla tra i due utenti.

---

# 16. Row Level Security

Abilitare RLS su tutte le tabelle applicative:

```sql
alter table households enable row level security;
alter table household_members enable row level security;
alter table tasks enable row level security;
alter table shopping_items enable row level security;
alter table laundry_items enable row level security;
alter table reset_checklist enable row level security;
```

Policy concettuale:

Un utente può leggere e modificare dati solo delle household di cui è membro.

Esempio policy per `tasks`:

```sql
create policy "Members can read tasks"
on tasks for select
using (
  household_id in (
    select household_id
    from household_members
    where user_id = auth.uid()
  )
);

create policy "Members can insert tasks"
on tasks for insert
with check (
  household_id in (
    select household_id
    from household_members
    where user_id = auth.uid()
  )
);

create policy "Members can update tasks"
on tasks for update
using (
  household_id in (
    select household_id
    from household_members
    where user_id = auth.uid()
  )
);

create policy "Members can delete tasks"
on tasks for delete
using (
  household_id in (
    select household_id
    from household_members
    where user_id = auth.uid()
  )
);
```

Creare policy analoghe per:

- `shopping_items`
- `laundry_items`
- `reset_checklist`

Per `households` e `household_members`, limitare lettura ai membri.

---

# 17. Sincronizzazione

L’app deve leggere e scrivere i dati su Supabase.

Per l’MVP è sufficiente:

- caricare i dati all’apertura;
- ricaricare i dati dopo ogni modifica;
- eventualmente aggiungere un pulsante “Aggiorna”.

Realtime Supabase non è obbligatorio per la prima versione.

Feature futura:

- subscription realtime per aggiornare automaticamente il telefono dell’altro utente.

---

# 18. Gestione date

L’app deve usare la data locale del dispositivo.

Funzioni necessarie:

- calcolare oggi;
- calcolare domani;
- calcolare prossimi 7 giorni;
- formattare la data in italiano.

Attenzione:

- non complicare con timezone lato MVP;
- salvare `due_date` come `date`;
- usare `created_at` e `updated_at` con timestamp Supabase.

---

# 19. Stati vuoti

Ogni sezione deve avere un messaggio quando non ci sono elementi.

Esempi:

Schermata Oggi:

```text
Per oggi non c’è nulla di urgente. Respira.
```

Spesa:

```text
La lista è vuota. Per ora non manca niente.
```

Bucato:

```text
Nessun bucato registrato.
```

Settimana:

```text
Nessun lavoretto in sospeso per questa settimana.
```

---

# 20. Modalità sopravvivenza

## 20.1 Obiettivo

Quando la giornata è pesante, l’app deve mostrare solo le cose essenziali.

## 20.2 Comportamento MVP

La modalità sopravvivenza può essere un toggle nella schermata “Oggi”.

Quando attivo:

- mostra solo task con priorità “Essenziale”;
- mostra eventuali articoli spesa categoria “Bimba” o “Farmacia”;
- mostra checklist reset ridotta.

Non deve modificare i dati, solo filtrare la vista.

---

# 21. Notifiche

Per l’MVP le notifiche push non sono obbligatorie.

Motivo:

- implementarle bene su mobile web, soprattutto iOS, aumenta la complessità;
- il primo obiettivo è verificare uso e flusso.

Possibile alternativa MVP:

- reminder visivi dentro app;
- badge numerici nelle sezioni;
- task essenziali evidenziati.

Feature futura:

- notifiche push PWA;
- email reminder;
- reminder Telegram/WhatsApp non prioritari.

---

# 22. PWA

Per l’MVP non è obbligatorio implementare subito PWA, ma la struttura deve poter evolvere in PWA.

Feature futura:

- `manifest.json`;
- icona home screen;
- service worker;
- caching;
- offline parziale.

Se Codex riesce a includere PWA minima senza complicare troppo, bene, ma non deve essere prioritaria rispetto alla stabilità del CRUD e della sincronizzazione Supabase.

---

# 23. File attesi

Il progetto dovrebbe contenere almeno:

```text
/index.html
/style.css
/app.js
/schema.sql
/README.md
```

Opzionali:

```text
/config.example.js
/manifest.json
/service-worker.js
```

## 23.1 `index.html`

Contiene:

- struttura layout;
- sezioni principali;
- form modali o inline;
- import Supabase client via CDN;
- import `style.css`;
- import `app.js`.

## 23.2 `style.css`

Contiene:

- stile mobile-first;
- card;
- bottoni;
- bottom navigation;
- form;
- badge priorità;
- stati vuoti;
- responsive desktop leggero.

## 23.3 `app.js`

Contiene:

- configurazione Supabase;
- login/logout;
- caricamento household;
- CRUD task;
- CRUD shopping;
- CRUD bucato;
- checklist reset;
- filtri Oggi/Settimana;
- gestione modalità sopravvivenza.

## 23.4 `schema.sql`

Contiene:

- creazione tabelle;
- enable RLS;
- policy;
- eventuali seed commentati;
- istruzioni per creare household e membri.

## 23.5 `README.md`

Contiene:

- descrizione progetto;
- istruzioni setup Supabase;
- dove inserire URL e anon key;
- come creare utenti;
- come creare household;
- come avviare il progetto localmente;
- note sulle limitazioni MVP.

---

# 24. Configurazione Supabase nel frontend

Non inserire credenziali private.

Usare una configurazione tipo:

```js
const SUPABASE_URL = "INSERIRE_SUPABASE_URL";
const SUPABASE_ANON_KEY = "INSERIRE_SUPABASE_ANON_KEY";
```

Oppure usare un file:

```js
// config.js
window.CASAFLOW_CONFIG = {
  supabaseUrl: "INSERIRE_SUPABASE_URL",
  supabaseAnonKey: "INSERIRE_SUPABASE_ANON_KEY"
};
```

Nel repository si può includere solo:

```text
config.example.js
```

e non il vero `config.js`.

---

# 25. Esperienza login

## 25.1 Schermata login

Se l’utente non è autenticato, mostrare:

- titolo app;
- breve frase;
- input email;
- input password;
- bottone login;
- eventuale messaggio errore.

Esempio testo:

```text
CasaFlow
Una piccola cabina di regia per casa, bimba e cose da non dimenticare.
```

## 25.2 Dopo login

Dopo login:

- caricare il profilo membro da `household_members`;
- ricavare `household_id`;
- mostrare dashboard “Oggi”.

Se l’utente non appartiene a nessuna household, mostrare errore chiaro:

```text
Questo account non è associato alla casa.
```

---

# 26. Validazioni

Validazioni minime:

- titolo task obbligatorio;
- titolo articolo spesa obbligatorio;
- titolo elemento bucato obbligatorio;
- categoria valorizzata;
- assegnatario valorizzato;
- priorità valorizzata.

Non consentire inserimento di task vuoti.

---

# 27. Error handling

Gestire errori Supabase con messaggi chiari.

Esempi:

- “Non riesco a salvare. Controlla la connessione.”
- “Sessione scaduta. Accedi di nuovo.”
- “Errore nel caricamento dei dati.”

Mostrare errori in un’area visibile ma non invadente.

---

# 28. Prestazioni

Il dataset previsto è piccolo.

Non servono ottimizzazioni complesse.

Tuttavia:

- evitare ricaricamenti inutili;
- limitare query ai dati della household;
- non caricare task completati molto vecchi nella dashboard principale;
- nella schermata principale mostrare solo task rilevanti.

Suggerimento:

- task completati non più recenti di 7 giorni possono essere nascosti di default.

---

# 29. Archiviazione ed eliminazione

Per MVP si può implementare eliminazione diretta.

Preferibile:

- per task: usare stato “Archiviato” invece di cancellazione;
- per spesa: eliminare o marcare comprato;
- per bucato: completare ed eventualmente nascondere.

Non serve una schermata storico nell’MVP.

---

# 30. Feature escluse dall’MVP

Non implementare nella prima versione:

- React;
- React Native;
- pubblicazione store;
- gestione famiglie multiple;
- inviti utenti;
- ruoli complessi;
- account babysitter;
- account donna pulizie;
- statistiche comparative tra coniugi;
- classifiche;
- punteggi;
- gamification;
- notifiche push obbligatorie;
- calendario completo;
- integrazione Google Calendar;
- integrazione WhatsApp;
- integrazione Alexa/Siri;
- AI;
- OCR scontrini;
- gestione budget;
- ricette;
- geolocalizzazione;
- marketplace servizi domestici.

---

# 31. Feature future possibili

Dopo MVP, valutare:

- PWA installabile;
- realtime Supabase;
- notifiche push;
- task ricorrenti personalizzati;
- vista calendario;
- suggerimenti automatici “oggi giornata leggera”;
- template settimanali;
- esportazione backup;
- integrazione Google Calendar;
- modalità vacanza;
- storico completamenti, ma senza spirito competitivo;
- checklist preparazione bimba/asilo;
- gestione scadenze documenti;
- area “cose da comprare online”;
- reminder medicine;
- condivisione limitata con babysitter o donna pulizie, solo se davvero necessaria.

---

# 32. Criteri di accettazione MVP

L’MVP è accettabile se:

1. Peppe e sua moglie possono autenticarsi.
2. Entrambi vedono gli stessi dati.
3. Entrambi possono creare, modificare, completare e rimandare task.
4. La schermata “Oggi” mostra correttamente i task odierni.
5. La schermata “Settimana” mostra correttamente attività future o rimandabili.
6. La lista “Spesa / Mancano cose” consente inserimento rapido e spunta “comprato”.
7. La sezione “Bucato” permette di far avanzare un elemento tra gli stati.
8. La checklist “Reset casa” è utilizzabile e resettabile.
9. La modalità sopravvivenza filtra le cose essenziali.
10. L’interfaccia è comoda da telefono.
11. I dati sono salvati su Supabase.
12. Le RLS impediscono accesso a utenti esterni.
13. Il progetto è documentato nel README.
14. Non usa React o altri framework frontend.

---

# 33. Priorità implementativa consigliata

## Fase 1 — Fondamenta

- struttura HTML;
- CSS mobile-first;
- Supabase client;
- login/logout;
- caricamento household;
- schema SQL.

## Fase 2 — Task

- CRUD task;
- schermata Oggi;
- schermata Settimana;
- completamento;
- rinvio a domani.

## Fase 3 — Spesa

- CRUD shopping item;
- categorie;
- comprato/non comprato.

## Fase 4 — Bucato

- CRUD laundry item;
- stati bucato;
- pulsante “Avanza”.

## Fase 5 — Reset casa

- checklist base;
- reset giornaliero/manuale;
- modalità sopravvivenza.

## Fase 6 — Rifinitura

- stati vuoti;
- messaggi errore;
- loading;
- polish grafico;
- README;
- schema.sql completo.

---

# 34. Nota per Codex

Implementare il progetto in modo semplice e leggibile.

Preferire codice chiaro a codice sofisticato.

Non introdurre framework, build step o dipendenze non necessarie.

La priorità è ottenere una web app privata, stabile e usabile da smartphone da due persone, non un prodotto commerciale completo.

L’app deve aiutare una coppia con una bambina piccola a ridurre attriti e carico mentale nella gestione quotidiana della casa.

