# AI Recipe Generator

A comprehensive full-stack web application designed to help users generate, save, and discover recipes using AI. It has a special focus on Desi and Pakistani cuisine, while being fully capable of generating dishes from any cuisine upon request. 

## Features

- **AI-Powered Recipe Generation:** Provide ingredients, select preferences (cuisine, taste, time, difficulty), and let AI create a structured recipe for you.
- **Cook Mode (Voice Controlled):** A hands-free cooking mode that reads instructions aloud and listens for commands to move to the next step, pause, or repeat.
- **Family Recipes:** Digitize unstructured family recipes, adapt them, and modernize them while retaining their essence.
- **Pantry Management:** Keep track of the ingredients you have and generate recipes strictly based on your pantry inventory.
- **Personalized Dashboard:** View recently generated recipes, saved favorites, and nutritional summaries.

## Technology Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Material Symbols
- React Router DOM

### Backend
- Node.js & Express.js
- MongoDB & Mongoose (Database)
- Google Gemini API & Groq API (AI generation)
- JSON Web Tokens (JWT) for Authentication

## Setup & Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or a MongoDB URI)
- Google Gemini API Key
- Groq API Key

### 1. Clone the Repository
```bash
git clone <repository_url>
cd Recipie_Generator
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```
Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window.
```bash
cd frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
```

## How It Works
- **AI Generation:** The backend uses specialized prompt engineering via Gemini/Groq APIs to favor Desi/Pakistani cuisine while adhering strictly to structural JSON constraints for rendering.
- **Voice Navigation:** The frontend utilizes the native Web Speech API (`SpeechRecognition`) for continuous listening in Cook Mode.
- **Authentication:** Users can register and log in to save their favorite generated recipes across sessions.

## Project Structure
- `frontend/src/pages/`: Main application views (Dashboard, Generator, Settings, etc.)
- `frontend/src/components/`: Reusable UI elements and layout components.
- `backend/controllers/`: Logic for handling API requests.
- `backend/models/`: MongoDB schema definitions.
- `backend/services/`: AI integrations (Gemini, Groq).
