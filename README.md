# Plantry 🌱

**Cook what you already have.**

Plantry is an AI-powered pantry and meal planning app. It flips the standard meal-planning model: instead of starting with a recipe and creating a grocery list, Plantry looks at what you already own, tracks its expiration dates, and uses AI to generate recipes that prioritize ingredients expiring soon.

---

## 🚀 Features (MVP)
1. **Ingredient Capture**
   - Add ingredients manually to your pantry.
   - *Simulated integration for photo & receipt scanning.*
2. **Smart Expiration Tracking**
   - Your pantry list highlights ingredients based on their expiration dates.
   - Distinct, color-coded visual cues (Expired, Expires Today, Expires in X days).
3. **AI Recipe Generation**
   - Click "Cook what you have" to simulate an AI call that incorporates your currently available ingredients, specifically focusing on those that are expiring soon.

## 🛠 Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Google Provider)
- **Deployment**: [Vercel](https://vercel.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🏃‍♀️ Getting Started Locally

### 1. Configure Environment Variables
Create a `.env.local` file at the root of the project:
```env
NEXTAUTH_SECRET="your_generated_secret_here" # Generate via `openssl rand -base64 32`
NEXTAUTH_URL="http://localhost:3000"

# Note: You need to set these up via Google Cloud Console (OAuth Client ID)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Project Structure
- `src/app`: Next.js App Router pages (Home, Dashboard Layouts)
- `src/components`: Reusable pre-styled UI components (PantryList, RecipeGenerator, etc.)
- `src/context`: React Context Providers (Pantry State)
- `src/lib`: Data types, mock data, and global utility functions.

## 💡 Why Plantry?
Many people forget what ingredients they have, throw away expired food, and struggle deciding what to cook. Plantry tracks your ingredients and acts as your personal sous-chef to help you save money and reduce food waste!
