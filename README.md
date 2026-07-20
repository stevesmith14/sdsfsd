# Recallify - AI Memory Engine

A powerful, frictionless personal knowledge base that automatically extracts insights from your saved links and notes using AI. It uses spaced repetition and semantic search to help you build a lasting learning habit.

## ✨ Key Features
- **Instant Knowledge Capture** — Save any link, article, or quick note in seconds.
- **AI-Powered Insights** — Automatically generates summaries, extracts key tags, and categorizes content using AI (Gemini / Groq).
- **Semantic Search** — Find related content and exact matches instantly using advanced vector embeddings.
- **Spaced Repetition** — Automated email digests sent to your inbox when items are due for review, helping you retain knowledge forever.
- **Beautiful & Dynamic UI** — A premium, smooth user experience built with Framer Motion and Tailwind CSS.
- **Production Ready** — Fully dockerized with a highly optimized multi-stage build.

## 🚀 Live Demo
*(Add your live Vercel or deployment link here)* →

## 🛠️ Tech Stack
- **Frontend/Framework:** Next.js 14 (App Router) & React
- **Backend/API:** Next.js Route Handlers
- **Database:** MongoDB (Mongoose)
- **AI & Embeddings:** Google Gemini API & Groq
- **Email Delivery:** Nodemailer (Gmail integration)
- **Styling & Animations:** Tailwind CSS & Framer Motion
- **Deployment:** Docker (Standalone Optimized)

## 🎯 Why Recallify?
Most bookmarking apps become "read-it-later" graveyards. Recallify is designed not just to store information, but to actively help you learn it. By automatically summarizing articles and emailing you flashcards based on spaced repetition schedules, it turns passive saving into active learning without any extra effort on your part.

## 🛠️ How It Works
1. **Capture:** Paste a link or write a note on the Capture page.
2. **AI Processing:** The background AI worker scrapes the content, generates a summary, assigns tags, and computes semantic embeddings.
3. **Review:** The system schedules the item for review. 
4. **Remind:** A background cron job checks for due items and sends a digest email directly to your inbox using Nodemailer.

## 📌 Future Enhancements (Planned)
- Custom AI prompts and extraction rules
- Advanced analytics and learning streaks
- Browser extension for 1-click capturing
- Multi-user collaboration and shared folders

## 🧑‍💻 Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/recallify.git
cd recallify

# 2. Install dependencies
npm install

# 3. Setup Environment Variables
# Create a .env.local file in the root directory and add:
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
CRON_SECRET=supersecret123
APP_BASE_URL=http://localhost:3000

# 4. Start the Development Server
npm run dev
```

## 🐳 Docker Deployment
This project includes a highly optimized, multi-stage Dockerfile for production.

```bash
# Build the Docker image
docker build -t recallify-app .

# Run the container locally
docker run -p 3000:3000 --env-file .env.local recallify-app
```

## 📄 License
This project is open for learning and inspiration.

Made with ❤️ by you
