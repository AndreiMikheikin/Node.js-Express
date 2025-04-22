import React from 'react';

function ResponseView({ response }) {
  if (!response) {
    return <div><h2>Ответ</h2><p>Ответ ещё не получен.</p></div>;
  }

  return (
    <div>
      <h2>Ответ от сервера</h2>

      <div>
        <strong>HTTP-статус:</strong> {response.status} {response.statusText}
      </div>

      <div>
        <strong>Content-Type:</strong> {response.contentType}
      </div>

      <div>
        <strong>Заголовки ответа:</strong>
        <ul>
          {Object.entries(response.headers).map(([key, value]) => (
            <li key={key}><strong>{key}:</strong> {value}</li>
          ))}
        </ul>
      </div>

      <div>
        <strong>Тело ответа:</strong>
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', background: '#f4f4f4', padding: '10px' }}>
          {response.body}
        </pre>
      </div>
    </div>
  );
}

export default ResponseView;