# CasaFlow - UX backlog

Questo file traccia i miglioramenti UX emersi dall'analisi complessiva dell'app. Per ora e' solo una lista di lavoro: nessuno di questi interventi e' stato implementato.

## Nuove feature

- [ ] Trasformare "Oggi" in una dashboard quotidiana piu' completa, con blocchi sintetici per task di oggi, spesa urgente, bucato da non dimenticare e reset serale.
- [ ] Ridurre la navigazione principale e introdurre una sezione "Pianifica" che raccolga le viste Domani e Settimana, evitando sovrapposizioni mentali tra le due.
- [x] Aggiungere un quick add contestuale: se l'utente aggiunge da Oggi il task nasce per oggi, da Domani nasce per domani, da Pianifica nasce "quando possibile".
- [ ] Semplificare il form di creazione task mostrando subito solo titolo, scadenza semplice e assegnatario, con opzioni avanzate espandibili per categoria, priorita', stato e ricorrenza.
- [ ] Rendere la modalita' Sopravvivenza piu' esplicita come stato globale o come filtro locale chiaramente indicato, con un banner o indicatore visibile quando e' attiva.
- [ ] Convertire il flusso "Pacchetto spesa" in un'azione piu' naturale, ad esempio "Sto andando a fare la spesa", mostrando i dettagli solo dopo il click.
- [ ] Sincronizzare subito ogni azione utente sul server remoto e aggiornare l'interfaccia con stato chiaro di salvataggio, errore o conferma.
- [ ] Aggiungere un indicatore di sincronizzazione, ad esempio "Aggiornato ora", "Salvataggio..." o "Non sincronizzato", per aumentare la fiducia tra i due telefoni.
- [ ] Aggiungere undo leggero dopo azioni come elimina, archivia, completa o chiudi spesa.
- [ ] Introdurre template rapidi per task ricorrenti domestici, ad esempio cambio lenzuola, pannolini, lavastoviglie, spazzatura e medicine.

## Bugfix

- [x] Correggere tutti i problemi di encoding nei file e nei testi UI, ad esempio testi come "Chi puo" o simboli di separazione/chiusura/aggiornamento mostrati male, per evitare label rotte e possibili errori di salvataggio.
- [x] Allineare i valori frontend e database per campi con accenti o apostrofi, in particolare il valore "Chi puo", cosi' i vincoli dello schema non rifiutano dati validi.
- [ ] Evitare che un task normale creato senza data sembri sparire: applicare default coerenti o indicare chiaramente dove verra' mostrato.
- [x] Proteggere la chiusura della spesa: se non tutti gli articoli sono spuntati, chiedere conferma o impedire la chiusura automatica.
- [x] Chiarire il pulsante Reset nella sezione reset casa, sostituendo "Resetta" con un testo meno ambiguo come "Ricomincia checklist".
- [ ] Rendere piu' esplicito il pulsante "Avanza" nel bucato, indicando lo stato successivo reale.
- [ ] Verificare che gli stati vuoti non nascondano informazioni importanti quando la modalita' Sopravvivenza filtra la vista.
- [ ] Gestire meglio eventuali errori di rete durante le azioni, mantenendo l'utente informato senza perdere il contesto.

## Nice to have

- [ ] Aggiungere microcopy piu' domestico nelle azioni principali, mantenendo tono anti-colpa e anti-gestionale.
- [ ] Aggiungere badge numerici nella navigazione per indicare quante cose richiedono attenzione in Oggi, Spesa, Bucato e Reset.
- [ ] Migliorare la leggibilita' della bottom nav su mobile, specialmente se resta con molte voci.
- [ ] Evidenziare in modo morbido gli elementi essenziali senza usare colori allarmistici.
- [ ] Mostrare una breve anteprima della prossima azione utile nella schermata Oggi, ad esempio "Stasera: reset casa".
- [ ] Aggiungere una piccola cronologia recente non competitiva, ad esempio "Fatto oggi", utile solo come rassicurazione.
- [ ] Rendere il carrello spesa piu' scansionabile raggruppando gli articoli per categoria.
- [ ] Valutare icone discrete per navigazione e azioni principali, mantenendo comunque etichette testuali chiare.
- [ ] Aggiungere una modalita' "giornata leggera" per suggerire automaticamente pochi task essenziali quando la lista e' troppo piena.
