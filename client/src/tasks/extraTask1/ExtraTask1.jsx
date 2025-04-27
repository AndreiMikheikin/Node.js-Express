import React, { useState } from 'react';
import RequestForm from '../../components/extraTask1/RequestForm';
import ResponseViewer from '../../components/extraTask1/ResponseViewer';
import ConfigList from '../../components/extraTask1/ConfigList';

const ExtraTask1 = () => {
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [response, setResponse] = useState(null);

  const handleSendRequest = async (requestConfig) => {
    try {
      const serverResponse = await fetch('http://178.250.247.67:3333/api/extraTask1/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestConfig),
      });

      const responseData = await serverResponse.json();
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

      <RequestForm
        selectedConfig={selectedConfig}
        onSendRequest={handleSendRequest}
      />

      <ConfigList
        onSelectConfig={setSelectedConfig}
      />

      <ResponseViewer response={response} />
    </div>
  );
};

export default ExtraTask1;
