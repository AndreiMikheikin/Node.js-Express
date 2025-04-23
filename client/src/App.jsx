import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import NextTask from './tasks/nextTask/nextTask';
import Task1 from './tasks/task1/Task1';
import Task2 from './tasks/task2/Task2';
import Task3 from './tasks/task3/Task3';
import Task4 from './tasks/task4/Task4';
import ExtraTask1 from './tasks/extraTask1/ExtraTask1';

const App = () => {
  return (
    <Router>
      <div className="app">
        <nav>
          <h1>Node.js/Express задания</h1>
          <ul>
            <li><NavLink to="/task1" activeClassName="active">Задание 1 - Голосование</NavLink></li>
            <li><NavLink to="/task2" activeClassName="active">Задание 2 - Форма валидации</NavLink></li>
            <li><NavLink to="/task3" activeClassName="active">Задание 3 - Загрузка статистики голосования</NavLink></li>
            <li><NavLink to="/task4" activeClassName="active">Задание 4 - Форма валидации POST</NavLink></li>
            <li>-------------------------------------------</li>
            <li>
              Контрольные задания:
              <ul>
                <li><NavLink to="/extraTask1" activeClassName="active">Контрольное задание 1 - Мини Postman</NavLink></li>
              </ul>
            </li>
            <li>-------------------------------------------</li>
            <li><NavLink to="/nextTask" activeClassName="active">Следующее задание</NavLink></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/task1" element={<Task1 />} />
          <Route path="/task2" element={<Task2 />} />
          <Route path="/task3" element={<Task3 />} />
          <Route path="/task4" element={<Task4 />} />
          <Route path="/extraTask1" element={<ExtraTask1 />} />
          <Route path="/nextTask" element={<NextTask />} />

          <Route path="/" element={
            <div className="welcome-message">
              <h2>Добро пожаловать!</h2>
              <p>Выберите задание из списка выше</p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;