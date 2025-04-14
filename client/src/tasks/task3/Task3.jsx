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
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'downloaded_file';  // имя по умолчанию

        if (contentDisposition && contentDisposition.includes('filename=')) {
          filename = contentDisposition.split('filename=')[1].trim().replace(/["']/g, ''); // убираем кавычки
        }

        response.blob().then((blob) => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
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
