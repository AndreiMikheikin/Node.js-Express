import React, { useMemo, useEffect } from "react";

const Preview = ({ body, contentType = '' }) => {
  if (!body || typeof body !== 'string') return null;

  const isImage = useMemo(() => (
    contentType.startsWith('image/') || body.startsWith('data:image')
  ), [contentType, body]);

  const isSvg = useMemo(() => (
    contentType.includes('svg+xml') || body.trim().startsWith('<svg')
  ), [contentType, body]);

  const svgUrl = useMemo(() => {
    if (isSvg) {
      const blob = new Blob([body], { type: 'image/svg+xml' });
      return URL.createObjectURL(blob);
    }
    return null;
  }, [body, isSvg]);

  // Очистка URL.createObjectURL после размонтирования
  useEffect(() => {
    return () => {
      if (svgUrl) {
        URL.revokeObjectURL(svgUrl);
      }
    };
  }, [svgUrl]);

  if (isImage && !isSvg) {
    return (
      <img
        src={body}
        alt="Превью изображения"
        style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
      />
    );
  }

  if (isSvg && svgUrl) {
    return (
      <img
        src={svgUrl}
        alt="SVG Превью"
        style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
      />
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

export default Preview;
