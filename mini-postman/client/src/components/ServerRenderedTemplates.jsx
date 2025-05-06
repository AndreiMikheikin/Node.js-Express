import React, { useEffect, useState, useCallback } from 'react';

const ServerRenderedTemplates = ({ onSelect, onDelete }) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    let isMounted = true;

    fetch('/api/miniPostman/templates')
      .then(res => res.text())
      .then(htmlText => {
        if (isMounted) setHtml(htmlText);
      })
      .catch(err => console.error('Ошибка при загрузке шаблонов:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleClick = useCallback((event) => {
    const deleteButton = event.target.closest('.aam_config-list__button--delete');
    const selectButton = event.target.closest('.aam_config-list__button--select');

    if (deleteButton && onDelete) {
      const configId = deleteButton.dataset.id;
      if (configId) onDelete(configId);
    }

    if (selectButton && onSelect) {
      const config = selectButton.dataset.config;
      try {
        if (config) onSelect(JSON.parse(config));
      } catch (e) {
        console.error('Ошибка парсинга конфигурации:', e);
      }
    }
  }, [onDelete, onSelect]);

  return (
    <div
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default React.memo(ServerRenderedTemplates);