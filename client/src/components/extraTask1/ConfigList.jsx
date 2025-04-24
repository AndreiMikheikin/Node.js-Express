import React, { useEffect, useState } from 'react';

const ConfigList = ({ onSelect }) => {
  const [configs, setConfigs] = useState([]);

  useEffect(() => {
    const storedConfigs = JSON.parse(localStorage.getItem('savedRequests')) || [];
    setConfigs(storedConfigs);
  }, []);

  const handleDelete = (index) => {
    const updatedConfigs = configs.filter((_, i) => i !== index);
    setConfigs(updatedConfigs);
    localStorage.setItem('savedRequestConfigs', JSON.stringify(updatedConfigs));
  };

  const handleSelect = (config) => {
    onSelect(config);
  };

  return (
    <div>
      <h2>Сохранённые конфигурации</h2>
      {configs.length === 0 ? (
        <p>Конфигурации пока не добавлены.</p>
      ) : (
        <ul>
          {configs.map((config, index) => (
            <li key={index}>
              <button onClick={() => handleSelect(config)}>Выбрать</button>
              <button onClick={() => handleDelete(index)}>Удалить</button>
              <strong>{config.method}</strong> {config.url}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConfigList;