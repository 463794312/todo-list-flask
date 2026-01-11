# To-Do List Manager

A full-stack, responsive To-Do List application built with Flask (Python) for backend, SQLite for database, and vanilla HTML/CSS/JavaScript for frontend.

## Features

- ✅ Add new tasks with text input
- ✅ Mark tasks as complete/incomplete
- ✅ Delete unwanted tasks
- ✅ Filter tasks (All / Active / Completed)
- ✅ Responsive design (works on mobile/desktop)
- ✅ Data persistence with SQLite database
- ✅ Input validation and error handling
- ✅ XSS protection for user input

## Tech Stack

- **Backend**: Python, Flask
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Database**: SQLite
- **Tools**: Git, VS Code

## How to Run Locally

### Prerequisites

- Python 3.8+ installed
- Git installed

### Steps

1. Clone the repository

   ```bash
   git clone https://github.com/你的GitHub用户名/todo-list-flask.git
   cd todo-list-flask

   ```

2. Install dependencies

   ```bash
   # For Windows
   pip install flask

   # For macOS/Linux
   pip3 install flask

   ```

3. Run the Application

   ```bash
   # For Windows
   python app.py

   # For macOS/Linux
   python3 app.py

   ```

4. Access the App
   Open your web browser and visit: http://127.0.0.1:5000

## Screenshots

**Desktop View**

<img src="screenshots\desktop-view.png" alt="desktop view" width="80%">

**Mobile View**

<img src="screenshots\mobile-view.jpg" alt="mobile view" width="30%">

## Project Structure

```bash
todo-list-flask/
├── app.py              # Core backend logic (Flask routes, DB operations)
├── todo.db             # SQLite database file (auto-generated)
├── static/             # Static assets (CSS/JS)
│   ├── css/
│   │   └── style.css   # Frontend styling (responsive design)
│   └── js/
│       └── script.js   # Frontend interactivity (API calls, UI updates)
└── templates/
    └── index.html      # Main HTML template (UI structure)

```

## Key Technical Points

- Used Flask to create RESTful API endpoints for CRUD operations
- Implemented SQLite database with connection management and table initialization
- Added responsive CSS with media queries for mobile compatibility
- Implemented client-side form validation and error handling
- Added XSS protection by escaping user input
- Used Fetch API for asynchronous communication between frontend and backend
