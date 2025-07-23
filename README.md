# AI Website Generator

## Overview

AI Website Generator is an MVP application that uses AI to create multi-page websites based on user descriptions. It features website generation powered by OpenAI, live previews, visual content editing, code viewing with syntax highlighting and formatting, and temporary storage of generated sites.

The project consists of:
- **Backend**: Node.js server handling AI generation and API endpoints
- **Frontend**: Next.js application for user interface, preview, and editing

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- OpenAI API key (set in .env file in backend)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd ai-website-generator
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

If using jsonrepair (for JSON parsing fixes):
```bash
npm install --save jsonrepair
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

Install additional packages if needed (e.g., for code formatting):
```bash
npm install react-syntax-highlighter prettier prettier-plugin-babel @babel/standalone
```

### 4. Set up environment variables

In `backend/`, create a `.env` file:
```
OPENAI_API_KEY=your-openai-key
```

## Running the Application

### 1. Start the backend server

```bash
cd backend
npm run dev  
```

The backend runs on port 3001 by default.

### 2. Start the frontend development server

```bash
cd frontend
npm run dev
```

The frontend runs on port 3000.

Open http://localhost:3000 in your browser.

## Usage

### 1. Generate a Website
- Enter a description (e.g., "A pet store website with home, about, services, and contact pages")
- Click "Generate" to create the site using AI
- The generated site will be previewed with navigation between pages

### 2. Preview and Navigate
- Use the navigation links to switch pages
- Toggle between rendered preview and code view

### 3. View Code
- In code view, see formatted JSX with syntax highlighting (powered by react-syntax-highlighter and Prettier)

### 4. Edit Content
- Click editable elements (marked with `data-edit-id`) to open a modal
- Update text content or styles (e.g., color, background, font size)
- Changes apply immediately and are stored temporarily

### 5. Troubleshooting
- If JSON parsing errors occur in backend, ensure jsonrepair is installed and integrated in `aiService.ts`
- Check console logs for detailed errors

## Features Implemented

- ✅ AI-powered website generation from descriptions
- ✅ Multi-page previews with navigation
- ✅ Code view with formatting and highlighting
- ✅ Visual content and style editing
- ✅ Temporary storage of generated sites

## Future Improvements

- Persistent storage (e.g., database integration)
- Advanced visual editing (drag-and-drop)
- Export generated sites as deployable code

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express, OpenAI API
- **Code Highlighting**: react-syntax-highlighter
- **Code Formatting**: Prettier


