import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NextTask from './tasks/nextTask/nextTask';
import Task1 from './tasks/task1/Task1';

function App() {
  return (
    <Router>
      <div className="app">
        <nav>
          <h1>Node.js/Express задания</h1>
          <ul>
            <li><Link to="/task1">Задание 1 - Голосование</Link></li>
            <li><Link to="/task2">Задание 2 - Форма валидации</Link></li>
            <li><Link to="/nextTask">Следующее задание</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/task1" element={<Task1 />} />
          <Route path="/nextTask" element={<NextTask />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;