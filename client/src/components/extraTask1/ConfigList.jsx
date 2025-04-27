import React, { useEffect, useState } from 'react';

const ConfigList = ({ onSelect }) => {
  const [configs, setConfigs] = useState([]);

  useEffect(() => {
    const storedConfigs = JSON.parse(localStorage.getItem('savedRequests')) || [];
    setConfigs(Array.isArray(storedConfigs) ? storedConfigs : []);
  }, []);

  const handleDelete = (index) => {
    const updatedConfigs = configs.filter((_, i) => i !== index);
    setConfigs(updatedConfigs);
    localStorage.setItem('savedRequests', JSON.stringify(updatedConfigs));
  };

  const handleSelect = (config) => {
    if (onSelect) {
      onSelect(config);
    }
  };

  return (
    <div>
      <h2>Сохранённые конфигурации</h2>
      {configs.length === 0 ? (
        <p>Конфигурации пока не добавлены.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {configs.map((config, index) => (
            <li key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              marginBottom: '15px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9'
            }}>
              <div><strong>{config.method}</strong> {config.url}</div>
              <div>
                <sub><strong>Заголовки:</strong> {JSON.stringify(config.headers)}</sub>
              </div>
              <div>
                <sub><strong>Тело запроса:</strong> {JSON.stringify(config.body)}</sub>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <button
                  onClick={() => handleSelect(config)}
                  style={{
                    padding: '5px 10px',
                    cursor: 'pointer',
                    backgroundColor: '#e0f7fa',
                    border: '1px solid #00acc1',
                    borderRadius: '4px'
                  }}
                >
                  Выбрать
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  style={{
                    padding: '5px 10px',
                    cursor: 'pointer',
                    backgroundColor: '#ffebee',
                    border: '1px solid #e53935',
                    borderRadius: '4px'
                  }}
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConfigList;
