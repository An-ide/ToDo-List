import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await axios.post(`${API_URL}/todos`, {
        title,
        description
      });
      setTodos([response.data, ...todos]);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const response = await axios.put(`${API_URL}/todos/${id}`, updates);
      setTodos(todos.map(todo => 
        todo._id === id ? response.data : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const toggleComplete = async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/todos/${id}/toggle`);
      setTodos(todos.map(todo => 
        todo._id === id ? response.data : todo
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const startEdit = (todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setDescription(todo.description);
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setTitle('');
    setDescription('');
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await updateTodo(editingTodo._id, { title, description });
      cancelEdit();
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.length - completedCount;

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>MERN Todo List</h1>
          <p>{activeCount} tasks remaining</p>
        </header>

        {/* Add/Edit Form */}
        <form className="todo-form" onSubmit={editingTodo ? saveEdit : addTodo}>
          <input
            type="text"
            className="todo-input"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="todo-description"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="2"
          />
          <div className="form-actions">
            {editingTodo ? (
              <>
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              </>
            ) : (
              <button type="submit" className="btn btn-primary">Add Todo</button>
            )}
          </div>
        </form>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({todos.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({activeCount})
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Todo List */}
        <div className="todo-list">
          {filteredTodos.map(todo => (
            <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <div className="todo-content">
                <div 
                  className="todo-checkbox"
                  onClick={() => toggleComplete(todo._id)}
                >
                  {todo.completed ? '✓' : ''}
                </div>
                <div className="todo-text">
                  <h3 className="todo-title">{todo.title}</h3>
                  {todo.description && (
                    <p className="todo-description-text">{todo.description}</p>
                  )}
                  <span className="todo-date">
                    {new Date(todo.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="todo-actions">
                <button 
                  className="btn btn-edit"
                  onClick={() => startEdit(todo)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-delete"
                  onClick={() => deleteTodo(todo._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          
          {filteredTodos.length === 0 && (
            <div className="empty-state">
              {filter === 'all' 
                ? 'No todos yet. Add one above!' 
                : `No ${filter} todos.`
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;