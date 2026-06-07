(function () {
  "use strict";

  const TASK_CATEGORIES = ["Bimba", "Spesa", "Bucato", "Cucina", "Pulizie", "Casa / lavoretti", "Amministrativo", "Altro"];
  const SHOPPING_CATEGORIES = ["Bimba", "Alimentari", "Casa", "Farmacia", "Igiene", "Altro"];
  const ASSIGNEES = ["Peppe", "Lina", "Chi puo"];
  const PRIORITIES = ["Essenziale", "Normale", "Bassa"];
  const TASK_STATUSES = ["Da fare", "Fatto", "Archiviato"];
  const RECURRENCES = ["Nessuna", "Giornaliera", "Settimanale", "Ogni 2 settimane", "Mensile"];
  const LAUNDRY_STATUSES = ["Da lavare", "Lavatrice da avviare", "Da stendere / asciugare", "Da piegare", "Da mettere a posto", "Fatto"];
  const RESET_ITEMS = [
    "cucina libera",
    "tavolo sgombro",
    "giochi bimba raccolti",
    "vestiti nel cesto",
    "lavastoviglie caricata o svuotata",
    "cose per domani preparate"
  ];
  const SURVIVAL_RESET_ITEMS = ["cucina libera", "giochi bimba raccolti", "cose per domani preparate"];

  const state = {
    client: null,
    session: null,
    member: null,
    householdId: null,
    activeView: "today",
    survival: false,
    syncStatus: "idle",
    tasks: [],
    shopping: [],
    shoppingTrips: [],
    laundry: [],
    reset: []
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    fillSelects();
    bindEvents();
    $("#today-label").textContent = formatLongDate(new Date());

    const config = window.CASAFLOW_CONFIG;
    if (!config || !config.supabaseUrl || !config.supabaseAnonKey || config.supabaseUrl.includes("INSERIRE")) {
      showLoginError("Configura config.js partendo da config.example.js.");
      return;
    }
    if (!window.supabase) {
      showLoginError("Non riesco a caricare Supabase. Controlla la connessione.");
      return;
    }

    state.client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    const { data, error } = await state.client.auth.getSession();
    if (error) {
      showLoginError("Sessione scaduta. Accedi di nuovo.");
      return;
    }

    if (data.session) {
      state.session = data.session;
      await enterApp();
    }
  }

  function bindEvents() {
    $("#login-form").addEventListener("submit", login);
    $("#logout-btn").addEventListener("click", logout);
    $("#refresh-btn").addEventListener("click", loadAll);
    $("#survival-toggle").addEventListener("change", (event) => {
      state.survival = event.target.checked;
      showToast(state.survival ? "Sopravvivenza attiva: solo essenziale." : "Sopravvivenza disattivata.");
      render();
    });

    $$(".nav-btn").forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.target));
    });

    $("#add-button").addEventListener("click", () => openContextualAdd());
    $$("[data-close-dialog]").forEach((button) => {
      button.addEventListener("click", () => button.closest("dialog").close());
    });
    $("[data-open-task]").addEventListener("click", () => {
      $("#add-dialog").close();
      openTaskDialog();
    });
    $("[data-focus-shopping]").addEventListener("click", () => {
      $("#add-dialog").close();
      setView("shopping");
      $("#shopping-title").focus();
    });
    $("[data-focus-laundry]").addEventListener("click", () => {
      $("#add-dialog").close();
      setView("laundry");
      $("#laundry-title").focus();
    });

    $("#task-form").addEventListener("submit", saveTask);
    $("#shopping-quick-form").addEventListener("submit", addShoppingItem);
    $("#start-shopping-trip-btn").addEventListener("click", showShoppingTripForm);
    $("#shopping-pack-form").addEventListener("submit", createShoppingTrip);
    $("#laundry-quick-form").addEventListener("submit", addLaundryItem);
    $("#reset-today-btn").addEventListener("click", resetTodayChecklist);

    document.addEventListener("click", handleActionClick);
    document.addEventListener("change", handleCheckChange);
    document.addEventListener("submit", handleDynamicSubmit);
  }

  function fillSelects() {
    fillSelect("#task-category", TASK_CATEGORIES);
    fillSelect("#task-assigned", ASSIGNEES);
    fillSelect("#task-priority", PRIORITIES);
    fillSelect("#task-status", TASK_STATUSES);
    fillSelect("#task-recurrence", RECURRENCES);
    fillSelect("#shopping-category", SHOPPING_CATEGORIES);
    fillSelect("#shopping-pack-category", ["Tutte", ...SHOPPING_CATEGORIES]);
    fillSelect("#shopping-pack-assigned", ASSIGNEES);
    fillSelect("#laundry-assigned", ASSIGNEES);
    $("#laundry-assigned").value = "Chi puo";
    $("#shopping-pack-assigned").value = "Chi puo";
  }

  function fillSelect(selector, values) {
    const select = $(selector);
    select.innerHTML = values.map((value) => `<option value="${escapeAttr(value)}">${escapeHtml(value)}</option>`).join("");
  }

  async function login(event) {
    event.preventDefault();
    hideLoginError();
    const email = $("#login-email").value.trim();
    const redirectTo = window.location.href.split("#")[0];
    const { error } = await state.client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: false
      }
    });
    if (error) {
      showLoginError("Non riesco a inviare il link. Controlla l'email.");
      return;
    }
    showLoginError("Ti ho inviato il link di accesso. Aprilo da questa email.");
  }

  async function logout() {
    await state.client.auth.signOut();
    state.session = null;
    state.member = null;
    state.householdId = null;
    $("#app-view").hidden = true;
    $("#login-view").hidden = false;
  }

  async function enterApp() {
    try {
      await loadMember();
      $("#login-view").hidden = true;
      $("#app-view").hidden = false;
      $("#member-label").textContent = `${state.member.display_name} - casa condivisa`;
      setView("today");
      await loadAll();
    } catch (error) {
      $("#app-view").hidden = true;
      $("#login-view").hidden = false;
      showLoginError(error.message || "Errore nel caricamento dei dati.");
    }
  }

  async function loadMember() {
    const { data, error } = await state.client
      .from("household_members")
      .select("id, household_id, display_name")
      .eq("user_id", state.session.user.id)
      .maybeSingle();
    if (error) throw new Error("Errore nel caricamento dei dati.");
    if (!data) throw new Error("Questo account non e' associato alla casa.");
    state.member = data;
    state.householdId = data.household_id;
  }

  async function loadAll() {
    if (!state.householdId) return;
    setGlobalError("");
    setSyncStatus("syncing", "Aggiornamento...");
    try {
      await ensureTodayChecklist();
      const [tasks, shopping, trips, laundry, reset] = await Promise.all([
        state.client.from("tasks").select("*").eq("household_id", state.householdId).neq("status", "Archiviato").order("created_at", { ascending: false }),
        state.client.from("shopping_items").select("*").eq("household_id", state.householdId).order("created_at", { ascending: false }),
        state.client.from("shopping_trips").select("*, shopping_trip_items(*)").eq("household_id", state.householdId).eq("status", "Da fare").order("created_at", { ascending: false }),
        state.client.from("laundry_items").select("*").eq("household_id", state.householdId).neq("laundry_status", "Fatto").order("created_at", { ascending: false }),
        state.client.from("reset_checklist").select("*").eq("household_id", state.householdId).eq("reset_date", todayKey()).order("created_at", { ascending: true })
      ]);
      [tasks, shopping, trips, laundry, reset].forEach((result) => {
        if (result.error) throw result.error;
      });
      state.tasks = tasks.data || [];
      state.shopping = shopping.data || [];
      state.shoppingTrips = (trips.data || []).map((trip) => ({
        ...trip,
        shopping_trip_items: [...(trip.shopping_trip_items || [])].sort((a, b) => a.created_at.localeCompare(b.created_at))
      }));
      state.laundry = laundry.data || [];
      state.reset = reset.data || [];
      setSyncStatus("ok", `Aggiornato ${formatTime(new Date())}`);
      render();
    } catch (error) {
      showActionError("Non riesco ad aggiornare i dati. Quello che vedi potrebbe non essere l'ultima versione.");
    }
  }

  async function ensureTodayChecklist() {
    const { data, error } = await state.client
      .from("reset_checklist")
      .select("id")
      .eq("household_id", state.householdId)
      .eq("reset_date", todayKey())
      .limit(1);
    if (error) throw error;
    if (data.length > 0) return;
    const rows = RESET_ITEMS.map((label) => ({
      household_id: state.householdId,
      reset_date: todayKey(),
      label,
      is_done: false
    }));
    const { error: insertError } = await state.client.from("reset_checklist").insert(rows);
    if (insertError) throw insertError;
  }

  function setView(view) {
    state.activeView = view;
    $$(".view").forEach((section) => section.classList.toggle("active-view", section.dataset.view === view));
    $$(".nav-btn").forEach((button) => button.classList.toggle("active", button.dataset.target === view));
    render();
  }

  function render() {
    renderToday();
    renderTomorrow();
    renderWeek();
    renderShopping();
    renderLaundry();
    renderReset();
    renderNavBadges();
  }

  function renderToday() {
    $("#survival-banner").hidden = !state.survival;
    const todayTasks = state.tasks.filter((task) => task.status === "Da fare" && (task.due_date === todayKey() || (!task.due_date && task.priority === "Essenziale")));
    let tasks = [...todayTasks];
    if (state.survival) tasks = tasks.filter((task) => task.priority === "Essenziale");
    tasks.sort(sortByPriority);
    const hiddenBySurvival = todayTasks.length - tasks.length;
    renderTodayDashboard(todayTasks, tasks);
    renderTodayNextAction(tasks);
    renderSurvivalFilterNote(hiddenBySurvival);
    $("#today-list").innerHTML = tasks.length
      ? tasks.map(renderTaskCard).join("")
      : empty(state.survival && hiddenBySurvival ? "Le cose leggere ci sono, ma per ora restano fuori vista." : state.survival ? "In sopravvivenza non c'e' nulla di essenziale. Respira." : "Per oggi non c'e' nulla di urgente. Respira.");

    const urgentShopping = state.shopping.filter((item) => item.status === "Da comprare" && ["Bimba", "Farmacia"].includes(item.category));
    const box = $("#today-survival-shopping");
    if (state.survival && urgentShopping.length) {
      box.hidden = false;
      box.innerHTML = `<strong>Da tenere a mente</strong>${urgentShopping.map((item) => `<p>${escapeHtml(item.title)} - ${escapeHtml(item.category)}</p>`).join("")}`;
    } else {
      box.hidden = true;
      box.innerHTML = "";
    }
  }

  function renderTodayDashboard(todayTasks, visibleTasks) {
    const urgentShopping = state.shopping.filter((item) => item.status === "Da comprare" && ["Bimba", "Farmacia"].includes(item.category));
    const laundryActive = state.laundry.length;
    const resetPending = state.reset.filter((item) => !item.is_done).length;
    const hiddenText = state.survival && visibleTasks.length !== todayTasks.length
      ? `${visibleTasks.length}/${todayTasks.length} visibili`
      : `${todayTasks.length} ${todayTasks.length === 1 ? "cosa" : "cose"}`;
    $("#today-dashboard").innerHTML = [
      renderTodayMetric("Oggi", hiddenText, nextTodayHint(visibleTasks)),
      renderTodayMetric("Spesa urgente", String(urgentShopping.length), urgentShopping.length ? urgentShopping.slice(0, 2).map((item) => item.title).join(", ") : "Niente di critico"),
      renderTodayMetric("Bucato", String(laundryActive), laundryActive ? nextLaundryHint() : "Niente da seguire"),
      renderTodayMetric("Reset sera", String(resetPending), resetPending ? "Checklist ancora aperta" : "Gia' a posto")
    ].join("");
  }

  function renderTodayMetric(label, value, hint) {
    return `
      <article class="today-metric">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        <p>${escapeHtml(hint)}</p>
      </article>
    `;
  }

  function renderSurvivalFilterNote(hiddenCount) {
    const box = $("#survival-filter-note");
    if (state.survival && hiddenCount > 0) {
      box.hidden = false;
      box.innerHTML = `<strong>Sopravvivenza</strong><p>${hiddenCount} ${hiddenCount === 1 ? "cosa non essenziale resta" : "cose non essenziali restano"} fuori vista. Disattivala quando torna aria.</p>`;
    } else {
      box.hidden = true;
      box.innerHTML = "";
    }
  }

  function renderTodayNextAction(tasks) {
    const box = $("#today-next-action");
    const urgentTask = tasks.find((task) => task.priority === "Essenziale") || tasks[0];
    if (urgentTask) {
      box.innerHTML = `<strong>Prossima cosa utile</strong><p>${escapeHtml(urgentTask.title)} - ${escapeHtml(urgentTask.assigned_to)}</p>`;
      return;
    }
    const urgentShopping = state.shopping.find((item) => item.status === "Da comprare" && ["Bimba", "Farmacia"].includes(item.category));
    if (urgentShopping) {
      box.innerHTML = `<strong>Prossima cosa utile</strong><p>Tenere a mente: ${escapeHtml(urgentShopping.title)}</p>`;
      return;
    }
    const laundry = state.laundry[0];
    if (laundry) {
      box.innerHTML = `<strong>Prossima cosa utile</strong><p>Bucato: ${escapeHtml(laundry.title)} (${escapeHtml(laundry.laundry_status)})</p>`;
      return;
    }
    const resetPending = state.reset.filter((item) => !item.is_done).length;
    box.innerHTML = `<strong>Prossima cosa utile</strong><p>${resetPending ? "Stasera: reset casa." : "Per ora e' tutto leggero."}</p>`;
  }

  function renderTomorrow() {
    const tomorrow = dateKey(addDays(new Date(), 1));
    const tasks = state.tasks.filter((task) => task.status === "Da fare" && task.due_date === tomorrow).sort(sortByPriority);
    $("#tomorrow-list").innerHTML = tasks.length
      ? `<section class="group"><h3>Domani</h3><div class="group-items">${tasks.map(renderTaskCard).join("")}</div></section>`
      : empty("Domani e' ancora leggero. Lo prepariamo con calma.");
  }

  function renderWeek() {
    const today = parseDate(todayKey());
    const tomorrow = addDays(today, 1);
    const weekEnd = addDays(today, 7);
    const todo = state.tasks.filter((task) => task.status === "Da fare");
    const nextTasks = todo.filter((task) => task.due_date && parseDate(task.due_date) > tomorrow && parseDate(task.due_date) <= weekEnd).sort(sortByDateThenPriority);
    const somedayTasks = todo.filter((task) => !task.due_date && task.priority !== "Essenziale").sort(sortByPriority);
    const html = [
      renderTaskGroup("Prossimi giorni", nextTasks),
      renderTaskGroup("Quando possibile", somedayTasks)
    ].join("");
    $("#week-list").innerHTML = html.includes("task-card") ? html : empty("Nessun lavoretto in sospeso per questa settimana.");
  }

  function renderTaskGroup(title, tasks) {
    if (!tasks.length) return "";
    return `<section class="group"><h3>${title}</h3><div class="group-items">${tasks.map(renderTaskCard).join("")}</div></section>`;
  }

  function renderTaskCard(task) {
    const trip = state.shoppingTrips.find((item) => item.task_id === task.id);
    return `
      <article class="card task-card" data-id="${task.id}">
        <button class="card-dismiss" type="button" data-action="task-archive" data-id="${task.id}" aria-label="Togli dalla lista" title="Togli dalla lista">x</button>
        <h3>${escapeHtml(task.title)}</h3>
        <div class="meta">
          <span class="badge">${escapeHtml(task.category)}</span>
          <span class="badge">${escapeHtml(task.assigned_to)}</span>
          <span class="badge ${task.priority.toLowerCase()}">${escapeHtml(task.priority)}</span>
          <span class="badge">${taskDateLabel(task)}</span>
          ${task.recurrence !== "Nessuna" ? `<span class="badge">${escapeHtml(task.recurrence)}</span>` : ""}
        </div>
        ${task.note ? `<p class="note">${escapeHtml(task.note)}</p>` : ""}
        ${trip ? renderShoppingTripChecklist(trip) : ""}
        <div class="card-actions">
          <button class="primary action-done" type="button" data-action="task-done" data-id="${task.id}">Segna fatto</button>
          ${renderTaskEarlierAction(task)}
          <button class="ghost" type="button" data-action="task-edit" data-id="${task.id}">Modifica</button>
          ${renderTaskLaterAction(task)}
        </div>
      </article>
    `;
  }

  function renderTaskEarlierAction(task) {
    if (!task.due_date) return "";
    const today = todayKey();
    if (task.due_date <= today) return "";
    return `<button class="ghost action-earlier" type="button" data-action="task-earlier" data-id="${task.id}">Anticipa 1 giorno</button>`;
  }

  function renderTaskLaterAction(task) {
    if (!task.due_date) {
      return `<button class="ghost action-later" type="button" data-action="task-schedule-tomorrow" data-id="${task.id}">Metti domani</button>`;
    }
    return `<button class="ghost action-later" type="button" data-action="task-later" data-id="${task.id}">Posticipa 1 giorno</button>`;
  }

  function renderShopping() {
    const packedIds = activePackedShoppingIds();
    const items = state.shopping
      .filter((item) => !packedIds.has(item.id))
      .sort((a, b) => (a.status === b.status ? 0 : a.status === "Da comprare" ? -1 : 1));
    $("#shopping-trips").innerHTML = state.shoppingTrips.length
      ? state.shoppingTrips.map(renderShoppingTripCard).join("")
      : "";
    $("#shopping-list").innerHTML = items.length
      ? items.map((item) => `
          <article class="card" data-id="${item.id}">
            <h3>${escapeHtml(item.title)}</h3>
            <div class="meta">
              <span class="badge">${escapeHtml(item.category)}</span>
              <span class="badge">${escapeHtml(item.status)}</span>
            </div>
            ${item.note ? `<p class="note">${escapeHtml(item.note)}</p>` : ""}
            <div class="card-actions">
              <button class="primary" type="button" data-action="shopping-toggle" data-id="${item.id}">${item.status === "Comprato" ? "Rimetti in lista" : "Preso"}</button>
              <button class="ghost" type="button" data-action="shopping-delete" data-id="${item.id}">Elimina</button>
            </div>
          </article>
        `).join("")
      : empty("La lista e' vuota. Per ora non manca niente.");
  }

  function renderShoppingTripCard(trip) {
    return `
      <article class="card">
        <h3>${escapeHtml(trip.title)}</h3>
        <div class="meta">
          <span class="badge">Task spesa</span>
          <span class="badge">${escapeHtml(trip.assigned_to)}</span>
        </div>
        ${renderShoppingTripChecklist(trip)}
        <div class="card-actions">
          <button class="primary" type="button" data-action="trip-complete" data-id="${trip.id}">Spesa finita</button>
        </div>
      </article>
    `;
  }

  function renderShoppingTripChecklist(trip) {
    const items = trip.shopping_trip_items || [];
    const doneCount = items.filter((item) => item.is_done).length;
    const groupedItems = SHOPPING_CATEGORIES
      .map((category) => ({
        category,
        items: items.filter((item) => item.category === category)
      }))
      .filter((group) => group.items.length);
    return `
      <p class="progress-line">${doneCount}/${items.length} nel carrello</p>
      <div class="trip-items">
        ${groupedItems.map((group) => `
          <section class="trip-category">
            <h4 class="trip-category-title">${escapeHtml(group.category)}</h4>
            ${group.items.map((item) => `
              <label class="trip-item ${item.is_done ? "is-done" : ""}">
                <input type="checkbox" data-action="trip-item-toggle" data-id="${item.id}" ${item.is_done ? "checked" : ""}>
                <span>${escapeHtml(item.title)}</span>
              </label>
            `).join("")}
          </section>
        `).join("")}
      </div>
      <form class="trip-add-form" data-action="trip-add-item" data-id="${trip.id}">
        <input name="title" type="text" placeholder="Aggiungi al carrello" required>
        <select name="category" aria-label="Categoria nuovo articolo">
          ${SHOPPING_CATEGORIES.map((category) => `<option value="${escapeAttr(category)}">${escapeHtml(category)}</option>`).join("")}
        </select>
        <button class="ghost" type="submit">Aggiungi</button>
      </form>
    `;
  }

  function renderLaundry() {
    const html = LAUNDRY_STATUSES.filter((status) => status !== "Fatto").map((status) => {
      const items = state.laundry.filter((item) => item.laundry_status === status);
      if (!items.length) return "";
      return `
        <section class="group">
          <h3>${escapeHtml(status)}</h3>
          <div class="group-items">
            ${items.map((item) => `
              <article class="card" data-id="${item.id}">
                <h3>${escapeHtml(item.title)}</h3>
                <div class="meta"><span class="badge">${escapeHtml(item.assigned_to)}</span></div>
                ${item.note ? `<p class="note">${escapeHtml(item.note)}</p>` : ""}
                <div class="card-actions">
                  <button class="primary" type="button" data-action="laundry-next" data-id="${item.id}">${nextLaundryActionLabel(item.laundry_status)}</button>
                  <button class="ghost" type="button" data-action="laundry-delete" data-id="${item.id}">Elimina</button>
                </div>
              </article>
            `).join("")}
          </div>
        </section>
      `;
    }).join("");
    $("#laundry-list").innerHTML = html || empty("Nessun bucato registrato.");
  }

  function renderReset() {
    const visible = state.survival ? state.reset.filter((item) => SURVIVAL_RESET_ITEMS.includes(item.label)) : state.reset;
    const hiddenBySurvival = state.reset.length - visible.length;
    $("#reset-list").innerHTML = visible.length
      ? visible.map((item) => `
          <label class="check-row ${item.is_done ? "is-done" : ""}">
            <input type="checkbox" data-action="reset-toggle" data-id="${item.id}" ${item.is_done ? "checked" : ""}>
            <span>${escapeHtml(item.label)}</span>
          </label>
        `).join("")
      : empty(state.survival && hiddenBySurvival ? `${hiddenBySurvival} voci leggere del reset sono nascoste dalla sopravvivenza.` : "Il reset di oggi e' pronto appena serve.");
  }

  async function saveTask(event) {
    event.preventDefault();
    const id = $("#task-id").value;
    const payload = {
      household_id: state.householdId,
      title: $("#task-title").value.trim(),
      note: $("#task-note").value.trim() || null,
      category: $("#task-category").value,
      assigned_to: $("#task-assigned").value,
      priority: $("#task-priority").value,
      due_date: $("#task-due-date").value || null,
      status: $("#task-status").value,
      recurrence: $("#task-recurrence").value,
      created_by: state.session.user.id
    };
    if (!payload.title) return showToast("Inserisci un titolo.");
    setSyncStatus("saving", "Salvataggio...");
    const request = id
      ? state.client.from("tasks").update(payload).eq("id", id)
      : state.client.from("tasks").insert(payload);
    const { error } = await request;
    if (error) return showActionError("Non riesco a salvare il task. Riprova tra poco.");
    $("#task-dialog").close();
    await loadAll();
  }

  async function addShoppingItem(event) {
    event.preventDefault();
    const title = $("#shopping-title").value.trim();
    if (!title) return showToast("Inserisci cosa manca.");
    setSyncStatus("saving", "Salvataggio...");
    const { error } = await state.client.from("shopping_items").insert({
      household_id: state.householdId,
      title,
      category: $("#shopping-category").value,
      status: "Da comprare",
      created_by: state.session.user.id
    });
    if (error) return showActionError("Non riesco ad aggiungere questa cosa alla spesa.");
    $("#shopping-title").value = "";
    await loadAll();
  }

  async function createShoppingTrip(event) {
    event.preventDefault();
    const category = $("#shopping-pack-category").value;
    const assignedTo = $("#shopping-pack-assigned").value;
    const packedIds = activePackedShoppingIds();
    const candidates = state.shopping.filter((item) => (
      item.status === "Da comprare" &&
      !packedIds.has(item.id) &&
      (category === "Tutte" || item.category === category)
    ));

    if (!candidates.length) return showToast("Non ci sono cose da mettere in lista per questa categoria.");
    setSyncStatus("saving", "Salvataggio...");

    const title = $("#shopping-pack-title").value.trim() || (category === "Tutte" ? "Fare la spesa" : `Spesa ${category.toLowerCase()}`);
    const { data: task, error: taskError } = await state.client
      .from("tasks")
      .insert({
        household_id: state.householdId,
        title,
        note: candidates.map((item) => `- ${item.title}`).join("\n"),
        category: "Spesa",
        assigned_to: assignedTo,
        priority: category === "Bimba" || category === "Farmacia" ? "Essenziale" : "Normale",
        due_date: todayKey(),
        status: "Da fare",
        recurrence: "Nessuna",
        created_by: state.session.user.id
      })
      .select()
      .single();
    if (taskError) return showActionError("Non riesco a creare il task spesa.");

    const { data: trip, error: tripError } = await state.client
      .from("shopping_trips")
      .insert({
        household_id: state.householdId,
        task_id: task.id,
        title,
        assigned_to: assignedTo,
        status: "Da fare",
        created_by: state.session.user.id
      })
      .select()
      .single();
    if (tripError) return showActionError("Task creato, ma non riesco a preparare la lista carrello.");

    const rows = candidates.map((item) => ({
      household_id: state.householdId,
      trip_id: trip.id,
      shopping_item_id: item.id,
      title: item.title,
      category: item.category,
      note: item.note,
      is_done: false
    }));
    const { error: itemsError } = await state.client.from("shopping_trip_items").insert(rows);
    if (itemsError) return showActionError("Non riesco ad aggiungere gli articoli alla lista spesa.");

    $("#shopping-pack-title").value = "";
    $("#shopping-pack-form").hidden = true;
    showToast("Lista spesa pronta e assegnata.");
    await loadAll();
    setView("today");
  }

  async function addLaundryItem(event) {
    event.preventDefault();
    const title = $("#laundry-title").value.trim();
    if (!title) return showToast("Inserisci un titolo per il bucato.");
    setSyncStatus("saving", "Salvataggio...");
    const { error } = await state.client.from("laundry_items").insert({
      household_id: state.householdId,
      title,
      assigned_to: $("#laundry-assigned").value,
      laundry_status: "Da lavare",
      created_by: state.session.user.id
    });
    if (error) return showActionError("Non riesco ad aggiungere questo bucato.");
    $("#laundry-title").value = "";
    await loadAll();
  }

  async function handleActionClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const id = button.dataset.id;
    if (action === "task-done") return completeTask(id);
    if (action === "task-schedule-tomorrow") return moveTaskDate(id, 1, new Date());
    if (action === "task-earlier") return moveTaskDate(id, -1);
    if (action === "task-later") return moveTaskDate(id, 1);
    if (action === "task-edit") return openTaskDialog(state.tasks.find((task) => task.id === id));
    if (action === "task-archive") return updateTask(id, { status: "Archiviato" });
    if (action === "shopping-toggle") return toggleShopping(id);
    if (action === "shopping-delete") return deleteRow("shopping_items", id);
    if (action === "trip-complete") return completeShoppingTrip(id);
    if (action === "laundry-next") return advanceLaundry(id);
    if (action === "laundry-delete") return deleteRow("laundry_items", id);
  }

  async function handleCheckChange(event) {
    if (event.target.dataset.action === "trip-item-toggle") {
      setSyncStatus("saving", "Salvataggio...");
      const { error } = await state.client.from("shopping_trip_items").update({ is_done: event.target.checked }).eq("id", event.target.dataset.id);
      if (error) return showActionError("Non riesco a spuntare l'articolo del carrello.");
      await loadAll();
      return;
    }
    if (event.target.dataset.action !== "reset-toggle") return;
    setSyncStatus("saving", "Salvataggio...");
    const { error } = await state.client.from("reset_checklist").update({ is_done: event.target.checked }).eq("id", event.target.dataset.id);
    if (error) return showActionError("Non riesco ad aggiornare il reset.");
    await loadAll();
  }

  async function handleDynamicSubmit(event) {
    const form = event.target.closest("[data-action='trip-add-item']");
    if (!form) return;
    event.preventDefault();
    await addItemToShoppingTrip(form.dataset.id, form);
  }

  async function completeTask(id) {
    const trip = state.shoppingTrips.find((item) => item.task_id === id);
    if (trip) return completeShoppingTrip(trip.id);

    const task = state.tasks.find((item) => item.id === id);
    if (!task) return;
    setSyncStatus("saving", "Salvataggio...");
    const { error } = await state.client.from("tasks").update({ status: "Fatto", completed_at: new Date().toISOString() }).eq("id", id);
    if (error) return showActionError("Non riesco a segnare il task come fatto.");
    if (task.recurrence !== "Nessuna") {
      const nextDate = nextRecurrenceDate(task.due_date || todayKey(), task.recurrence);
      const copy = {
        household_id: state.householdId,
        title: task.title,
        note: task.note,
        category: task.category,
        assigned_to: task.assigned_to,
        priority: task.priority,
        due_date: nextDate,
        status: "Da fare",
        recurrence: task.recurrence,
        created_by: state.session.user.id
      };
      const { error: copyError } = await state.client.from("tasks").insert(copy);
      if (copyError) return showActionError("Task completato, ma non riesco a creare la prossima ricorrenza.");
    }
    await loadAll();
  }

  async function updateTask(id, payload) {
    setSyncStatus("saving", "Salvataggio...");
    const { error } = await state.client.from("tasks").update(payload).eq("id", id);
    if (error) return showActionError("Non riesco ad aggiornare il task.");
    await loadAll();
  }

  async function moveTaskDate(id, days, fallbackDate) {
    const task = state.tasks.find((item) => item.id === id);
    if (!task && !fallbackDate) return;
    const baseDate = task && task.due_date ? parseDate(task.due_date) : fallbackDate;
    if (!baseDate) return;
    const nextDate = dateKey(addDays(baseDate, days));
    return updateTask(id, { due_date: nextDate, status: "Da fare", completed_at: null });
  }

  async function toggleShopping(id) {
    const item = state.shopping.find((row) => row.id === id);
    if (!item) return;
    setSyncStatus("saving", "Salvataggio...");
    const bought = item.status !== "Comprato";
    const { error } = await state.client.from("shopping_items").update({
      status: bought ? "Comprato" : "Da comprare",
      bought_at: bought ? new Date().toISOString() : null
    }).eq("id", id);
    if (error) return showActionError("Non riesco ad aggiornare la spesa.");
    await loadAll();
  }

  async function completeShoppingTrip(id) {
    const trip = state.shoppingTrips.find((item) => item.id === id);
    if (!trip) return;
    const pendingItems = (trip.shopping_trip_items || []).filter((item) => !item.is_done);
    if (pendingItems.length) {
      const message = pendingItems.length === 1
        ? "C'e' ancora 1 articolo non spuntato. Vuoi chiudere comunque la spesa?"
        : `Ci sono ancora ${pendingItems.length} articoli non spuntati. Vuoi chiudere comunque la spesa?`;
      if (!window.confirm(message)) return;
    }
    setSyncStatus("saving", "Salvataggio...");
    const now = new Date().toISOString();
    const sourceIds = (trip.shopping_trip_items || []).map((item) => item.shopping_item_id).filter(Boolean);

    if (sourceIds.length) {
      const { error: shoppingError } = await state.client
        .from("shopping_items")
        .update({ status: "Comprato", bought_at: now })
        .in("id", sourceIds);
      if (shoppingError) return showActionError("Non riesco a chiudere la spesa.");
    }

    const { error: itemsError } = await state.client
      .from("shopping_trip_items")
      .update({ is_done: true })
      .eq("trip_id", id);
    if (itemsError) return showActionError("Non riesco a chiudere la spesa.");

    const { error: tripError } = await state.client
      .from("shopping_trips")
      .update({ status: "Fatto", completed_at: now })
      .eq("id", id);
    if (tripError) return showActionError("Non riesco a chiudere la spesa.");

    const { error: taskError } = await state.client
      .from("tasks")
      .update({ status: "Fatto", completed_at: now })
      .eq("id", trip.task_id);
    if (taskError) return showActionError("Spesa chiusa, ma non riesco a completare il task.");

    showToast("Spesa chiusa. Bel colpo.");
    await loadAll();
  }

  async function addItemToShoppingTrip(tripId, form) {
    const trip = state.shoppingTrips.find((item) => item.id === tripId);
    if (!trip) return;
    const title = form.elements.title.value.trim();
    const category = form.elements.category.value;
    if (!title) return showToast("Inserisci cosa aggiungere.");
    setSyncStatus("saving", "Salvataggio...");

    const { data: shoppingItem, error: shoppingError } = await state.client
      .from("shopping_items")
      .insert({
        household_id: state.householdId,
        title,
        category,
        status: "Da comprare",
        created_by: state.session.user.id
      })
      .select()
      .single();
    if (shoppingError) return showActionError("Non riesco ad aggiungere l'articolo.");

    const { error: tripItemError } = await state.client
      .from("shopping_trip_items")
      .insert({
        household_id: state.householdId,
        trip_id: tripId,
        shopping_item_id: shoppingItem.id,
        title,
        category,
        is_done: false
      });
    if (tripItemError) return showActionError("Articolo creato, ma non riesco ad aggiungerlo al carrello.");

    const lines = [...(trip.shopping_trip_items || []).map((item) => `- ${item.title}`), `- ${title}`];
    await state.client.from("tasks").update({ note: lines.join("\n") }).eq("id", trip.task_id);

    form.reset();
    showToast("Aggiunto al carrello.");
    await loadAll();
  }

  async function advanceLaundry(id) {
    const item = state.laundry.find((row) => row.id === id);
    if (!item) return;
    setSyncStatus("saving", "Salvataggio...");
    const next = LAUNDRY_STATUSES[LAUNDRY_STATUSES.indexOf(item.laundry_status) + 1] || "Fatto";
    const payload = { laundry_status: next, completed_at: next === "Fatto" ? new Date().toISOString() : null };
    const { error } = await state.client.from("laundry_items").update(payload).eq("id", id);
    if (error) return showActionError("Non riesco ad aggiornare il bucato.");
    await loadAll();
  }

  async function deleteRow(table, id) {
    setSyncStatus("saving", "Salvataggio...");
    const { error } = await state.client.from(table).delete().eq("id", id);
    if (error) return showActionError("Non riesco a eliminare. Nulla e' stato tolto dalla lista.");
    await loadAll();
  }

  async function resetTodayChecklist() {
    setSyncStatus("saving", "Salvataggio...");
    const { error } = await state.client
      .from("reset_checklist")
      .update({ is_done: false })
      .eq("household_id", state.householdId)
      .eq("reset_date", todayKey());
    if (error) return showActionError("Non riesco a ricominciare la checklist.");
    await loadAll();
  }

  function openContextualAdd() {
    if (state.activeView === "shopping") {
      $("#shopping-title").focus();
      return;
    }
    if (state.activeView === "laundry") {
      $("#laundry-title").focus();
      return;
    }
    openTaskDialog();
  }

  function showShoppingTripForm() {
    const form = $("#shopping-pack-form");
    form.hidden = !form.hidden;
    if (!form.hidden) $("#shopping-pack-title").focus();
  }

  function renderNavBadges() {
    const counts = navCounts();
    $$(".nav-btn").forEach((button) => {
      const count = counts[button.dataset.target] || 0;
      const badge = button.querySelector(".nav-count");
      badge.textContent = count > 99 ? "99+" : String(count);
      badge.classList.toggle("has-count", count > 0);
      badge.setAttribute("aria-label", `${count} cose`);
    });
  }

  function navCounts() {
    const today = todayKey();
    const tomorrow = dateKey(addDays(new Date(), 1));
    const weekEnd = dateKey(addDays(new Date(), 7));
    const todo = state.tasks.filter((task) => task.status === "Da fare");
    const packedIds = activePackedShoppingIds();
    return {
      today: todo.filter((task) => task.due_date === today || (!task.due_date && task.priority === "Essenziale")).length,
      plan: todo.filter((task) => task.due_date === tomorrow || (task.due_date && task.due_date > tomorrow && task.due_date <= weekEnd) || (!task.due_date && task.priority !== "Essenziale")).length,
      shopping: state.shopping.filter((item) => item.status === "Da comprare" && !packedIds.has(item.id)).length + state.shoppingTrips.length,
      laundry: state.laundry.length,
      reset: state.reset.filter((item) => !item.is_done).length
    };
  }

  function defaultDueDateForActiveView() {
    if (state.activeView === "today") return todayKey();
    return "";
  }

  function openTaskDialog(task) {
    $("#task-dialog-title").textContent = task ? "Modifica task" : "Aggiungi task";
    $("#task-id").value = task ? task.id : "";
    $("#task-title").value = task ? task.title : "";
    $("#task-note").value = task && task.note ? task.note : "";
    $("#task-category").value = task ? task.category : "Altro";
    $("#task-assigned").value = task ? task.assigned_to : "Chi puo";
    $("#task-priority").value = task ? task.priority : "Normale";
    $("#task-due-date").value = task && task.due_date ? task.due_date : defaultDueDateForActiveView();
    $("#task-status").value = task ? task.status : "Da fare";
    $("#task-recurrence").value = task ? task.recurrence : "Nessuna";
    $(".advanced-fields").open = Boolean(task && (task.note || task.category !== "Altro" || task.priority !== "Normale" || task.status !== "Da fare" || task.recurrence !== "Nessuna"));
    $("#task-dialog").showModal();
  }

  function activePackedShoppingIds() {
    const ids = new Set();
    state.shoppingTrips.forEach((trip) => {
      (trip.shopping_trip_items || []).forEach((item) => {
        if (item.shopping_item_id) ids.add(item.shopping_item_id);
      });
    });
    return ids;
  }

  function sortByPriority(a, b) {
    return PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority) || new Date(b.created_at) - new Date(a.created_at);
  }

  function sortByDateThenPriority(a, b) {
    return parseDate(a.due_date) - parseDate(b.due_date) || sortByPriority(a, b);
  }

  function nextRecurrenceDate(fromDate, recurrence) {
    const date = parseDate(fromDate);
    if (recurrence === "Giornaliera") return dateKey(addDays(date, 1));
    if (recurrence === "Settimanale") return dateKey(addDays(date, 7));
    if (recurrence === "Ogni 2 settimane") return dateKey(addDays(date, 14));
    if (recurrence === "Mensile") {
      date.setMonth(date.getMonth() + 1);
      return dateKey(date);
    }
    return null;
  }

  function todayKey() {
    return dateKey(new Date());
  }

  function dateKey(date) {
    const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const year = local.getFullYear();
    const month = String(local.getMonth() + 1).padStart(2, "0");
    const day = String(local.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseDate(value) {
    const parts = value.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function addDays(date, days) {
    const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  function formatLongDate(date) {
    return new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long" }).format(date);
  }

  function formatTime(date) {
    return new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit" }).format(date);
  }

  function nextLaundryActionLabel(status) {
    const next = LAUNDRY_STATUSES[LAUNDRY_STATUSES.indexOf(status) + 1] || "Fatto";
    return next === "Fatto" ? "Segna fatto" : `Verso: ${next}`;
  }

  function nextTodayHint(tasks) {
    if (!tasks.length) return "Niente di urgente";
    const essential = tasks.find((task) => task.priority === "Essenziale");
    return essential ? essential.title : tasks[0].title;
  }

  function nextLaundryHint() {
    const firstStatus = LAUNDRY_STATUSES.find((status) => status !== "Fatto" && state.laundry.some((item) => item.laundry_status === status));
    if (!firstStatus) return "Niente da seguire";
    const count = state.laundry.filter((item) => item.laundry_status === firstStatus).length;
    return `${count} ${count === 1 ? "giro" : "giri"}: ${firstStatus.toLowerCase()}`;
  }

  function formatShortDate(value) {
    return new Intl.DateTimeFormat("it-IT", { weekday: "short", day: "numeric", month: "short" }).format(parseDate(value));
  }

  function taskDateLabel(task) {
    return task.due_date ? formatShortDate(task.due_date) : "Quando possibile";
  }

  function empty(text) {
    return `<div class="empty">${escapeHtml(text)}</div>`;
  }

  function setGlobalError(message) {
    const box = $("#global-error");
    box.textContent = message;
    box.hidden = !message;
  }

  function setSyncStatus(status, message) {
    state.syncStatus = status;
    const box = $("#sync-status");
    box.textContent = message;
    box.dataset.status = status;
  }

  function showActionError(message) {
    setSyncStatus("error", "Non sincronizzato");
    setGlobalError(`${message} I dati sullo schermo sono rimasti com'erano prima del tentativo.`);
    showToast(message);
  }

  function showLoginError(message) {
    const box = $("#login-error");
    box.textContent = message;
    box.hidden = false;
  }

  function hideLoginError() {
    $("#login-error").hidden = true;
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.hidden = true;
    }, 3500);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();
