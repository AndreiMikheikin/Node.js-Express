import React, { useEffect, useState } from 'react';
import '../styles/ConfigList.scss';

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
    <div className="aam_config-list">
      <h2 className="aam_config-list__title">Сохранённые конфигурации</h2>
      {configs.length === 0 ? (
        <p className="aam_config-list__empty">Конфигурации пока не добавлены.</p>
      ) : (
        <ul className="aam_config-list__items">
          {configs.map((config, index) => (
            <li key={index} className="aam_config-list__item">
              <div className="aam_config-list__method-url">
                <strong>{config.method}</strong> {config.url}
              </div>
              <div className="aam_config-list__headers">
                <strong>Заголовки:</strong>
                <code className="aam_config-list__code">{JSON.stringify(config.headers)}</code>
              </div>
              <div className="aam_config-list__body">
                <strong>Тело запроса:</strong>
                <code className="aam_config-list__code">{JSON.stringify(config.body)}</code>
              </div>
              <div className="aam_config-list__buttons">
                <button
                  onClick={() => handleSelect(config)}
                  className="aam_config-list__button aam_config-list__button--select"
                >
                  Выбрать
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="aam_config-list__button aam_config-list__button--delete"
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
