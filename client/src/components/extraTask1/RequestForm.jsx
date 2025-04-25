import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const RequestForm = ({ onSendRequest, selectedConfig }) => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');

  // Единый эффект для обновления формы при изменении selectedConfig
  useEffect(() => {
    if (selectedConfig) {
      setUrl(selectedConfig.url || '');
      setMethod(selectedConfig.method || 'GET');
      setHeaders(selectedConfig.headers?.length ? selectedConfig.headers : [{ key: '', value: '' }]);
      setBody(selectedConfig.body || '');
    }
  }, [selectedConfig]);

  useEffect(() => {
    if (method === 'GET' || method === 'HEAD') {
      setBody('');
    }
  }, [method]);

  const handleHeaderChange = (index, field, value) => {
    const updatedHeaders = [...headers];
    updatedHeaders[index][field] = value;
    setHeaders(updatedHeaders);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const clearForm = () => {
    setUrl('');
    setMethod('GET');
    setHeaders([{ key: '', value: '' }]);
    setBody('');
  };

  const saveConfig = () => {
    // Фильтрация пустых заголовков
    const nonEmptyHeaders = headers.filter(header => header.key.trim() !== '');
    
    const newConfig = { 
      url, 
      method, 
      headers: nonEmptyHeaders,
      body: method !== 'GET' && method !== 'HEAD' ? body : undefined
    };

    const configs = JSON.parse(localStorage.getItem('savedRequests')) || [];
    
    // Проверка на существование такой же конфигурации
    const existingIndex = configs.findIndex(cfg => 
      cfg.url === newConfig.url &&
      cfg.method === newConfig.method
    );

    let updatedConfigs;
    if (existingIndex !== -1) {
      // Обновляем существующую конфигурацию
      updatedConfigs = [...configs];
      updatedConfigs[existingIndex] = newConfig;
    } else {
      // Добавляем новую конфигурацию
      updatedConfigs = [...configs, newConfig];
    }

    localStorage.setItem('savedRequests', JSON.stringify(updatedConfigs));
    alert('Конфигурация сохранена');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Преобразование заголовков в объект
    const headerObject = headers.reduce((acc, { key, value }) => {
      if (key.trim()) acc[key] = value;
      return acc;
    }, {});

    let parsedBody = body;
    if (body && body.trim().startsWith('{')) {
      try {
        parsedBody = JSON.parse(body);
      } catch (e) {
        alert('Тело запроса не является валидным JSON');
        return;
      }
    }

    const config = {
      url,
      method,
      headers: headerObject,
      ...(method !== 'GET' && method !== 'HEAD' && { body: typeof parsedBody === 'object' ? JSON.stringify(parsedBody) : parsedBody })
    };

    onSendRequest(config);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Настройка запроса</h2>

      <div>
        <label>URL:</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/api"
          required
        />
      </div>

      <div>
        <label>Метод:</label>
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
          <option value="HEAD">HEAD</option>
        </select>
      </div>

      <div>
        <label>Заголовки:</label>
        {headers.map((header, index) => (
          <div key={index}>
            <input
              type="text"
              value={header.key}
              onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
              placeholder="Ключ"
            />
            <input
              type="text"
              value={header.value}
              onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
              placeholder="Значение"
            />
            <button type="button" onClick={() => removeHeader(index)}>Удалить</button>
          </div>
        ))}
        <button type="button" onClick={addHeader}>Добавить заголовок</button>
      </div>

      {(method !== 'GET' && method !== 'HEAD') && (
        <div>
          <label>Тело запроса:</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Введите JSON, XML или текст"
            rows="5"
          />
        </div>
      )}

      <button type="submit">Отправить запрос</button>
      <button type="button" onClick={clearForm}>Очистить форму</button>
      <button type="button" onClick={saveConfig}>Сохранить конфигурацию</button>
    </form>
  );
};

RequestForm.propTypes = {
  onSendRequest: PropTypes.func.isRequired,
  selectedConfig: PropTypes.object
};

export default RequestForm;