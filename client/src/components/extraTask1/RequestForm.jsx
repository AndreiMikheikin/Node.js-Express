import React, { useState } from 'react';
import PropTypes from 'prop-types';

const RequestForm = ({ onSendRequest }) => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');

  const handleHeaderChange = (index, field, value) => {
    const updatedHeaders = [...headers];
    updatedHeaders[index][field] = value;
    setHeaders(updatedHeaders);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index) => {
    const updatedHeaders = headers.filter((_, i) => i !== index);
    setHeaders(updatedHeaders);
  };

  const handleSaveClick = () => {
    const newConfig = {
      url,
      method,
      headers,
      body,
    };
  
    // Получаем уже сохранённые конфигурации
    const savedConfigs = JSON.parse(localStorage.getItem('savedRequestConfigs')) || [];
  
    // Проверка: есть ли уже такая конфигурация
    const isDuplicate = savedConfigs.some(config =>
      config.url === newConfig.url &&
      config.method === newConfig.method &&
      JSON.stringify(config.headers) === JSON.stringify(newConfig.headers) &&
      config.body === newConfig.body
    );
  
    if (isDuplicate) {
      alert('Такая конфигурация уже сохранена!');
      return;
    }
  
    // Добавляем и сохраняем
    savedConfigs.push(newConfig);
    localStorage.setItem('savedRequestConfigs', JSON.stringify(savedConfigs));
    alert('Конфигурация успешно сохранена!');
  }; 

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const headerObject = headers.reduce((acc, { key, value }) => {
        if (key) acc[key] = value;
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
    } catch (error) {
      alert(`Ошибка: ${error.message}`);
    }
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
        <button type="button" onClick={handleSaveClick}>Сохранить конфигурацию</button>
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
    </form>
  );
}

RequestForm.propTypes = {
  onSendRequest: PropTypes.func.isRequired
};

RequestForm.defaultProps = {
  onSendRequest: (config) => {console.log('Конфигурация запроса:', config)}
};

export default RequestForm;
