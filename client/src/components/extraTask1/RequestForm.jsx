import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/RequestForm.scss';

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

    // Проверяем, есть ли уже сохранённая конфигурация с таким url и методом
    const existingIndex = saved.findIndex(item => item.url === config.url && item.method === config.method);

    if (existingIndex !== -1) {
      // Если нашли — обновляем
      saved[existingIndex] = config;
    } else {
      // Если не нашли — добавляем
      saved.push(config);
    }

    localStorage.setItem('savedRequests', JSON.stringify(saved));
    alert('Конфигурация сохранена');
  };

  // Обработчик для сохранения на сервер
  const saveConfigToServer = async (config) => {
    try {
      const response = await fetch('http://178.250.247.67:3333/api/extraTask1/saveRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Не удалось сохранить конфигурацию на сервере');
      }

      const result = await response.json();
      console.log('Конфигурация успешно сохранена на сервере:', result);
    } catch (error) {
      console.error('Ошибка при сохранении конфигурации:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="aam_request-form">
      <h2 className="aam_form-title">Настройка запроса</h2>

      <div className="aam_form-group">
        <label className="aam_label">URL:</label>
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setErrors(prev => ({ ...prev, url: '' }));
          }}
          placeholder="https://example.com/api"
          className={`aam_input ${errors.url ? 'aam_input-error' : ''}`}
        />
        {errors.url && <div className="aam_error-message">{errors.url}</div>}
      </div>

      <div className="aam_form-group">
        <label className="aam_label">Метод:</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="aam_select"
        >
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="aam_form-group">
        <label className="aam_label">Заголовки:</label>
        {headers.map((header, index) => (
          <div key={index} className="aam_header-row">
            <input
              type="text"
              value={header.key}
              onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
              placeholder="Ключ"
              className="aam_input"
            />
            <input
              type="text"
              value={header.value}
              onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
              placeholder="Значение"
              className="aam_input"
            />
            <button
              type="button"
              onClick={() => removeHeader(index)}
              className="aam_button-remove"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addHeader}
          className="aam_button-add"
        >
          + Добавить заголовок
        </button>
      </div>

      {(method !== 'GET' && method !== 'HEAD') && (
        <div className="aam_form-group">
          <label className="aam_label">Тело запроса:</label>
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setErrors(prev => ({ ...prev, body: '' }));
            }}
            placeholder="Введите JSON или текст"
            rows={5}
            className={`aam_textarea ${errors.body ? 'aam_input-error' : ''}`}
          />
          {errors.body && <div className="aam_error-message">{errors.body}</div>}
        </div>
      )}

      <div className="aam_form-actions">
        <button type="submit" className="aam_button-primary">Отправить запрос</button>
        <button type="button" onClick={clearForm} className="aam_button-secondary">Очистить</button>
        <button type="button" onClick={saveConfig} className="aam_button-secondary">Сохранить</button>
        <button
          type="button"
          onClick={() => {
            const config = {
              url,
              method,
              headers: headers.filter(h => h.key.trim()),
              ...(method !== 'GET' && method !== 'HEAD' && { body })
            };
            saveConfigToServer(config);
          }}
          className="aam_button-secondary"
        >Сохранить на сервер</button>
      </div>
    </form>
  );

};

RequestForm.propTypes = {
  onSendRequest: PropTypes.func.isRequired,
  selectedConfig: PropTypes.object
};

export default RequestForm;
