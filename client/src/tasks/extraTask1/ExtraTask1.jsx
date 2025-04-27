import React, { useState } from 'react';
import RequestForm from '../../components/extraTask1/RequestForm';
import ResponseViewer from '../../components/extraTask1/ResponseViewer';
import ConfigList from '../../components/extraTask1/ConfigList';

const ExtraTask1 = () => {
  const [config, setConfig] = useState(null);
  const [response, setResponse] = useState(null);

  const handleSendRequest = async (requestConfig) => {
    try {
      const res = await fetch('http://178.250.247.67:3333/api/extraTask1/proxy', {
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
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>Мини-Postman 🚀</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Левая колонка: форма и список конфигов */}
        <div>
          <RequestForm onSendRequest={handleSendRequest} selectedConfig={config} />
          <ConfigList onSelect={setConfig} />
        </div>

        {/* Правая колонка: ответ сервера */}
        <div>
          <ResponseViewer response={response} />
        </div>
      </div>
    </div>
  );
};

export default ExtraTask1;
