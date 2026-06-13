# ☕ Coffee Alchemy

**Coffee Alchemy** is an AI-powered coffee recipe generator and a creative workspace for experimenting with coffee drinks.

Users can select available ingredients, generate original coffee recipes, save successful combinations, and build their own collection of drinks.

## Features

* AI-generated coffee recipes
* Selection of available ingredients
* Detailed preparation instructions
* Recipe saving and editing
* Personal recipe ratings
* Prepared drink tracking
* Adding selected recipes to the menu
* Recipe history
* Responsive interface

## How It Works

The user selects available ingredients and sends them to the AI generator.

Coffee Alchemy creates a structured recipe containing:

* drink name
* ingredient proportions
* preparation steps
* expected flavor profile
* serving recommendations

Generated recipes can be saved, edited, rated, and prepared again later.

## Tech Stack

* Next.js
* React
* TypeScript
* SQLite
* better-sqlite3
* DigitalOcean AI Inference
* Zod
* Docker

## Local Development

Clone the repository:

```bash
git clone https://github.com/pena1973/Coffee_alchemy.git
cd Coffee_alchemy
```

Install dependencies:

```bash
npm install
```

Create an `.env.local` file:

```env
DATABASE_PATH=../data/coffee.sqlite

MODEL_ACCESS_KEY=your_access_key
DO_INFERENCE_BASE_URL=https://inference.do-ai.run/v1
DO_RECIPE_MODEL=llama3.3-70b-instruct
```

Run database migrations:

```bash
npm run db:migrate
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Purpose

Coffee Alchemy demonstrates how artificial intelligence can support creativity rather than replace it.

The project turns available ingredients into new coffee experiences and helps users build their own digital collection of recipes.

## Author

Developed by [Rino Labs](https://github.com/pena1973).
е
