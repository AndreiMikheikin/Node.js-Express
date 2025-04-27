import React, { useMemo, useEffect, useState } from "react";

const Preview = ({ body, contentType = '' }) => {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const preview = useMemo(() => {
    if (!body) return null;

    // Handle binary data cases
    if (body instanceof Blob || body instanceof ArrayBuffer) {
      const url = URL.createObjectURL(new Blob([body], { type: contentType }));
      setObjectUrl(url);
      return (
        <img
          src={url}
          alt="File preview"
          style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
        />
      );
    }

    // Handle string-based content
    if (typeof body === 'string') {
      const isImage = contentType.startsWith('image/') || body.startsWith('data:image');
      const isSvg = contentType.includes('svg+xml') || body.trim().startsWith('<svg');
      const isHtml = contentType.includes('html') || /<[^>]+>/.test(body);

      if (isImage && !isSvg) {
        return (
          <img
            src={body}
            alt="Image Превью"
            style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
          />
        );
      }

      if (isSvg) {
        const url = URL.createObjectURL(new Blob([body], { type: 'image/svg+xml' }));
        setObjectUrl(url);
        return (
          <img
            src={url}
            alt="SVG Превью"
            style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
          />
        );
      }

      if (isHtml) {
        return (
          <iframe
            srcDoc={body}
            title="HTML Превью"
            style={{ width: '100%', height: '300px', border: '1px solid #ccc', marginTop: '10px' }}
            sandbox="allow-same-origin"
          />
        );
      }
    }

    return null;
  }, [body, contentType]);

  return preview;
};

export default Preview;