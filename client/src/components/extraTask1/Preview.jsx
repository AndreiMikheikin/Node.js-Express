import React, { useEffect, useState } from "react";

const Preview = ({ body, contentType = '' }) => {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (!body) return;

    let url = null;

    if (body instanceof Blob || body instanceof ArrayBuffer) {
      url = URL.createObjectURL(new Blob([body], { type: contentType }));
    } else if (typeof body === 'string') {
      const isSvg = contentType.includes('svg+xml') || body.trim().startsWith('<svg');
      if (isSvg) {
        // SVG как data URI
        url = `data:image/svg+xml;utf8,${encodeURIComponent(body)}`;
      }
    }

    if (url) {
      setObjectUrl(url);
    }

    return () => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [body, contentType]);

  if (!body) return null;

  const isImage = contentType.startsWith('image/') || (typeof body === 'string' && body.startsWith('data:image'));
  const isSvg = contentType.includes('svg+xml') || (typeof body === 'string' && body.trim().startsWith('<svg'));
  const isHtml = contentType.includes('html') || (typeof body === 'string' && /<[^>]+>/.test(body));

  if (isImage || isSvg) {
    return (
      <img
        src={objectUrl || body}
        alt="Image Preview"
        style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
      />
    );
  }

  if (isHtml) {
    return (
      <iframe
        srcDoc={body}
        title="HTML Preview"
        style={{ width: '100%', height: '300px', border: '1px solid #ccc', marginTop: '10px' }}
        sandbox="allow-scripts"
      />
    );
  }

  return null;
};

export default Preview;
