import React from 'react';

const ResponseView = ({ response }) => {
  const copyToClipboard = () => {
    try {
      const textToCopy = typeof response?.body === 'object' 
        ? JSON.stringify(response.body, null, 2) 
        : String(response?.body || '');
      navigator.clipboard.writeText(textToCopy);
      alert('Ответ скопирован!');
    } catch (error) {
      alert('Не удалось скопировать ответ');
      console.error('Ошибка копирования:', error);
    }
  };

  if (!response) {
    return (
      <div>
        <h2>Ответ</h2>
        <p>Ответ ещё не получен.</p>
      </div>
    );
  }

  // Безопасное получение данных
  const status = response.status || 'No status';
  const statusText = response.statusText || '';
  const contentType = response.contentType || 'Не указан';
  const headers = response.headers || {};
  const body = typeof response.body === 'object' 
    ? JSON.stringify(response.body, null, 2) 
    : response.body;

  return (
    <div>
      <h2>Ответ от сервера</h2>

      <div>
        <strong>HTTP-статус:</strong> {status} {statusText}
      </div>

      <div>
        <strong>Content-Type:</strong> {contentType}
      </div>

      <div>
        <strong>Заголовки ответа:</strong>
        {Object.keys(headers).length > 0 ? (
          <ul>
            {Object.entries(headers).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
              </li>
            ))}
          </ul>
        ) : (
          <p>Заголовки отсутствуют</p>
        )}
      </div>

      <div>
        <strong>Тело ответа:</strong>
        <pre style={{ 
          whiteSpace: 'pre-wrap', 
          wordWrap: 'break-word', 
          background: '#f4f4f4', 
          padding: '10px',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {body}
        </pre>
      </div>

      <button 
        onClick={copyToClipboard}
        style={{
          marginTop: '10px',
          padding: '5px 10px',
          cursor: 'pointer'
        }}
      >
        Копировать ответ
      </button>
    </div>
  );
};

export default ResponseView;