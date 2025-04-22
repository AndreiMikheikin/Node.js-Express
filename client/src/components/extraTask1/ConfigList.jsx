import React from 'react';

const ConfigList = ({ configs, onSelect, onDelete }) => {
  return (
    <div>
      <h2>Сохранённые конфигурации</h2>
      {configs.length === 0 ? (
        <p>Конфигурации пока не добавлены.</p>
      ) : (
        <ul>
          {configs.map((config, index) => (
            <li key={index}>
              <button onClick={() => onSelect(config)}>Выбрать</button>
              <button onClick={() => onDelete(index)}>Удалить</button>
              <strong>{config.method}</strong> {config.url}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ConfigList;