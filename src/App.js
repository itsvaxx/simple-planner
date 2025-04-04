import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Helper function to create date strings without timezone issues
  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to parse date strings correctly
  const parseDateString = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  };

  // Load tasks from localStorage
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('simpleplanner-tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  // Initialize with today's date
  const today = getLocalDateString();
  const [newTask, setNewTask] = useState({
    title: '',
    date: today,
    time: ''
  });

  const [view, setView] = useState('daily');
  const [currentDate, setCurrentDate] = useState(today);
  const [editingTask, setEditingTask] = useState(null);

  // Get week start date (Sunday)
  const getWeekStartDate = (dateString) => {
    const date = parseDateString(dateString);
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    return getLocalDateString(weekStart);
  };

  const [weekStart, setWeekStart] = useState(getWeekStartDate(today));

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('simpleplanner-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value
    });
  };

  const addTask = () => {
    if (!newTask.title.trim() || !newTask.date || !newTask.time) {
      alert('Please fill in all fields');
      return;
    }

    if (editingTask) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? 
        { ...newTask, id: editingTask.id } : 
        task
      ));
      setEditingTask(null);
    } else {
      setTasks([...tasks, {
        ...newTask,
        id: Date.now()
      }]);
    }

    setNewTask({
      title: '',
      date: today,
      time: ''
    });
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const editTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      date: task.date,
      time: task.time
    });
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? 
      { ...task, completed: !task.completed } : 
      task
    ));
  };

  const changeDate = (days) => {
    const date = parseDateString(currentDate);
    date.setDate(date.getDate() + days);
    setCurrentDate(getLocalDateString(date));
  };

  const changeWeek = (weeks) => {
    const date = parseDateString(weekStart);
    date.setDate(date.getDate() + (weeks * 7));
    setWeekStart(getLocalDateString(date));
  };

  const formatDisplayDate = (dateString) => {
    const date = parseDateString(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const handleDateClick = (dateString) => {
    setCurrentDate(dateString);
    setView('daily');
  };

  // Fixed task filtering
  const filteredTasks = view === 'daily' 
    ? tasks.filter(task => task.date === currentDate)
    : tasks.filter(task => {
        const taskDate = parseDateString(task.date);
        const startDate = parseDateString(weekStart);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        return taskDate >= startDate && taskDate <= endDate;
      });

  return (
    <div className="app">
      <h1>SimplePlanner</h1>
      
      <div className="view-toggle">
        <button 
          onClick={() => setView('daily')} 
          className={view === 'daily' ? 'active' : ''}
        >
          Daily View
        </button>
        <button 
          onClick={() => setView('weekly')} 
          className={view === 'weekly' ? 'active' : ''}
        >
          Weekly View
        </button>
      </div>

      {view === 'daily' ? (
        <div className="daily-view">
          <div className="date-navigation">
            <button onClick={() => changeDate(-1)}>Previous</button>
            <h2>{formatDisplayDate(currentDate)}</h2>
            <button onClick={() => changeDate(1)}>Next</button>
          </div>
          
          <div className="task-form">
            <input
              type="text"
              name="title"
              placeholder="Task title"
              value={newTask.title}
              onChange={handleInputChange}
            />
            <input
              type="date"
              name="date"
              value={newTask.date}
              onChange={handleInputChange}
            />
            <input
              type="time"
              name="time"
              value={newTask.time}
              onChange={handleInputChange}
            />
            <button onClick={addTask}>
              {editingTask ? 'Update Task' : 'Add Task'}
            </button>
            {editingTask && (
              <button onClick={() => {
                setEditingTask(null);
                setNewTask({
                  title: '',
                  date: new Date().toISOString().split('T')[0],
                  time: ''
                });
              }}>
                Cancel
              </button>
            )}
          </div>

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <p>No tasks for this day</p>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} className={`task ${task.completed ? 'completed' : ''}`}>
                  <div className="task-info">
                    <span className="task-time">{task.time}</span>
                    <span className="task-title">{task.title}</span>
                  </div>
                  <div className="task-actions">
                    <button onClick={() => toggleComplete(task.id)}>
                      {task.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button onClick={() => editTask(task)}>Edit</button>
                    <button onClick={() => deleteTask(task.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="weekly-view">
          <div className="week-navigation">
            <button onClick={() => changeWeek(-1)}>Previous Week</button>
            <h2>Week of {formatDisplayDate(weekStart)}</h2>
            <button onClick={() => changeWeek(1)}>Next Week</button>
          </div>

          {/*In your WeeklyView rendering*/}
          <div className="week-grid">
            {Array.from({ length: 7 }).map((_, index) => {
              const date = new Date(weekStart);
              date.setDate(date.getDate() + index);
              const dateString = date.toISOString().split('T')[0];
              const dayTasks = tasks.filter(task => task.date === dateString);
              
              return (
                <div key={index} className="day-column">
                  {/* Make the date header clickable */}
                  <div
                    className={`day-header clickable-date ${
                      dateString === currentDate ? 'current-day' : ''
                    }`}
                    onClick={() => handleDateClick(dateString)}
                  >
                    {formatDisplayDate(dateString)}
                  </div>
                  {dayTasks.map(task => (
                    <div key={task.id} className={`weekly-task ${task.completed ? 'completed' : ''}`}>
                      <div className="weekly-task-info">
                        <span className="weekly-task-time">{task.time}</span>
                        <span className="weekly-task-title">{task.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
        )}
    </div>
  );
}

export default App;