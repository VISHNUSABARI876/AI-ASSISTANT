# AI Assistant Combined Starter

A full-stack AI Assistant application featuring a React/Vite frontend and a Python/Flask backend. This application provides a modular starting point for building AI-powered tools, including conversational chat, PDF summarization, code generation, and file management.

## Features

- **Conversational Chat**: Interactive chat interface powered by AI models.
- **PDF Summarization**: Upload PDF documents and get concise summaries.
- **Code Generation**: Specialized endpoint for generating and assisting with code.
- **File Management**: Upload and manage files securely.
- **Authentication**: JWT-based authentication with secure password hashing (bcrypt).
- **Modern UI**: Built with React, Tailwind CSS, and Vite for a fast, responsive, and beautiful user experience.

## Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Markdown**: react-markdown, react-syntax-highlighter
- **HTTP Client**: Axios

### Backend
- **Framework**: Flask
- **Database**: SQLAlchemy (Flask-SQLAlchemy)
- **Authentication**: PyJWT, bcrypt
- **AI Integration**: google-generativeai, transformers, torch
- **PDF Processing**: PyPDF2

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (3.9 or higher)
- API Keys for AI Services (e.g., Google Gemini API key)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env` file in the `backend` directory based on your configuration needs (e.g., API keys, database URI, JWT secret).
   ```env
   # Example .env file
   SECRET_KEY=your_super_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Run the Flask server:**
   ```bash
   flask run
   # or
   python app.py
   ```
   The backend will typically run on `http://localhost:5000`.

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the `frontend` directory if you need to override default API URLs.
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

---

## API Endpoints Overview

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive JWT
- `POST /chat` - Send a message and receive an AI response
- `POST /upload` - Upload files/PDFs
- `POST /summarize` - Request a summary of an uploaded document
- `POST /generate-code` - Request code generation based on a prompt

## License

This project is licensed under the MIT License.
