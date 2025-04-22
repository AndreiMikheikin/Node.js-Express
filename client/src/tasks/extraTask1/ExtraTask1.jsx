import React, { useState } from 'react';
import RequestForm from '../../components/extraTask1/RequestForm';
import ResponseViewer from '../../components/extraTask1/ResponseViewer';
import ConfigList from '../../components/extraTask1/ConfigList';

const ExtraTask1 = () => {
  const [config, setConfig] = useState(null);
  const [response, setResponse] = useState(null);
  const [savedConfigs, setSavedConfigs] = useState(() => {
    const saved = localStorage.getItem('savedConfigs');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSaveConfig = (newConfig) => {
    const updatedConfigs = [...savedConfigs, newConfig];
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('savedConfigs', JSON.stringify(updatedConfigs)); // Сохраняем
  };

  const handleDeleteConfig = (index) => {
    const updatedConfigs = savedConfigs.filter((_, i) => i !== index);
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('savedConfigs', JSON.stringify(updatedConfigs));
  };

  const handleSendRequest = async (requestConfig) => {
    try {
      const response = await fetch('http://178.250.247.67:3333/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestConfig), // Отправка конфигурации запроса
      });

      const responseData = await response.json();
      setResponse({
        status: responseData.status,
        headers: responseData.headers,
        contentType: responseData.contentType,
        body: responseData.body,
      });
    } catch (error) {
      setResponse({
        status: 'Error',
        headers: {},
        contentType: '',
        body: error.message,
      });
    }
  };

  return (
    <div>
      <h2>Мини Postman</h2>
      <RequestForm onSendRequest={handleSendRequest} onSave={handleSaveConfig} />
      <ConfigList
        configs={savedConfigs}
        onSelect={setConfig}
        onDelete={handleDeleteConfig}
      />
      <ResponseViewer response={response} />
    </div>
  );
}

export default ExtraTask1;
