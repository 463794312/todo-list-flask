from flask import Flask, render_template, request, jsonify, redirect, url_for
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)

DATABASE = 'todo.db'

# Function to create database connection
def get_db_connection():
    
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Function to initialize database table
def init_db():
    
    if not os.path.exists(DATABASE):
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                completed INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        print("Database initialized successfully!")

# Home page
@app.route('/')
def index():
    # Initialize database
    init_db()
    
    return render_template('index.html')

# Get all tasks
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    try:
        conn = get_db_connection()
        # Query all tasks ordered by creation time (newest first)
        tasks = conn.execute('SELECT * FROM todos ORDER BY created_at DESC').fetchall()
        conn.close()
        
        # Convert sqlite3.Row objects to list of dictionaries
        task_list = [dict(task) for task in tasks]

        return jsonify({'tasks': task_list}), 200
    
    except Exception as e:
        
        return jsonify({'error': str(e)}), 500

# Add new task
@app.route('/api/tasks', methods=['POST'])
def add_task():
    try:
        # Get task content from request JSON
        data = request.get_json()
        task_content = data.get('content', '').strip()
        
        # Validate task content (cannot be empty)
        if not task_content:
            return jsonify({'error': 'Task content cannot be empty!'}), 400
        
        # Insert new task into database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO todos (content, created_at) VALUES (?, ?)',
            (task_content, datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        )
        conn.commit()
        
        # Get the newly created task ID
        task_id = cursor.lastrowid
        conn.close()
        
        # Return success response with task ID
        return jsonify({'message': 'Task added successfully!', 'task_id': task_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Update task status
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        # Get completion status from request JSON
        data = request.get_json()
        completed = data.get('completed', 0)
        
        # Update task status in database
        conn = get_db_connection()
        conn.execute(
            'UPDATE todos SET completed = ? WHERE id = ?',
            (completed, task_id)
        )
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Task updated successfully!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Delete task
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        # Delete task from database
        conn = get_db_connection()
        conn.execute('DELETE FROM todos WHERE id = ?', (task_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Task deleted successfully!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':

    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)