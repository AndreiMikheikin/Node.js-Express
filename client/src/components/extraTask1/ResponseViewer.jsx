import React from 'react';

const Preview = ({ body, contentType }) => {
  if (!body || typeof body !== 'string') return null;

  const isImage = contentType.startsWith('image/') || body.startsWith('data:image');
  const isSvg = contentType.includes('svg+xml') || body.trim().startsWith('<svg');

  if (isImage && !isSvg) {
    return <img src={body} alt="Превью изображения" style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }} />;
  }

  if (isSvg) {
    return (
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        {body}
      </div>
    );
  }

  if (contentType.includes('html') || /<[^>]+>/.test(body)) {
    return (
      <iframe
        srcDoc={body}
        title="HTML Превью"
        style={{ width: '100%', height: '300px', border: '1px solid #ccc', marginTop: '10px' }}
      />
    );
  }

  return null;
};

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

  const { status, statusText, contentType = 'text/plain', headers = {} } = response;
  const body = typeof response.body === 'object'
    ? JSON.stringify(response.body, null, 2)
    : response.body;

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
              <li key={key}><strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}</li>
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
          overflow: 'auto',
          marginBottom: '10px'
        }}>
          {body}
        </pre>
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