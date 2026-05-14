const Database = require("better-sqlite3");
const { mkdirSync } = require("node:fs");
const { dirname, resolve } = require("node:path");

const databasePath = resolve(process.env.DATABASE_PATH ?? "../data/coffee.sqlite");
mkdirSync(dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const ingredients = [
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

const insert = db.prepare(`
  insert into ingredients
    (id, name, category, calories, creaminess, sweetness, bitterness, aroma, cost, available)
  values
    (@id, @name, @category, @calories, @creaminess, @sweetness, @bitterness, @aroma, @cost, @available)
  on conflict(id) do update set
    name = excluded.name,
    category = excluded.category,
    calories = excluded.calories,
    creaminess = excluded.creaminess,
    sweetness = excluded.sweetness,
    bitterness = excluded.bitterness,
    aroma = excluded.aroma,
    cost = excluded.cost,
    available = excluded.available,
    updated_at = current_timestamp
`);

const seed = db.transaction((items) => {
  for (const item of items) {
    insert.run({ ...item, available: item.available ? 1 : 0 });
  }
});

seed(ingredients);

const count = db.prepare("select count(*) as count from ingredients").get().count;
console.log(`Seeded ${ingredients.length} mock ingredients into ${databasePath}. Total ingredients: ${count}`);
