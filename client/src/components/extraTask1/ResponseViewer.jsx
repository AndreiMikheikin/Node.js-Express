import React, { useMemo } from 'react';
import Preview from './Preview';

const ResponseView = ({ response }) => {
  const copyToClipboard = () => {
    try {
      const textToCopy = typeof response?.body === 'object'
        ? JSON.stringify(response.body, null, 2)
        : String(response?.body || '');

      if (!textToCopy.trim()) {
        alert('Нечего копировать: тело ответа пустое.');
        return;
      }

      navigator.clipboard.writeText(textToCopy);
      alert('Ответ скопирован!');
    } catch (error) {
      console.error('Ошибка копирования:', error);
      alert('Не удалось скопировать ответ.');
    }
  };

  const isEmptyResponse = !response;

  const { status = '', statusText = '', contentType = 'text/plain', headers = {}, body: rawBody } = response || {};

  const body = useMemo(() => {
    if (typeof rawBody === 'object') {
      return JSON.stringify(rawBody, null, 2);
    }
    return rawBody || '';
  }, [rawBody]);

  if (isEmptyResponse) {
    return (
      <div>
        <h2>Ответ</h2>
        <p>Ответ ещё не получен.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Ответ от сервера</h2>

      <div><strong>HTTP-статус:</strong> {status} {statusText}</div>
      <div><strong>Content-Type:</strong> {contentType}</div>

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
          <p>Заголовки отсутствуют.</p>
        )}
      </div>

      <div>
        <strong>Тело ответа:</strong>
        {body ? (
          <pre style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            background: '#f4f4f4',
            padding: '10px',
            maxHeight: '900px',
            overflow: 'auto',
            marginBottom: '10px'
          }}>
            {body}
          </pre>
        ) : (
          <p>Тело ответа пустое.</p>
        )}
        <Preview body={body} contentType={contentType} />
      </div>

      <button
        onClick={copyToClipboard}
        style={{
          marginTop: '10px',
          padding: '5px 10px',
          cursor: 'pointer',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      >
        Копировать ответ
      </button>
    </div>
  );
};

export default ResponseView;
