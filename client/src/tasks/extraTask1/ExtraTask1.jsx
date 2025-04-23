import React, { useState } from 'react';
import RequestForm from '../../components/extraTask1/RequestForm';
import ResponseViewer from '../../components/extraTask1/ResponseViewer';
import ConfigList from '../../components/extraTask1/ConfigList';

const ExtraTask1 = () => {
  const [config, setConfig] = useState(null);
  const [response, setResponse] = useState(null);
  const [savedConfigs, setSavedConfigs] = useState(() => {
    // Загружаем сохраненные конфигурации из localStorage при инициализации
    const saved = localStorage.getItem('savedConfigs');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSaveConfig = (newConfig) => {
    const updatedConfigs = [...savedConfigs, newConfig];
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('savedConfigs', JSON.stringify(updatedConfigs)); // Сохраняем в localStorage
  };

  const handleDeleteConfig = (index) => {
    const updatedConfigs = savedConfigs.filter((_, i) => i !== index);
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('savedConfigs', JSON.stringify(updatedConfigs)); // Сохраняем изменения в localStorage
  };

  const handleSendRequest = async (requestConfig) => {
    try {
      const response = await fetch('http://178.250.247.67:3333//api/extraTask1/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestConfig), // Отправка конфигурации запроса
      });

      // Получаем и обрабатываем ответ от сервера
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
        body: error.message, // Обрабатываем ошибки
      });
    }
  };

  return (
    <div>
      <h2>Мини Postman</h2>
      {/* Компонент для формы запроса */}
      <RequestForm onSendRequest={handleSendRequest} onSave={handleSaveConfig} />

      {/* Список сохраненных конфигураций */}
      <ConfigList
        configs={savedConfigs}
        onSelect={setConfig}
        onDelete={handleDeleteConfig}
      />

      {/* Просмотр ответа от сервера */}
      <ResponseViewer response={response} />
    </div>
  );
};

export default ExtraTask1;
