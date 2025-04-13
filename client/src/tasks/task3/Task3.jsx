import React, { useState } from 'react';

const Task3 = () => {
  const [loading, setLoading] = useState({
    json: false,
    xml: false,
    html: false
  });
  const [message, setMessage] = useState('');

  const handleDownload = async (format) => {
    setLoading(prev => ({ ...prev, [format]: true }));
    setMessage('');

    try {
      const response = await fetch(`/api/task1/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Получаем blob и создаем ссылку для скачивания
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statistics.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setMessage(`Статистика экспортирована в ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      setMessage(`Ошибка при экспорте: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [format]: false }));
    }
  };

  return (
    <div className="task3-container">
      <h2>Экспорт статистики голосования</h2>
      
      <div className="export-buttons">
        <button
          onClick={() => handleDownload('json')}
          disabled={loading.json}
          className={`export-button ${loading.json ? 'loading' : ''}`}
        >
          {loading.json ? 'Загрузка...' : 'Скачать JSON'}
        </button>

        <button
          onClick={() => handleDownload('xml')}
          disabled={loading.xml}
          className={`export-button ${loading.xml ? 'loading' : ''}`}
        >
          {loading.xml ? 'Загрузка...' : 'Скачать XML'}
        </button>

        <button
          onClick={() => handleDownload('html')}
          disabled={loading.html}
          className={`export-button ${loading.html ? 'loading' : ''}`}
        >
          {loading.html ? 'Загрузка...' : 'Скачать HTML'}
        </button>
      </div>

      {message && <div className={`message ${message.includes('Ошибка') ? 'error' : 'success'}`}>{message}</div>}
      
    </div>
  );
};

export default Task3;