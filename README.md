# Simple Supermarket App

This project is a responsive multilingual supermarket management website built with React, Tailwind CSS, and Firebase.

## Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn package manager
- Firebase project with Firestore and Authentication enabled

## Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd supermarket-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env file with your Firebase configuration
   # You can find these values in your Firebase project settings
   ```

   Required environment variables:

   - `VITE_FIREBASE_API_KEY` - Your Firebase API key
   - `VITE_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
   - `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID
   - `VITE_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
   - `VITE_FIREBASE_APP_ID` - Your Firebase app ID
   - `VITE_FIREBASE_MEASUREMENT_ID` - Your Firebase measurement ID (optional)

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173` to view the application.

## Build for Production

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Security Note

⚠️ **Important**: Never commit your `.env` file to version control. The `.env.example` file is provided as a template for the required environment variables.
