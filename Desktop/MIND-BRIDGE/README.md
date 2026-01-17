# MindBridge 🍃

**MindBridge** is a real-time mental wellness platform that combines personalized mood tracking and journaling with secure, community-driven "Circles" for meaningful social support.

## 🌟 Overview

MindBridge is a comprehensive sanctuary for emotional awareness and secure social connection. Built with a modern MERN stack and powered by real-time technologies, it provides a dedicated space for personal reflection and collective support.

## 🚀 Key Features

- **Secure Multi-Method Authentication**: Robust system supporting traditional email/password and seamless **Google OAuth** integration.
- **Customizable User Profiles**: Personalized identities with display names, bios, and an **interest-tagging system** to tailor the community experience.
- **Intelligent Dashboard**: A central hub that tracks consistency, providing mood-logging reminders and quick navigation to recent activities.
- **Advanced Circle Management**: Create and manage micro-communities with granular admin controls, supporting both **Public** and **Private** (request-to-join) flows.
- **Real-Time Social Interaction**: Live community feeds powered by **Socket.io** for instant posts and comments without page refreshes.
- **Emotional Analytics**: An advanced **Mood Log** that generates visual, percentage-based breakdowns of emotional trends over time.
- **Privacy-First Journaling**: Flexible journaling with per-entry visibility settings (Private, Circles, or Public).
- **Contextual Notifications**: A real-time notification engine for social alerts and administrative tasks, with deep-linking for fluid navigation.

## 🛠 Tech Stack

- **Frontend**: React, Redux Toolkit, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Auth**: JWT, Google OAuth (Google Auth Library)
- **Cloud**: Cloudinary (for profile image uploads)
- **Deployment**: Docker, Docker Compose, Nginx

## 🚦 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- MongoDB (if running locally without Docker)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/DEVYAM07/MIND-BRDGE.git
   cd mind-bridge
   ```

2. **Environment Setup**:
   - Create a `.env` file in the `backend` directory.
   - Create a `.env` file in the `frontend` directory.
   - (Refer to the respective `.env.example` files if available, or ensure keys for MongoDB, JWT, Cloudinary, and Google OAuth are set).

3. **Run with Docker**:
   ```bash
   docker-compose up --build
   ```
   The application will be available at `http://localhost:3000`.

## 📄 License

This project is licensed under the ISC License.
