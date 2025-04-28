import React, { useEffect, useState } from 'react';
import ResSVG from './ResSVG';
import '../styles/Preview.scss';

const Preview = ({ body, contentType = '' }) => {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (!body) return;

    let url = null;

    if (body instanceof Blob || body instanceof ArrayBuffer) {
      url = URL.createObjectURL(
        body instanceof Blob ? body : new Blob([body], { type: contentType })
      );
    } else if (typeof body === 'string') {
      const isSvg = contentType.includes('svg+xml') || body.trim().startsWith('<svg');
      if (isSvg) {
        url = `data:image/svg+xml;utf8,${encodeURIComponent(body)}`;
      }
    }

    if (url) {
      setObjectUrl(url);
    } else {
      setObjectUrl(null);
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

  if (isSvg && typeof body === 'string') {
    return <ResSVG svgString={body} />;
  }

  if (isImage) {
    return (
      <img
        src={objectUrl || body}
        alt="Image Preview"
        className="aam_preview__image"
      />
    );
  }

  if (isHtml) {
    return (
      <iframe
        srcDoc={body}
        title="HTML Preview"
        className="aam_preview__iframe"
        sandbox="allow-scripts"
      />
    );
  }

  return (
    <pre className="aam_preview__pre">
      {typeof body === 'string' ? body : '[Неизвестный формат данных]'}
    </pre>
  );
};

export default Preview;
