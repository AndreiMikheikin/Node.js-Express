import React, { useState } from 'react';
import PropTypes from 'prop-types';

function RequestForm({ onSendRequest }) {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      // Формируем объект заголовков
      const headerObject = headers.reduce((acc, { key, value }) => {
        if (key) acc[key] = value;
        return acc;
      }, {});

      // Проверяем URL
      if (!url) {
        alert("Пожалуйста, введите URL.");
        return;
      }

      // Проверяем тело запроса для GET/HEAD
      if ((method === 'GET' || method === 'HEAD') && body) {
        alert("Методы GET и HEAD не поддерживают тело запроса.");
        return;
      }

      // Подготавливаем конфигурацию
      const config = { 
        url, 
        method, 
        headers: headerObject, 
        ...(method !== 'GET' && method !== 'HEAD' && { body }) 
      };
      
      // Проверяем и вызываем callback
      if (typeof onSendRequest === 'function') {
        onSendRequest(config);
      } else {
        console.error('onSendRequest не является функцией');
        alert('Ошибка: обработчик запроса не настроен');
      }
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      alert('Произошла ошибка при формировании запроса');
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
  onSendRequest: (config) => console.log('Конфигурация запроса:', config)
};

export default RequestForm;