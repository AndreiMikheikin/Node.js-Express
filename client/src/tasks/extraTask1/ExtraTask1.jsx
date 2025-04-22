import React, { useState } from 'react';
import RequestForm from '../../components/extraTask1/RequestForm';
import ResponseViewer from '../../components/extraTask1/ResponseViewer';
import ConfigList from '../../components/extraTask1/ConfigList';

function ExtraTask1() {
  const [config, setConfig] = useState(null);
  const [response, setResponse] = useState(null);
  const [savedConfigs, setSavedConfigs] = useState([]);

  const handleSaveConfig = (newConfig) => {
    setSavedConfigs(prev => [...prev, newConfig]);
  };

  const handleSendRequest = async (requestConfig) => {
    try {
      const { url, method, headers, body } = requestConfig;
      const options = {
        method,
        headers: headers || {},
      };

      if (body && (method !== 'GET' && method !== 'HEAD')) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const contentType = res.headers.get('Content-Type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else if (contentType && contentType.startsWith('image/')) {
        data = await res.blob();
      } else {
        data = await res.text();
      }

      setResponse({
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
        contentType,
        body: data
      });

    } catch (error) {
      setResponse({
        status: 'Error',
        headers: {},
        contentType: '',
        body: error.message
      });
    }
  };

  return (
    <div>
      <h2>Мини Postman</h2>
      <RequestForm onSubmit={handleSendRequest} onSave={handleSaveConfig} />
      <ConfigList configs={savedConfigs} onSelect={setConfig} />
      <ResponseViewer response={response} />
    </div>
  );
}

export default ExtraTask1;