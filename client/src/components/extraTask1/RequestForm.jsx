import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const RequestForm = ({ onSendRequest, selectedConfig }) => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState({ url: '', body: '' });

  useEffect(() => {
    if (selectedConfig) {
      setUrl(selectedConfig.url || '');
      setMethod(selectedConfig.method || 'GET');
      setHeaders(selectedConfig.headers || [{ key: '', value: '' }]);
      setBody(selectedConfig.body || '');
    }
  }, [selectedConfig]);

  useEffect(() => {
    if (method === 'GET' || method === 'HEAD') {
      setBody('');
    }
  }, [method]);

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Сбрасываем ошибки
    setErrors({ url: '', body: '' });

    if (!url.trim()) {
      setErrors(prev => ({ ...prev, url: 'URL обязателен' }));
      return;
    }

    if (!validateUrl(url)) {
      setErrors(prev => ({ ...prev, url: 'Введите корректный URL (начинается с http:// или https://)' }));
      return;
    }

    const headerObject = headers.reduce((acc, { key, value }) => {
      if (key.trim()) acc[key] = value;
      return acc;
    }, {});

    let requestBody;
    if (method !== 'GET' && method !== 'HEAD' && body) {
      try {
        requestBody = body.trim().startsWith('{') ? JSON.parse(body) : body;
      } catch {
        setErrors(prev => ({ ...prev, body: 'Невалидный JSON' }));
        return;
      }
    }

    onSendRequest({
      url,
      method,
      headers: headerObject,
      body: requestBody
    });
  };

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
    setErrors({ url: '', body: '' });
  };

  const saveConfig = () => {
    const config = {
      url,
      method,
      headers: headers.filter(h => h.key.trim()),
      ...(method !== 'GET' && method !== 'HEAD' && { body })
    };

    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem('savedRequests')) || [];
    } catch (e) {
      console.error('Ошибка парсинга сохранённых запросов', e);
    }

    localStorage.setItem('savedRequests', JSON.stringify([...saved, config]));
    alert('Конфигурация сохранена');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Настройка запроса</h2>

      <div className="form-group">
        <label>URL:</label>
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setErrors(prev => ({ ...prev, url: '' }));
          }}
          placeholder="https://example.com/api"
          className={errors.url ? 'error' : ''}
        />
        {errors.url && <div className="error-message">{errors.url}</div>}
      </div>

      <div className="form-group">
        <label>Метод:</label>
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Заголовки:</label>
        {headers.map((header, index) => (
          <div key={index} className="header-row">
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
            <button type="button" onClick={() => removeHeader(index)}>
              ×
            </button>
          </div>
        ))}
        <button type="button" onClick={addHeader}>
          + Добавить заголовок
        </button>
      </div>

      {(method !== 'GET' && method !== 'HEAD') && (
        <div className="form-group">
          <label>Тело запроса:</label>
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setErrors(prev => ({ ...prev, body: '' }));
            }}
            placeholder="Введите JSON или текст"
            rows={5}
          />
          {errors.body && <div className="error-message">{errors.body}</div>}
        </div>
      )}

      <div className="form-actions">
        <button type="submit">Отправить запрос</button>
        <button type="button" onClick={clearForm}>Очистить</button>
        <button type="button" onClick={saveConfig}>Сохранить</button>
      </div>
    </form>
  );
};

RequestForm.propTypes = {
  onSendRequest: PropTypes.func.isRequired,
  selectedConfig: PropTypes.object
};

export default RequestForm;
