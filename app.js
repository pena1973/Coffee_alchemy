const catalog = [
  { title: "Кофе", items: ["Эфиопия натуральная", "Колумбия washed", "Бразилия ореховая", "Кения ягодная", "Декаф", "Холодный концентрат"] },
  { title: "Молочная часть", items: ["Сливки 10%", "Молоко 3.2%", "Овсяное молоко", "Кокосовое молоко", "Миндальное молоко", "Взбитые сливки"] },
  { title: "Сиропы", items: ["Ваниль", "Карамель", "Лесной орех", "Шоколад", "Кленовый", "Соленая карамель"] },
  { title: "Сладость и баланс", items: ["Тростниковый сахар", "Мед", "Финиковый сироп", "Белый шоколад", "Щепотка соли", "Какао"] },
  { title: "Специи", items: ["Корица", "Кардамон", "Мускатный орех", "Ванильный порошок", "Имбирь", "Черный перец"] },
  { title: "Финиш", items: ["Апельсиновая цедра", "Кокосовая стружка", "Лаванда", "Мята", "Какао-крошка", "Лед"] },
];

const names = {
  hot: ["Бархатный рассвет", "Пряная мастерская", "Сливочный компас", "Теплый набросок"],
  cold: ["Ледяной эскиз", "Холодная карамель", "Северная ваниль", "Фраппе-ателье"],
};

const DEMO_EMAIL = "demo@coffee.local";
const DEMO_PASSWORD = "coffee123";

const state = {
  deviceId: "",
  ip: "определяется",
  hasGenerated: localStorage.getItem("ca_free_used") === "true",
  registered: localStorage.getItem("ca_registered") === "true",
  lastRecipe: null,
};

const form = document.querySelector("#recipeForm");
const emptyState = document.querySelector("#emptyState");
const recipeResult = document.querySelector("#recipeResult");
const registrationDialog = document.querySelector("#registrationDialog");
const registrationForm = document.querySelector("#registrationForm");
const deviceNote = document.querySelector("#deviceNote");
const saveToMenuButton = document.querySelector("#saveToMenu");
const variantBlock = document.querySelector("#variantBlock");
const recipeNameInput = document.querySelector("#recipeName");

function pick(list, seed = Math.random()) {
  return list[Math.floor(seed * list.length) % list.length];
}

function getUserKey() {
  const registration = JSON.parse(localStorage.getItem("ca_registration") || "null");
  return String(registration?.email || DEMO_EMAIL).trim().toLowerCase();
}

function loadPersonalSettings() {
  const stored = localStorage.getItem(`ca_personal_ingredients:${getUserKey()}`);
  return stored ? JSON.parse(stored) : {};
}

function fallbackIngredients() {
  return catalog.flatMap((group) =>
    group.items.map((name, index) => ({
      id: `${group.title}-${index}`,
      name,
      category: group.title,
      available: true,
    })),
  );
}

function loadInventory() {
  const stored = localStorage.getItem("ca_ingredients");
  const ingredients = stored ? JSON.parse(stored) : fallbackIngredients();

  if (!state.registered) {
    return ingredients.map((item) => ({ ...item, available: true }));
  }

  const personal = loadPersonalSettings();
  return ingredients.map((item) => ({ ...item, ...(personal[item.id] || {}) }));
}

function availableIngredientNames(category, fallbackItems = []) {
  const items = loadInventory()
    .filter((item) => item.category === category && item.available)
    .map((item) => item.name);

  if (items.length) return items;
  return state.registered ? [`нет доступных ингредиентов: ${category}`] : fallbackItems;
}

function numberValue(formData, key) {
  return Number(formData.get(key));
}

function getOrCreateDeviceId() {
  const existing = localStorage.getItem("ca_device_id");
  if (existing) return existing;
  const raw = `${navigator.userAgent}|${screen.width}x${screen.height}|${Intl.DateTimeFormat().resolvedOptions().timeZone}|${crypto.randomUUID()}`;
  const id = btoa(unescape(encodeURIComponent(raw))).slice(0, 18);
  localStorage.setItem("ca_device_id", id);
  return id;
}

async function resolveIp() {
  try {
    const response = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
    const data = await response.json();
    state.ip = data.ip || "недоступен";
  } catch {
    state.ip = "недоступен в офлайн-прототипе";
  }
  renderDeviceNote();
}

function renderDeviceNote() {
  deviceNote.textContent = `Устройство: ${state.deviceId}. IP: ${state.ip}.`;
}

function estimateCalories(size, sweetness, creaminess, calories) {
  const base = size * 0.16;
  const sweet = sweetness * 24;
  const dairy = creaminess * 38;
  const modifier = 0.72 + calories * 0.14;
  return Math.round((base + sweet + dairy) * modifier);
}

function clampTaste(value) {
  return Math.max(1, Math.min(5, value));
}

function barWords(barName) {
  const clean = String(barName || "").trim();
  const lower = clean.toLowerCase();
  if (!clean) return ["Авторский", "Алхимия", "Мастерская", "Фирменный"];
  if (lower.includes("север") || lower.includes("ice") || lower.includes("лед")) return ["Северный", "Полярный", "Иней", "Ледяной"];
  if (lower.includes("лаванд") || lower.includes("цвет")) return ["Лавандовый", "Цветочный", "Садовый", "Букет"];
  if (lower.includes("ноч") || lower.includes("moon") || lower.includes("луна")) return ["Ночной", "Лунный", "Темный", "Полуночный"];
  if (lower.includes("дом") || lower.includes("уют")) return ["Домашний", "Теплый", "Уютный", "Печенье"];
  if (lower.includes("жар") || lower.includes("sun") || lower.includes("солн")) return ["Солнечный", "Золотой", "Тропический", "Луч"];
  return clean
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .concat(["Фирменный", "Авторский"]);
}

function recipeTitle({ temperature, sweetness, bitterness, aroma, barName, seed, variantLabel }) {
  const words = barWords(barName);
  const base = pick(words, seed);
  const suffix = sweetness > 3 ? "крем" : bitterness > 3 ? "эспрессо" : temperature === "cold" ? "айс" : "латте";
  const aromaWord = String(aroma).split(" ")[0].replace(/[,.]/g, "");
  const variant = variantLabel ? `${variantLabel} ` : "";
  return `${variant}${base} ${aromaWord} ${suffix}`.trim();
}

function adjustedData(formData, variant = null) {
  const data = {
    temperature: formData.get("temperature"),
    size: numberValue(formData, "size"),
    sweetness: numberValue(formData, "sweetness"),
    creaminess: numberValue(formData, "creaminess"),
    bitterness: numberValue(formData, "bitterness"),
    calories: numberValue(formData, "calories"),
    aroma: formData.get("aroma"),
    barName: formData.get("barName"),
  };

  if (variant === "milder") {
    data.sweetness = clampTaste(data.sweetness + 1);
    data.creaminess = clampTaste(data.creaminess + 1);
  }
  if (variant === "brighter") {
    data.bitterness = clampTaste(data.bitterness + 1);
    data.sweetness = clampTaste(data.sweetness - 1);
  }
  if (variant === "lighter") {
    data.creaminess = clampTaste(data.creaminess - 1);
    data.calories = clampTaste(data.calories - 1);
  }
  return data;
}

function buildRecipe(formData, variant = null) {
  const data = adjustedData(formData, variant);
  const { size, sweetness, creaminess, bitterness, calories, aroma, barName } = data;
  const actualTemperature = data.temperature;
  const variantNames = {
    milder: "Мягче",
    brighter: "Ярче",
    lighter: "Легче",
  };
  const barSeed = String(barName || "")
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const seed = ((sweetness * 7 + creaminess * 11 + bitterness * 13 + calories * 17 + size + barSeed) % 97) / 97;

  const coffeePool = availableIngredientNames("Кофе", catalog[0].items);
  const dairyPool = availableIngredientNames("Молочная часть", catalog[1].items);
  const syrupPool = availableIngredientNames("Сиропы", catalog[2].items);
  const balancePool = availableIngredientNames("Сладость и баланс", catalog[3].items);
  const spicePool = availableIngredientNames("Специи", catalog[4].items);
  const finishPool = availableIngredientNames("Финиш", catalog[5].items);

  const coffee = bitterness > 3 ? pick(coffeePool.slice(0, 4), seed) : pick(coffeePool, seed);
  const dairy = pick(dairyPool, seed + (creaminess > 3 ? 0.2 : 0.3));
  const syrup = sweetness > 3 ? pick(syrupPool, seed + 0.4) : pick([...syrupPool, ...balancePool], seed + 0.5);
  const preferredSpice = aroma.includes("кардамон") ? "Кардамон" : aroma.includes("корицей") ? "Корица" : pick(spicePool, seed + 0.6);
  const spice = spicePool.includes(preferredSpice) ? preferredSpice : pick(spicePool, seed + 0.6);
  const finish = pick(finishPool, seed + (actualTemperature === "cold" ? 0.7 : 0.8));
  const balance = pick(balancePool, seed + 0.9);

  const title = recipeTitle({ temperature: actualTemperature, sweetness, bitterness, aroma, barName, seed, variantLabel: variantNames[variant] });
  const coffeeMl = actualTemperature === "cold" ? Math.round(size * 0.34) : Math.round(size * 0.28);
  const milkMl = Math.max(40, Math.round((size * (creaminess + 2)) / 10));
  const syrupMl = sweetness * 6;

  return {
    title,
    variant,
    badge: actualTemperature === "cold" ? "cold brew mood" : "hot craft",
    metrics: [
      ["Объем", `${size} мл`],
      ["Калории", `≈ ${estimateCalories(size, sweetness, creaminess, calories)} ккал`],
      ["Аромат", aroma],
      ["Сливочность", `${creaminess}/5`],
      ["Сладость", `${sweetness}/5`],
      ["Горечь", `${bitterness}/5`],
    ],
    ingredients: [
      `${coffeeMl} мл ${coffee}`,
      `${milkMl} мл ${dairy}`,
      `${syrupMl} мл: ${syrup}`,
      `${spice} по вкусу`,
      finish,
      `${balance} для баланса`,
    ],
    steps:
      actualTemperature === "cold"
        ? [
            "Охлади стакан и наполни его льдом на треть.",
            `Смешай ${coffee} с ${syrup}.`,
            `Добавь ${dairy}, затем аккуратно подними текстуру холодной пеной.`,
            `Заверши ароматом: ${aroma}.`,
          ]
        : [
            `Приготовь концентрированный кофе на основе ${coffee}.`,
            `Прогрей ${dairy} и взбей до шелковой текстуры.`,
            `Смешай сироп, кофе и ${spice}, затем влей молочную часть.`,
            `Укрась финишем и дай напитку пахнуть ${aroma}.`,
          ],
    variants: [
      { id: "milder", label: `Чуть мягче: сливочность ${clampTaste(creaminess + 1)}/5, сладость ${clampTaste(sweetness + 1)}/5.` },
      { id: "brighter", label: `Чуть ярче: горечь ${clampTaste(bitterness + 1)}/5, сладость ${clampTaste(sweetness - 1)}/5.` },
      { id: "lighter", label: `Чуть легче: сливочность ${clampTaste(creaminess - 1)}/5, калорийность ${clampTaste(calories - 1)}/5.` },
    ],
  };
}

function renderRecipe(recipe) {
  emptyState.classList.add("hidden");
  recipeResult.classList.remove("hidden");
  recipeNameInput.value = recipe.title;
  document.querySelector("#metrics").innerHTML = recipe.metrics.map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`).join("");
  document.querySelector("#recipeIngredients").innerHTML = recipe.ingredients.map((item) => `<li>${item}</li>`).join("");
  document.querySelector("#recipeSteps").innerHTML = recipe.steps.map((item) => `<li>${item}</li>`).join("");
  document.querySelector("#variants").innerHTML = `${recipe.variant ? `<button class="variant base-variant" type="button" data-variant="base">Вернуться к основному варианту</button>` : ""}${recipe.variants.map((item) => `<button class="variant" type="button" data-variant="${item.id}">${item.label}</button>`).join("")}`;
  variantBlock.classList.remove("hidden");
  state.lastRecipe = recipe;
  saveToMenuButton.textContent = "Сохранить рецепт";
}

function saveRecipeToMenu() {
  if (!state.lastRecipe) return;
  const menu = JSON.parse(localStorage.getItem("ca_menu") || "[]");
  const item = {
    ...state.lastRecipe,
    title: recipeNameInput.value.trim() || state.lastRecipe.title,
    id: `${Date.now()}`,
    prepared: false,
    rating: "",
    inMenu: false,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem("ca_menu", JSON.stringify([item, ...menu].slice(0, 24)));
  saveToMenuButton.textContent = "Сохранено";
}

document.querySelector("#variants").addEventListener("click", (event) => {
  const button = event.target.closest("[data-variant]");
  if (!button) return;
  renderRecipe(buildRecipe(new FormData(form), button.dataset.variant === "base" ? null : button.dataset.variant));
});

function showRegistration() {
  renderDeviceNote();
  registrationDialog.showModal();
}

function registerUser(data) {
  const email = String(data.get("email") || "").trim().toLowerCase();
  const password = String(data.get("password") || "");
  const isDemo = email === DEMO_EMAIL && password === DEMO_PASSWORD;
  localStorage.setItem(
    "ca_registration",
    JSON.stringify({
      name: isDemo ? "Demo Creator" : data.get("name") || "Coffee Creator",
      email,
      demo: isDemo,
      deviceId: state.deviceId,
      ip: state.ip,
      createdAt: new Date().toISOString(),
    }),
  );
  localStorage.setItem("ca_registered", "true");
  state.registered = true;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (state.hasGenerated && !state.registered) {
    showRegistration();
    return;
  }
  renderRecipe(buildRecipe(new FormData(form)));
  state.hasGenerated = true;
  localStorage.setItem("ca_free_used", "true");
  localStorage.setItem("ca_last_generation", JSON.stringify({ deviceId: state.deviceId, ip: state.ip, createdAt: new Date().toISOString() }));
});

registrationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  registerUser(new FormData(registrationForm));
  registrationDialog.close();
  renderRecipe(buildRecipe(new FormData(form)));
});

document.querySelectorAll(".close-button").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest("dialog")?.close();
  });
});

document.querySelector("#openRegistration").addEventListener("click", showRegistration);
saveToMenuButton.addEventListener("click", saveRecipeToMenu);

document.querySelector("#resetFree").addEventListener("click", () => {
  ["ca_free_used", "ca_registered", "ca_registration", "ca_last_generation", "ca_ingredients", "ca_menu"].forEach((key) => localStorage.removeItem(key));
  state.hasGenerated = false;
  state.registered = false;
  recipeResult.classList.add("hidden");
  variantBlock.classList.add("hidden");
  emptyState.classList.remove("hidden");
});

state.deviceId = getOrCreateDeviceId();
renderDeviceNote();
resolveIp();
