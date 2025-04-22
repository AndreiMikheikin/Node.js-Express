import React from 'react';

function ConfigList({ configs, onSelect }) {
  if (configs.length === 0) {
    return (
      <div>
        <h2>Сохранённые конфигурации</h2>
        <p>Конфигурации пока не добавлены.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Сохранённые конфигурации</h2>
      <ul>
        {configs.map((config, index) => (
          <li key={index}>
            <button onClick={() => onSelect(config)} style={{ marginRight: '10px' }}>
              Выбрать
            </button>
            <strong>{config.method}</strong> {config.url}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConfigList;