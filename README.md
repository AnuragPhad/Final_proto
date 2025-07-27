# Kisan AI - Your Digital Farming Assistant (using firebase studio and published on google cloud)

Kisan AI is a modern, AI-powered web application designed to be a digital assistant for India's farmers. It provides real-time data, AI-driven insights, and community features to help farmers make informed decisions, improve crop health, and get better market returns.


### 🌐 Live Now

Access the platform here:  
[https://studio--kisan-ai2-deploy.us-central1.hosted.app](https://studio--kisan-ai2-deploy.us-central1.hosted.app)


## ✨ Features

*   **Mandi Rates**: Check real-time commodity prices from various agricultural markets (mandis). Includes voice search (NLU), AI summaries, and price trend analysis.
*   **Crop Doctor**: Upload a photo of a crop to get an AI-powered diagnosis of diseases, along with recommended organic and inorganic solutions.
*   **My Farm**: A personal dashboard to track and manage crop cycles from sowing to estimated harvest, with progress tracking and timely advisories.
*   **Community Hub**: A social feed for farmers to connect, share knowledge, ask questions, and post updates with text and images.
*   **Market Intelligence**: Analyze historical price trends for different commodities and compare prices across various markets to strategize selling.
*   **Government Schemes**: A filterable database of central and state government schemes relevant to farmers.
*   **Expert Connect**: Find local agricultural experts on an embedded map and view a list of featured remote specialists.
*   **Multi-Language Support**: Fully internationalized UI supporting English, Hindi, Marathi, Kannada, and Tamil.
*   **Firebase Authentication**: Secure user login and session management with Google Sign-In.

## 🛠️ Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
*   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **AI Orchestration**: [Google Genkit](https://firebase.google.com/docs/genkit)
*   **AI Model**: [Google Gemini](https://ai.google.dev/)
*   **Backend Services**:
    *   **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
    *   **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore)
*   **APIs**:
    *   Google Maps API (for Experts page)
    *   OpenCage Geocoding API (for location detection)
    *   Data.gov.in (for Mandi Rates)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### 1. Prerequisites

*   [Node.js](https://nodejs.org/en/) (v18 or later)
*   An `npm` or `yarn` package manager
*   A [Firebase](https://firebase.google.com/) project
*   API keys for Google AI and OpenCage Geocoding

### 2. Firebase Setup

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.

2.  **Get Firebase Config**:
    *   In your project dashboard, go to **Project Settings** > **General**.
    *   Under "Your apps", click the web icon (`</>`) to register a new web app.
    *   Copy the `firebaseConfig` object. You will need this for your environment variables.

3.  **Enable Authentication**:
    *   Go to **Build** > **Authentication**.
    *   Click **Get started**.
    *   Select **Google** from the list of sign-in providers and enable it. Provide a project support email when prompted.

4.  **Authorize Your Domain**:
    *   In the Authentication section, go to the **Settings** tab.
    *   Click on **Authorized domains**.
    *   Click **Add domain** and add `localhost`. If you are using a cloud development environment (like Google Cloud Workstations), add its domain as well (e.g., `cloudworkstations.dev`).

5.  **Set up Firestore Database**:
    *   Go to **Build** > **Firestore Database**.
    *   Click **Create database**.
    *   Start in **Test mode** for easy setup (you can change security rules later).
    *   Choose a location for your database.

### 3. API Key Setup

1.  **Google AI API Key**:
    *   Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Click **Create API key in new project**. Copy the generated key.

2.  **OpenCage Geocoding API Key**:
    *   Go to [OpenCage Geodata](https://opencagedata.com/).
    *   Sign up for a free account and get your API key from the dashboard.

### 4. Local Development Setup

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Create Environment File**:
    *   Create a file named `.env.local` in the root of the project.
    *   Add your Firebase configuration and API keys to this file. Use the `NEXT_PUBLIC_` prefix for variables that need to be exposed to the browser.

    ```env
    # Firebase Configuration (replace with your actual config)
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="kisan-ai2"
    NEXT_PUBLIC_FIREBASE_APP_ID="1:32985753477:web:46df0b1f69ab6b3886c6ec"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="kisan-ai2.firebasestorage.app"
    NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyBbomBtjT7nqQO_lh2AfkF1BuExkf67CPA"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="kisan-ai2.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="32985753477"

    # Google AI API Key
    GEMINI_API_KEY="YOUR_GOOGLE_AI_API_KEY"

    # OpenCage Geocoding API Key
    OPENCAGE_API_KEY="YOUR_OPENCAGE_API_KEY"

    # Data.gov.in API Key (Optional but recommended)
    # Get from https://data.gov.in/
    NEXT_PUBLIC_DATA_GOV_API_KEY="YOUR_DATA_GOV_IN_API_KEY"
    ```

4.  **Seed the Database with Sample Data**:
    *   The project includes sample data for government schemes. Run the following command to populate your Firestore `schemes` collection.
    *   The script will check if the collection is empty before seeding.
    ```bash
    npm run db:seed
    ```
    *   **For community posts**, you can manually import `src/data/community-posts.json` into a collection named `posts` via the Firestore console.

5.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

The application should now be running at `http://localhost:9002`.

---

## 📜 Available Scripts

*   `npm run dev`: Starts the Next.js development server.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts a production server.
*   `npm run lint`: Runs the linter.
*   `npm run db:seed`: Populates the `schemes` collection in Firestore with sample data.
