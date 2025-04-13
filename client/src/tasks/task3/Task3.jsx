import React from 'react';

const Task3 = () => {
  const handleDownload = (format) => {
    fetch('/api/task3/download', {
      method: 'GET',
      headers: {
        'Accept': format,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Ошибка загрузки файла');
        }
        const filename = response.headers.get('Content-Disposition').split('filename=')[1];
        response.blob().then((blob) => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename; // Даем файл имя из заголовка
          link.click();
        });
      })
      .catch((error) => {
        console.error('Ошибка при скачивании:', error);
      });
  };

  return (
    <div>
      <h2>Скачайте статистику в разных форматах:</h2>
      <button onClick={() => handleDownload('application/json')}>Скачать в формате JSON</button>
      <button onClick={() => handleDownload('application/xml')}>Скачать в формате XML</button>
      <button onClick={() => handleDownload('text/html')}>Скачать в формате HTML</button>
    </div>
  );
};

export default Task3;
