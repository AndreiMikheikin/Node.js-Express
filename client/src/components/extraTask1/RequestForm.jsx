import React, { useState } from 'react';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const headerObject = headers.reduce((acc, { key, value }) => {
      if (key) acc[key] = value;
      return acc;
    }, {});

    const config = { url, method, headers: headerObject, body };
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

export default RequestForm;