const DEMO_EMAIL = "demo@coffee.local";
const DEMO_PASSWORD = "coffee123";

const defaultIngredients = [
  { id: "coffee-ethiopia", name: "Эфиопия натуральная", category: "Кофе", calories: 1, creaminess: 1, sweetness: 2, bitterness: 4, aroma: "ягоды, жасмин, какао", cost: 420, available: true },
  { id: "coffee-brazil", name: "Бразилия ореховая", category: "Кофе", calories: 1, creaminess: 1, sweetness: 3, bitterness: 3, aroma: "орехи, шоколад", cost: 360, available: true },
  { id: "milk-cream", name: "Сливки 10%", category: "Молочная часть", calories: 5, creaminess: 5, sweetness: 2, bitterness: 1, aroma: "сливки", cost: 140, available: true },
  { id: "milk-oat", name: "Овсяное молоко", category: "Молочная часть", calories: 3, creaminess: 4, sweetness: 3, bitterness: 1, aroma: "овес, печенье", cost: 210, available: false },
  { id: "syrup-vanilla", name: "Ванильный сироп", category: "Сиропы", calories: 4, creaminess: 1, sweetness: 5, bitterness: 1, aroma: "ваниль", cost: 260, available: true },
  { id: "syrup-caramel", name: "Соленая карамель", category: "Сиропы", calories: 5, creaminess: 2, sweetness: 5, bitterness: 1, aroma: "карамель, соль", cost: 280, available: true },
  { id: "spice-cardamom", name: "Кардамон", category: "Специи", calories: 1, creaminess: 1, sweetness: 1, bitterness: 2, aroma: "пряный, цитрус", cost: 90, available: true },
  { id: "finish-lavender", name: "Лаванда", category: "Финиш", calories: 1, creaminess: 1, sweetness: 1, bitterness: 1, aroma: "цветы, мед", cost: 120, available: false },
  { id: "coffee-colombia", name: "Колумбия карамельная", category: "Кофе", calories: 1, creaminess: 1, sweetness: 3, bitterness: 3, aroma: "карамель, яблоко", cost: 390, available: true },
  { id: "coffee-kenya", name: "Кения ягодная", category: "Кофе", calories: 1, creaminess: 1, sweetness: 2, bitterness: 4, aroma: "смородина, цитрус", cost: 460, available: true },
  { id: "coffee-guatemala", name: "Гватемала какао", category: "Кофе", calories: 1, creaminess: 1, sweetness: 3, bitterness: 3, aroma: "какао, специи", cost: 410, available: false },
  { id: "milk-coconut", name: "Кокосовое молоко", category: "Молочная часть", calories: 4, creaminess: 4, sweetness: 3, bitterness: 1, aroma: "кокос, сливки", cost: 240, available: true },
  { id: "milk-almond", name: "Миндальное молоко", category: "Молочная часть", calories: 3, creaminess: 3, sweetness: 2, bitterness: 1, aroma: "миндаль, марципан", cost: 230, available: true },
  { id: "milk-lactose-free", name: "Молоко без лактозы", category: "Молочная часть", calories: 3, creaminess: 4, sweetness: 3, bitterness: 1, aroma: "молоко, карамель", cost: 180, available: true },
  { id: "syrup-hazelnut", name: "Ореховый сироп", category: "Сиропы", calories: 4, creaminess: 2, sweetness: 5, bitterness: 1, aroma: "фундук, пралине", cost: 270, available: true },
  { id: "syrup-maple", name: "Кленовый сироп", category: "Сиропы", calories: 4, creaminess: 1, sweetness: 5, bitterness: 1, aroma: "клен, древесина", cost: 310, available: false },
  { id: "syrup-coconut", name: "Кокосовый сироп", category: "Сиропы", calories: 4, creaminess: 2, sweetness: 5, bitterness: 1, aroma: "кокос, ваниль", cost: 260, available: true },
  { id: "sweet-honey", name: "Цветочный мед", category: "Сладость и баланс", calories: 4, creaminess: 1, sweetness: 5, bitterness: 1, aroma: "мед, цветы", cost: 160, available: true },
  { id: "sweet-brown-sugar", name: "Тростниковый сахар", category: "Сладость и баланс", calories: 3, creaminess: 1, sweetness: 4, bitterness: 1, aroma: "карамель, патока", cost: 80, available: true },
  { id: "sweet-sea-salt", name: "Морская соль", category: "Сладость и баланс", calories: 1, creaminess: 1, sweetness: 1, bitterness: 1, aroma: "соль, минералы", cost: 70, available: true },
  { id: "spice-cinnamon", name: "Корица", category: "Специи", calories: 1, creaminess: 1, sweetness: 2, bitterness: 2, aroma: "корица, выпечка", cost: 85, available: true },
  { id: "spice-nutmeg", name: "Мускатный орех", category: "Специи", calories: 1, creaminess: 1, sweetness: 1, bitterness: 3, aroma: "мускат, пряник", cost: 95, available: true },
  { id: "spice-ginger", name: "Имбирь", category: "Специи", calories: 1, creaminess: 1, sweetness: 1, bitterness: 3, aroma: "имбирь, лимон", cost: 90, available: false },
  { id: "finish-orange-zest", name: "Апельсиновая цедра", category: "Финиш", calories: 1, creaminess: 1, sweetness: 2, bitterness: 2, aroma: "апельсин, масло", cost: 110, available: true },
  { id: "finish-cocoa", name: "Какао-пудра", category: "Финиш", calories: 2, creaminess: 1, sweetness: 1, bitterness: 4, aroma: "какао, шоколад", cost: 130, available: true },
  { id: "finish-matcha", name: "Матча", category: "Финиш", calories: 2, creaminess: 1, sweetness: 1, bitterness: 4, aroma: "чай, трава", cost: 220, available: false },
  { id: "finish-rose", name: "Розовая вода", category: "Финиш", calories: 1, creaminess: 1, sweetness: 2, bitterness: 1, aroma: "роза, личи", cost: 190, available: true },
  { id: "finish-chili", name: "Щепотка чили", category: "Финиш", calories: 1, creaminess: 1, sweetness: 1, bitterness: 3, aroma: "перец, тепло", cost: 75, available: true },
];

let ingredients = loadIngredients();
let editingId = null;
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
const defaultIngredientIds = new Set(defaultIngredients.map((item) => item.id));

const authDialog = document.querySelector("#catalogDialog");
const authForm = document.querySelector("#catalogAuthForm");
const loginButton = document.querySelector("#catalogLogin");
const ingredientForm = document.querySelector("#ingredientForm");
const table = document.querySelector("#ingredientTable");
const pagination = document.querySelector("#catalogPagination");
const searchInput = document.querySelector("#catalogSearch");
const categoryFilter = document.querySelector("#categoryFilter");
const showHiddenControl = document.querySelector("#showHiddenControl");
const showHiddenInput = document.querySelector("#showHiddenIngredients");
const authCard = document.querySelector("#authCard");
const registrationHint = document.querySelector("#registrationHint");

function isRegistered() {
  return localStorage.getItem("ca_registered") === "true";
}

function loadIngredients() {
  const stored = localStorage.getItem("ca_ingredients");
  if (!stored) return defaultIngredients;
  const saved = JSON.parse(stored);
  const savedIds = new Set(saved.map((item) => item.id));
  const missingDefaults = defaultIngredients.filter((item) => !savedIds.has(item.id));
  return [...saved, ...missingDefaults];
}

function saveIngredients() {
  localStorage.setItem("ca_ingredients", JSON.stringify(ingredients));
}

function getUserKey() {
  const registration = JSON.parse(localStorage.getItem("ca_registration") || "null");
  return String(registration?.email || DEMO_EMAIL).trim().toLowerCase();
}

function loadPersonalSettings() {
  const stored = localStorage.getItem(`ca_personal_ingredients:${getUserKey()}`);
  return stored ? JSON.parse(stored) : {};
}

function savePersonalSettings(settings) {
  localStorage.setItem(`ca_personal_ingredients:${getUserKey()}`, JSON.stringify(settings));
}

function getPersonalIngredient(item) {
  if (!isRegistered()) return item;
  return { ...item, ...(loadPersonalSettings()[item.id] || {}) };
}

function updatePersonalIngredient(id, patch) {
  const settings = loadPersonalSettings();
  settings[id] = { ...(settings[id] || {}), ...patch };
  savePersonalSettings(settings);
}

function valueStars(value) {
  return `<span class="score">${"●".repeat(value)}${"○".repeat(5 - value)}</span>`;
}

function actionIcon(type) {
  const icons = {
    hide: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 10.6A2 2 0 0 0 13.4 13.4"/><path d="M9.9 4.2A9.9 9.9 0 0 1 12 4c5 0 8.6 4 10 8a14 14 0 0 1-2.1 3.8"/><path d="M6.6 6.6A13.6 13.6 0 0 0 2 12c1.4 4 5 8 10 8a9.9 9.9 0 0 0 5.4-1.6"/></svg>`,
    show: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
    delete: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 15h10l1-15"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`,
  };
  return icons[type] || "";
}

function renderAuth() {
  const registration = JSON.parse(localStorage.getItem("ca_registration") || "null");
  const registered = isRegistered();
  loginButton.textContent = registered ? "Выйти" : "Вход";
  authCard.innerHTML = registered
    ? `<span>Режим</span><strong>Зарегистрирована</strong><p>${registration?.email || DEMO_EMAIL}. Редактирование продуктов открыто.</p>`
    : `<span>Режим</span><strong>Гость</strong><p>Можно смотреть ингредиенты. Добавление, стоимость и наличие доступны после регистрации.</p>`;
  ingredientForm.hidden = !registered;
  registrationHint.hidden = registered;
  showHiddenControl.hidden = !registered;
  if (!registered) showHiddenInput.checked = false;
  ingredientForm.closest(".editor-layout")?.classList.toggle("guest", !registered);
  ingredientForm.classList.toggle("locked", !registered);
  [...ingredientForm.elements].forEach((field) => {
    if (field.tagName !== "BUTTON") field.disabled = !registered;
  });
}

function renderFilters() {
  const categories = [...new Set(ingredients.map((item) => item.category))];
  categoryFilter.innerHTML = `<option value="all">Все</option>${categories.map((category) => `<option value="${category}">${category}</option>`).join("")}`;
}

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const registered = isRegistered();
  const showHidden = registered && showHiddenInput.checked;
  const visible = ingredients.filter((item) => {
    const personal = getPersonalIngredient(item);
    const matchesQuery = [item.name, item.category, item.aroma].join(" ").toLowerCase().includes(query);
    const matchesCategory = category === "all" || item.category === category;
    const matchesVisibility = showHidden || !personal.hidden;
    return matchesQuery && matchesCategory && matchesVisibility;
  });
  const pageCount = Math.max(1, Math.ceil(visible.length / ITEMS_PER_PAGE));
  currentPage = Math.min(currentPage, pageCount);
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = visible.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  table.innerHTML = pageItems
    .map(
      (item) => {
        const personal = getPersonalIngredient(item);
        const isCommon = defaultIngredientIds.has(item.id);
        return `
        <article class="ingredient-row ${registered ? "" : "public"} ${personal.hidden ? "hidden-ingredient" : ""}">
          <div>
            <strong>${item.name}</strong>
            <span>${item.category}</span>
          </div>
          <div class="ingredient-values">
            <span>Ккал ${personal.calories}</span>
            <span>Слив. ${valueStars(personal.creaminess)}</span>
            <span>Слад. ${valueStars(personal.sweetness)}</span>
            <span>Горечь ${valueStars(personal.bitterness)}</span>
          </div>
          <div class="aroma-cell">${personal.aroma}</div>
          ${
            registered
              ? `<div class="personal-settings">
                  <label>Ккал <input data-action="personal-calories" data-id="${item.id}" type="number" min="1" max="5" step="1" value="${personal.calories}" /></label>
                  <label>Цена <input data-action="personal-cost" data-id="${item.id}" type="number" min="0" step="1" value="${personal.cost}" /></label>
                </div>
                <label class="availability-toggle">
                  <input data-action="personal-available" data-id="${item.id}" type="checkbox" ${personal.available ? "checked" : ""} />
                  В наличии
                </label>
                ${
                  isCommon
                    ? `<div class="row-actions">
                        <button class="icon-action" data-action="${personal.hidden ? "show" : "hide"}" data-id="${item.id}" title="${personal.hidden ? "Показать" : "Скрыть"}" aria-label="${personal.hidden ? "Показать" : "Скрыть"}">${actionIcon(personal.hidden ? "show" : "hide")}</button>
                      </div>`
                    : `<div class="row-actions">
                        <button class="icon-action" data-action="edit" data-id="${item.id}" title="Редактировать" aria-label="Редактировать">${actionIcon("edit")}</button>
                        <button class="icon-action" data-action="delete" data-id="${item.id}" title="Удалить" aria-label="Удалить">${actionIcon("delete")}</button>
                      </div>`
                }`
              : ""
          }
        </article>
      `;
      },
    )
    .join("");
  renderPagination(visible.length, pageCount);
}

function renderPagination(total, pageCount) {
  if (total <= ITEMS_PER_PAGE) {
    pagination.innerHTML = "";
    return;
  }

  const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, total);
  const buttons = Array.from({ length: pageCount }, (_, index) => {
    const page = index + 1;
    return `<button type="button" data-page="${page}" class="${page === currentPage ? "active" : ""}" aria-label="Страница ${page}">${page}</button>`;
  }).join("");

  pagination.innerHTML = `
    <span>${start}-${end} из ${total}</span>
    <div class="pagination-buttons">
      <button type="button" data-page="${Math.max(1, currentPage - 1)}" ${currentPage === 1 ? "disabled" : ""}>Назад</button>
      ${buttons}
      <button type="button" data-page="${Math.min(pageCount, currentPage + 1)}" ${currentPage === pageCount ? "disabled" : ""}>Вперед</button>
    </div>
  `;
}

function fillForm(item) {
  ingredientForm.name.value = item.name;
  ingredientForm.category.value = item.category;
  ingredientForm.calories.value = item.calories;
  ingredientForm.creaminess.value = item.creaminess;
  ingredientForm.sweetness.value = item.sweetness;
  ingredientForm.bitterness.value = item.bitterness;
  ingredientForm.aroma.value = item.aroma;
  ingredientForm.cost.value = item.cost;
  ingredientForm.available.checked = item.available;
  ingredientForm.querySelector("button[type='submit']").textContent = "Сохранить";
}

function resetForm() {
  editingId = null;
  ingredientForm.reset();
  ingredientForm.querySelector("button[type='submit']").textContent = "Добавить";
}

function upsertIngredient(formData) {
  const item = {
    id: editingId || `custom-${Date.now()}`,
    name: formData.get("name").trim(),
    category: formData.get("category"),
    calories: Number(formData.get("calories")),
    creaminess: Number(formData.get("creaminess")),
    sweetness: Number(formData.get("sweetness")),
    bitterness: Number(formData.get("bitterness")),
    aroma: formData.get("aroma").trim(),
    cost: Number(formData.get("cost")),
    available: formData.get("available") === "on",
  };
  ingredients = editingId ? ingredients.map((current) => (current.id === editingId ? item : current)) : [item, ...ingredients];
  saveIngredients();
  renderFilters();
  renderTable();
  resetForm();
}

function signIn(formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const demo = email === DEMO_EMAIL && password === DEMO_PASSWORD;
  localStorage.setItem("ca_registered", "true");
  localStorage.setItem("ca_registration", JSON.stringify({ email, name: demo ? "Demo Creator" : "Coffee Creator", demo, createdAt: new Date().toISOString() }));
  renderAuth();
  renderTable();
}

loginButton.addEventListener("click", () => {
  if (isRegistered()) {
    localStorage.removeItem("ca_registered");
    renderAuth();
    renderTable();
    return;
  }
  authDialog.showModal();
});

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  signIn(new FormData(authForm));
  authDialog.close();
});

document.querySelectorAll(".close-button").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest("dialog")?.close();
  });
});

ingredientForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isRegistered()) {
    authDialog.showModal();
    return;
  }
  upsertIngredient(new FormData(ingredientForm));
});

table.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const id = target.dataset.id;
  const action = target.dataset.action;
  if (!action || !isRegistered()) return;

  if (action === "edit") {
    editingId = id;
    fillForm(ingredients.find((item) => item.id === id));
  }

  if (action === "delete") {
    ingredients = ingredients.filter((item) => item.id !== id);
    saveIngredients();
    renderFilters();
    renderTable();
  }

  if (action === "hide") {
    updatePersonalIngredient(id, { hidden: true, available: false });
    renderTable();
  }

  if (action === "show") {
    updatePersonalIngredient(id, { hidden: false });
    renderTable();
  }
});

table.addEventListener("change", (event) => {
  if (!isRegistered()) return;
  const { action, id } = event.target.dataset;
  if (action === "personal-available") {
    updatePersonalIngredient(id, { available: event.target.checked });
  }
  if (action === "personal-calories") {
    updatePersonalIngredient(id, { calories: Number(event.target.value) });
  }
  if (action === "personal-cost") {
    updatePersonalIngredient(id, { cost: Number(event.target.value) });
  }
  renderTable();
});

pagination.addEventListener("click", (event) => {
  const page = Number(event.target.dataset.page);
  if (!page) return;
  currentPage = page;
  renderTable();
});

searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderTable();
});
categoryFilter.addEventListener("change", () => {
  currentPage = 1;
  renderTable();
});
showHiddenInput.addEventListener("change", () => {
  currentPage = 1;
  renderTable();
});

renderFilters();
renderAuth();
renderTable();
