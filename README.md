# FatherShops Frontend

## About the Project

This is the frontend implementation of the FatherShops technical assessment, developed using Next.js, React and TypeScript.

The application connects with a Laravel backend to fetch and display product categories, products and product details.

## Features

- Display product categories with images.
- Show products based on the selected category.
- Display product details when a product is selected.
- Show product images and available options.
- Display product descriptions.
- Search products by name.
- Handle loading states and API errors.
- Show available product information when complete details are unavailable.

## Technologies Used

- Next.js
- React.js
- TypeScript
- Tailwind CSS
- DOMPurify
- REST API

## Project Structure

```text
fathershops-frontend/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## Backend Connection

The frontend connects to the Laravel backend using the following environment variable:

```env
NEXT_PUBLIC_LARAVEL_API_URL=http://127.0.0.1:8000/api
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_FRONTEND_REPOSITORY_URL
```

### 2. Open the Project Folder

```bash
cd fathershops-frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root and add:

```env
NEXT_PUBLIC_LARAVEL_API_URL=http://127.0.0.1:8000/api
```

Replace the URL if your Laravel backend is hosted elsewhere.

### 5. Start the Development Server

```bash
npm run dev
```

Open the application at:

http://localhost:3000

## Important Note

The Laravel backend must be running before using the frontend.

The Sportswear category (ID: 59) may not display products correctly because its external API response contains invalid JSON. The backend handles this unavailable data.

## Author

Zaid Nagori
