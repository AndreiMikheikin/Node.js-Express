import React, { useState } from 'react';
import RequestForm from './components/RequestForm';
import ResponseViewer from './components/ResponseViewer';
import ConfigList from './components/ConfigList';
import './styles/MiniPostman.scss';

const MiniPostman = () => {
  const [config, setConfig] = useState(null);
  const [response, setResponse] = useState(null);

  const handleSendRequest = async (requestConfig) => {
    try {
      const res = await fetch('/api/miniPostman/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestConfig),
      });

      const responseData = await res.json();

      setResponse({
        status: responseData.status,
        statusText: responseData.statusText || '', // вдруг понадобится
        headers: responseData.headers || {},
        contentType: responseData.contentType || '',
        body: responseData.body,
      });
    } catch (error) {
      setResponse({
        status: 'Error',
        statusText: '',
        headers: {},
        contentType: '',
        body: error.message,
      });
    }
  };

  return (
    <div className="aam_extra-task1">
      <h1 className="aam_extra-task1__title">Мини-Postman</h1>

      <div className="aam_extra-task1__content">
        {/* Левая колонка: форма и список конфигов */}
        <div className="aam_extra-task1__left-column">
          <RequestForm onSendRequest={handleSendRequest} selectedConfig={config} />
          <ConfigList onSelect={setConfig} />
        </div>

        {/* Правая колонка: ответ сервера */}
        <div className="aam_extra-task1__right-column">
          <ResponseViewer response={response} />
        </div>
      </div>
    </div>
  );
};

export default MiniPostman;
