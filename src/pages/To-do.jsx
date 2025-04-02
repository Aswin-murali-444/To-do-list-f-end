import React, { useState, useEffect } from 'react';
import '../css/styles.css';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

function ToDo() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
  });
  const [errors, setErrors] = useState({});
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
  });

  const validateForm = () => {
    const newErrors = {};
    if (!newTask.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!newTask.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!newTask.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('https://to-do-list-b-end-gf50.onrender.com');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        console.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddTask = async () => {
    if (!validateForm()) {
      window.alert('Please fill all fields before submitting the task.');
      return;
    }

    try {
      const response = await fetch('https://to-do-list-b-end-gf50.onrender.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const createdTask = await response.json();
      setTasks([...tasks, createdTask]);
      setNewTask({ title: '', description: '', dueDate: '', priority: 'medium' });
      setErrors({});
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await fetch(`https://to-do-list-b-end-gf50.onrender.com/${taskId}`, { method: 'DELETE' });
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task._id);
    setEditedTask(task);
  };

  const saveEditedTask = async () => {
    try {
      const response = await fetch(`https://to-do-list-b-end-gf50.onrender.com/${editingTaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedTask),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task._id === editingTaskId ? updatedTask : task)));
      setEditingTaskId(null);
      setEditedTask({ title: '', description: '', dueDate: '', priority: 'medium' });
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };

  const calculateTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const timeDiff = due - now;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return 'Overdue';
    } else if (daysRemaining === 0) {
      return 'Due today';
    } else {
      return `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining`;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="todo-container">
      <div className="header">
        <h1>My To-Do List</h1>
        <p>Stay organized and boost your productivity</p>
      </div>

      <div className="input-group">
        <input
          type="text"
          name="title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          placeholder="Task title"
          className={`task-input ${errors.title ? 'error' : ''}`}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
        <input
          type="text"
          name="description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          placeholder="Description"
          className={`task-input ${errors.description ? 'error' : ''}`}
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
        <input
          type="date"
          name="dueDate"
          value={newTask.dueDate}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          className={`task-input ${errors.dueDate ? 'error' : ''}`}
        />
        {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
        <select
          name="priority"
          value={newTask.priority}
          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          className="task-input"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button onClick={handleAddTask} className="add-btn">
          <FaPlus /> Add Task
        </button>
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task._id} className="task-item">
            <div className="task-content">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <small>Due: {new Date(task.dueDate).toLocaleDateString()}</small>
              <span className="time-remaining">{calculateTimeRemaining(task.dueDate)}</span>
              <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
            </div>
            <div className="task-actions">
              <button
                className="action-btn edit-btn"
                onClick={() => handleEditTask(task)}
              >
                <FaEdit /> Edit
              </button>
              <button
                className="action-btn delete-btn"
                onClick={() => handleDeleteTask(task._id)}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editingTaskId && (
  <div className="edit-modal">
    <div className="modal-content">
      <h2>Edit Task</h2>
      <input
        type="text"
        value={editedTask.title}
        onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
        placeholder="Task title"
        className="modal-input"
      />
      <input
        type="text"
        value={editedTask.description}
        onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
        placeholder="Description"
        className="modal-input"
      />
      <input
        type="date"
        value={editedTask.dueDate}
        onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
        className="modal-input"
      />
      <select
        value={editedTask.priority}
        onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
        className="modal-input"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <div className="modal-actions">
        <button onClick={saveEditedTask} className="save-btn">Save</button>
        <button onClick={() => setEditingTaskId(null)} className="cancel-btn">Cancel</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default ToDo;
