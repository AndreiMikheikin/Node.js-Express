import { useEffect, useRef } from 'react';

const ServerRenderedTemplates = ({ onSelect, onDelete }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
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
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('click', handleClick);
    }

    fetch('/api/miniPostman/templates')
      .then(res => res.text())
      .then(html => {
        if (container) {
          container.innerHTML = html;
        }
      })
      .catch(err => console.error('Ошибка при загрузке шаблонов:', err));

    return () => {
      if (container) {
        container.removeEventListener('click', handleClick);
      }
    };
  }, [onSelect, onDelete]);

  return <div ref={containerRef} />;
};

export default ServerRenderedTemplates;