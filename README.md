# CasaFlow

CasaFlow e' una web app privata mobile-first per coordinare la gestione domestica condivisa tra Peppe e sua moglie: task, oggi, settimana, spesa, bucato, reset serale e modalita' sopravvivenza.

L'MVP usa solo HTML, CSS, JavaScript vanilla e Supabase. Non ci sono React, framework frontend o build step obbligatori.

## File principali

- `index.html`: layout single page, login, sezioni e form.
- `style.css`: UI mobile-first calda e leggibile.
- `app.js`: login Supabase, caricamento household, CRUD e rendering.
- `schema.sql`: tabelle, vincoli, trigger `updated_at`, RLS e policy.
- `config.example.js`: esempio di configurazione pubblica Supabase.

## Setup Supabase

1. Crea un progetto Supabase.
2. In Authentication > Users crea manualmente i due utenti autorizzati: Peppe e Moglie. Per il login magic link non serve impostare una password.
3. Apri SQL Editor ed esegui tutto il contenuto di `schema.sql`.
4. Recupera gli `id` dei due utenti da Authentication > Users.
5. Crea la household e associa i due utenti usando il seed commentato in fondo a `schema.sql`.

Esempio:

```sql
insert into households (name) values ('Casa Peppe') returning id;

insert into household_members (household_id, user_id, display_name)
values
  ('HOUSEHOLD_ID', 'AUTH_USER_ID_PEPPE', 'Peppe'),
  ('HOUSEHOLD_ID', 'AUTH_USER_ID_MOGLIE', 'Moglie');
```

Le policy RLS permettono lettura e modifica solo agli utenti presenti in `household_members` per quella household.

## Configurazione locale

Duplica `config.example.js` in `config.js` e inserisci URL e anon key del progetto Supabase:

```js
window.CASAFLOW_CONFIG = {
  supabaseUrl: "https://TUO-PROGETTO.supabase.co",
  supabaseAnonKey: "ANON_PUBLIC_KEY"
};
```

Non inserire service role key o chiavi private nel repository.

## Avvio in locale

Non serve build. Per il magic link e' meglio usare un piccolo server statico, cosi' Supabase puo' riportarti sull'app dopo il click nella email:

```bash
npx serve .
```

Poi apri l'URL locale indicato dal comando.

## Funzionalita' incluse

- Login passwordless con magic link Supabase.
- Controllo che l'utente sia associato alla casa.
- Navigazione: Oggi, Settimana, Spesa, Bucato, Reset.
- CRUD task con completamento, rinvio a domani, modifica e archiviazione.
- Ricorrenze semplici: quando un task ricorrente viene completato, viene creata la prossima occorrenza.
- Oggi: task di oggi e task essenziali senza data.
- Settimana: domani, prossimi giorni e quando possibile.
- Spesa: aggiunta rapida, comprato/ripristina, elimina.
- Bucato: stati a blocchi e pulsante Avanza.
- Reset casa: checklist giornaliera sincronizzata su Supabase.
- Modalita' sopravvivenza: filtro UI per task essenziali, spesa Bimba/Farmacia e reset ridotto.

## Limitazioni MVP

- Niente registrazione pubblica: gli utenti si creano a mano in Supabase.
- Niente realtime: i dati si ricaricano dopo ogni modifica o con il pulsante Aggiorna.
- Niente PWA completa, notifiche push, calendario avanzato o ruoli.
- Le etichette principali seguono i valori richiesti dallo schema, inclusa l'assegnazione `Chi può`.

## Note tecniche

La checklist reset viene creata automaticamente per la data odierna se non esiste ancora. La modalita' sopravvivenza non modifica i dati: cambia solo cosa viene mostrato.
