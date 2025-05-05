import React, { useMemo } from 'react';
import Preview from './Preview';
import '../styles/ResponseViewer.scss';

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

  return (
    <div className="aam_response">
      <h2 className="aam_response__title">Ответ от сервера</h2>

      <div className="aam_response__field"><strong>HTTP-статус:</strong> {status} {statusText}</div>
      <div className="aam_response__field"><strong>Content-Type:</strong> {contentType}</div>

      <div className="aam_response__headers">
        <strong>Заголовки ответа:</strong>
        {Object.keys(headers).length > 0 ? (
          <ul className="aam_response__headers-list">
            {Object.entries(headers).map(([key, value]) => (
              <li key={key} className="aam_response__headers-item">
                <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
              </li>
            ))}
          </ul>
        ) : (
          <p className="aam_response__text">Заголовки отсутствуют.</p>
        )}
      </div>

      <div className="aam_response__body">
        <strong>Тело ответа:</strong>
        {body ? (
          <pre className="aam_response__body-pre">
            {body}
          </pre>
        ) : (
          <p className="aam_response__text">Тело ответа пустое.</p>
        )}
        <Preview body={body} contentType={contentType} />
      </div>

      <button
        onClick={copyToClipboard}
        className="aam_response__copy-button"
      >
        Копировать ответ
      </button>
    </div>
  );
};

export default ResponseView;
