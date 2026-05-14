export type TasteScale = 0 | 1 | 2 | 3 | 4 | 5;

export type Ingredient = {
  id: string;
  name: string;
  category: string;
  calories: TasteScale;
  creaminess: TasteScale;
  sweetness: TasteScale;
  bitterness: TasteScale;
  salt: TasteScale;
  aroma: string;
  cost: number;
  available: boolean;
  hidden: boolean;
  isDefault: boolean;
  ownerUserId: string | null;
};

export type Recipe = {
  id: string;
  userId: string;
  title: string;
  badge: string;
  ingredients: string[];
  steps: string[];
  metrics: [string, string][];
  prepared: boolean;
  rating: number | null;
  inMenu: boolean;
  createdAt: string;
};

export type UserRole = "user" | "admin";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
};

export type RecipeRequest = {
  barName?: string;
  temperature: "hot" | "cold";
  sizeMl: number;
  calories: TasteScale;
  creaminess: TasteScale;
  sweetness: TasteScale;
  bitterness: TasteScale;
  salt: TasteScale;
  aroma: string;
};
