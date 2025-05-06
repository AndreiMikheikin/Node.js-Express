import React, { useEffect, useState, useCallback } from 'react';
import '../styles/ConfigList.scss';
import ServerRenderedTemplates from './ServerRenderedTemplates';

const ConfigList = ({ onSelect }) => {
  const [configs, setConfigs] = useState({
    server: [],
    local: [],
    loading: true,
  });

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const [serverResponse, localData] = await Promise.all([
          fetch('/api/miniPostman/savedRequests')
            .then(res => {
              if (!res.ok) throw new Error('Ошибка запроса к серверу');
              return res.json();
            }),
          Promise.resolve(
            JSON.parse(localStorage.getItem('savedRequests') || '[]')
          )
        ]);

        setConfigs({
          server: serverResponse,
          local: localData,
          loading: false,
        });
      } catch (error) {
        console.error('Ошибка при загрузке конфигураций:', error);
        setConfigs(prev => ({ ...prev, loading: false }));
      }
    };

    fetchConfigs();
  }, []);

  const handleDeleteFromServer = useCallback(async (index, configId) => {
    try {
      const response = await fetch(`/api/miniPostman/deleteRequest/${configId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Не удалось удалить с сервера');

      setConfigs(prev => ({
        ...prev,
        server: prev.server.filter((_, i) => i !== index),
      }));
    } catch (error) {
      console.error('Ошибка при удалении:', error);
    }
  }, []);

  const handleDelete = useCallback((index, source, configId) => {
    if (source === 'local') {
      const updated = configs.local.filter((_, i) => i !== index);
      localStorage.setItem('savedRequests', JSON.stringify(updated));
      setConfigs(prev => ({ ...prev, local: updated }));
    } else if (source === 'server') {
      handleDeleteFromServer(index, configId);
    }
  }, [configs.local, handleDeleteFromServer]);

  const handleSelect = useCallback((config) => {
    onSelect(config);
  }, [onSelect]);

  return (
    <div className="aam_config-list">
      <h2 className="aam_config-list__title">Сохранённые конфигурации</h2>

      {/* Серверный рендеринг */}
      <ServerRenderedTemplates onSelect={handleSelect} onDelete={handleDelete} />

      {/* Серверные конфиги */}
      <div className="aam_config-list__section">
        <h3 className="aam_config-list__sub-title">Сохранённые конфигурации на сервере</h3>
        {configs.loading ? (
          <p className="aam_config-list__loading">Загрузка...</p>
        ) : configs.server.length === 0 ? (
          <p className="aam_config-list__empty">Нет конфигураций на сервере.</p>
        ) : (
          <ul className="aam_config-list__items">
            {configs.server.map((config, index) => (
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
                    onClick={() => onSelect(config)}
                    className="aam_config-list__button aam_config-list__button--select"
                  >
                    Выбрать
                  </button>
                  <button
                    onClick={() => handleDelete(index, 'server', config.id)}
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

      {/* Локальные конфиги */}
      <div className="aam_config-list__section">
        <h3 className="aam_config-list__sub-title">Сохранённые конфигурации в localStorage</h3>
        {configs.local.length === 0 ? (
          <p className="aam_config-list__empty">Нет конфигураций в localStorage.</p>
        ) : (
          <ul className="aam_config-list__items">
            {configs.local.map((config, index) => (
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
                    onClick={() => onSelect(config)}
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
