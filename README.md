<h1 align="center">
  <br>
  <img src="https://img.icons8.com/color/144/whatsapp--v1.png" alt="SmartAlert Logo" width="120">
  <br>
  SmartAlert - Intelligent WhatsApp Automations
  <br>
</h1>

<h4 align="center">A professional platform for automating enterprise notifications, billings, and follow-ups through the Official Meta WhatsApp Cloud API.</h4>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#technology-stack">Technology Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#deployment">Deployment</a>
</p>

## Overview

SmartAlert is a Full-Stack SaaS application designed to help businesses manage and automate their customer communication via WhatsApp. By integrating natively with the **Meta WhatsApp Cloud API**, it ensures 100% reliability, no risk of banishment, and enterprise-grade security.

The platform provides an executive dashboard to track message deliveries, customer health scores, and an AI-powered assistant that generates hyper-personalized notifications based on the client's context and required tone.

## Key Features

- **📱 Official Meta Integration**: Connects via OAuth using the Meta Business suite. Zero reliance on unofficial web scrapers.
- **🤖 AI Content Generation**: Integrates with GPT-4 / Claude to write the perfect sales follow-up or payment reminder with variable tones (Formal, Friendly, Persuasive).
- **⏱️ Smart Scheduling Engine**: Cron-job-powered mechanism to schedule future alerts, recurring alerts, and auto-retries in case of temporary failures.
- **📊 Executive Dashboard**: Track portfolio health, response rates, delivery statistics, and a timeline history of every interaction.
- **🔒 Bank-Grade Security**: All sensible credentials and tokens are secured using AES-256-CBC encryption in the database.

## Technology Stack

### Frontend
- **React 18** + **Vite**: Rapid, module-based frontend rendering.
- **TypeScript**: Ensuring type safety and scalable architecture.
- **Tailwind CSS**: Utility-first framework for a highly customized and responsive UI.
- **Framer Motion**: For fluid UI animations and micro-interactions.

### Backend
- **Node.js** + **Express**: Robust RESTful API architecture.
- **Prisma ORM**: Type-safe database management and schema migrations.
- **PostgreSQL**: Reliable relational database.
- **node-cron**: Efficient background job scheduling.
- **AES-256 Encryption**: Custom crypto modules to secure WhatsApp API Keys.

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [PostgreSQL](https://www.postgresql.org/) database instance
- A Meta Developer Account (for WhatsApp Cloud API credentials)

### 1. Clone the repository

```bash
git clone https://github.com/marciofelixads/smartalert.git
cd smartalert
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy the `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update the `.env` with your PostgreSQL connection string, encryption keys, and Meta credentials.

Run migrations to set up the database schema:
```bash
npx prisma migrate dev
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup

In a new terminal:
```bash
cd frontend
npm install
```

Copy the `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `VITE_API_URL` points to your backend.

Start the frontend development server:
```bash
npm run dev
```

Your app will now be available on `http://localhost:5173`.

---

## Architecture Overview

The codebase is strictly separated into `frontend` and `backend` directories to enforce a clean separation of concerns and favor microservices readiness in the future.

```text
├── backend/
│   ├── src/
│   │   ├── controllers/   # Route handlers and business logic
│   │   ├── middlewares/   # Auth, validators, and error handling
│   │   ├── routes/        # Express route definitions
│   │   ├── services/      # External integrations (Meta, AI, Encryption)
│   │   ├── jobs/          # Cron jobs and recurring tasks
│   │   └── utils/         # Helper functions
│   ├── prisma/            # Database schemas and migrations
│   └── server.js          # App entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable React UI components
│   │   ├── context/       # React Context (Auth, Language, Theme)
│   │   ├── pages/         # High-level views (Dashboard, Settings, Auth)
│   │   ├── i18n/          # Internationalization dictionaries
│   │   └── styles/        # Global CSS / Tailwind directives
```

---

## API Reference

The backend exposes a highly documented REST API. All endpoints are prefixed with `/api`. Authentication is handled via Bearer JWT.

### Auth
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Authenticate a user and receive a JWT.

### Alerts
- `GET /api/alerts` - Retrieve all alerts for the authenticated user.
- `POST /api/alerts` - Schedule a new alert.
- `PUT /api/alerts/:id` - Update an existing alert.
- `DELETE /api/alerts/:id` - Delete an alert.
- `GET /api/alerts/stats` - Retrieve executive dashboard statistics.

### WhatsApp Meta API
- `GET /api/whatsapp/auth/login` - Initiate Meta OAuth flow.
- `POST /api/whatsapp/config` - Save/Update manual WhatsApp Business configurations.
- `POST /api/webhook/whatsapp` - Receives incoming messages and status updates from Meta Server.

---


---

## Best Practices Adopted

- **Clean Code**: Adherence to SOLID principles and modular design.
- **Fail-Safe Processing**: All WhatsApp sending events are queued and wrap the third-party HTTP calls in `try/catch` with retry mechanics.
- **Security-First**: Not a single access token or API secret is kept raw. An AES encryption module handles storing/fetching.
- **Localization**: Full structural readiness for multi-language (en, pt, es).

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

<p align="center">Made with ❤️ for automation and excellence.</p>
