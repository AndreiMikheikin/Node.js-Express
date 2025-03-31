import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Task1 from './tasks/task1/Task1';
import Task2 from './tasks/task2/Task2';

function App() {
  return (
    <Router>
      <div className="app">
        <nav>
          <h1>Node.js/Express задания</h1>
          <ul>
            <li><Link to="/task1">Задание 1 - Голосование</Link></li>
            <li><Link to="/task2">Задание 2 - Следующее задание</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/task1" element={<Task1 />} />
          <Route path="/task2" element={<Task2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;