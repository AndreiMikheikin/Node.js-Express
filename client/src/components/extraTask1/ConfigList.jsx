import React, { useEffect, useState } from 'react';
import '../styles/ConfigList.scss';

const ConfigList = ({ onSelect }) => {
  const [serverConfigs, setServerConfigs] = useState([]);
  const [localConfigs, setLocalConfigs] = useState([]);
  const [loading, setLoading] = useState(true);  // Чтобы отображать индикатор загрузки

  useEffect(() => {
    // Сначала читаем данные с сервера
    const fetchConfigsFromServer = async () => {
      try {
        const response = await fetch('http://178.250.247.67:3333/api/extraTask1/savedRequests');
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные с сервера');
        }
        const serverConfigsData = await response.json();
        setServerConfigs(serverConfigsData); // Устанавливаем данные с сервера
      } catch (error) {
        console.error('Ошибка при загрузке данных с сервера:', error);
      } finally {
        setLoading(false);  // Заканчиваем загрузку
      }
    };

    // Загружаем конфигурации из localStorage
    const storedConfigs = JSON.parse(localStorage.getItem('savedRequests')) || [];
    setLocalConfigs(storedConfigs);  // Устанавливаем данные из localStorage

    fetchConfigsFromServer(); // Загружаем данные с сервера
  }, []);

  // Удаление конфигурации с сервера
  const handleDeleteFromServer = async (index, configId) => {
    try {
      const response = await fetch(`http://178.250.247.67:3333/api/extraTask1/deleteRequest/${configId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Не удалось удалить конфигурацию с сервера');
      }

      // Обновляем состояние после удаления с сервера
      const updatedConfigs = serverConfigs.filter((_, i) => i !== index);
      setServerConfigs(updatedConfigs);
    } catch (error) {
      console.error('Ошибка при удалении конфигурации с сервера:', error);
    }
  };

  const handleDelete = (index, source, configId) => {
    if (source === 'local') {
      const updatedConfigs = localConfigs.filter((_, i) => i !== index);
      setLocalConfigs(updatedConfigs);
      localStorage.setItem('savedRequests', JSON.stringify(updatedConfigs)); 
    } else if (source === 'server') {
      handleDeleteFromServer(index, configId);
    }
  };

  const handleSelect = (config) => {
    if (onSelect) {
      onSelect(config);
    }
  };

  return (
    <div className="aam_config-list">
      <h2 className="aam_config-list__title">Сохранённые конфигурации</h2>

      {/* Конфигурации с сервера */}
      <div className="aam_config-list__section">
        <h3 className="aam_config-list__sub-title">Сохранённые конфигурации на сервере</h3>
        {loading ? (
          <p className="aam_config-list__loading">Загрузка...</p>
        ) : serverConfigs.length === 0 ? (
          <p className="aam_config-list__empty">Нет сохранённых конфигураций на сервере.</p>
        ) : (
          <ul className="aam_config-list__items">
            {serverConfigs.map((config, index) => (
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
                    onClick={() => handleDelete(index, 'server', config._id)}
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

      {/* Конфигурации из localStorage */}
      <div className="aam_config-list__section">
        <h3 className="aam_config-list__sub-title">Сохранённые конфигурации в localStorage</h3>
        {localConfigs.length === 0 ? (
          <p className="aam_config-list__empty">Нет сохранённых конфигураций в localStorage.</p>
        ) : (
          <ul className="aam_config-list__items">
            {localConfigs.map((config, index) => (
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
                    onClick={() => handleDelete(index, 'local')}
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

    </div>
  );
};

export default ConfigList;
