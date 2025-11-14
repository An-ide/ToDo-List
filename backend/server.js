const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with MongoDB later)
let todos = [];
let nextId = 1;

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    database: 'in-memory',
    timestamp: new Date().toISOString()
  });
});

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new todo
app.post('/api/todos', async (req, res) => {
  try {
    const todo = {
      _id: nextId++,
      title: req.body.title,
      description: req.body.description || '',
      completed: false,
      createdAt: new Date()
    };
    
    todos.unshift(todo); // Add to beginning
    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const todoIndex = todos.findIndex(todo => todo._id == id);
    
    if (todoIndex === -1) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    todos[todoIndex] = {
      ...todos[todoIndex],
      title: req.body.title,
      description: req.body.description,
      completed: req.body.completed
    };
    
    res.json(todos[todoIndex]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const todoIndex = todos.findIndex(todo => todo._id == id);
    
    if (todoIndex === -1) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    todos.splice(todoIndex, 1);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle todo completion
app.patch('/api/todos/:id/toggle', async (req, res) => {
  try {
    const id = req.params.id;
    const todoIndex = todos.findIndex(todo => todo._id == id);
    
    if (todoIndex === -1) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    todos[todoIndex].completed = !todos[todoIndex].completed;
    res.json(todos[todoIndex]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Using in-memory storage');
});