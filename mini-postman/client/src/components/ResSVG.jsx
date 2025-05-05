import React from 'react';

const ResSVG = ({ svgString }) => {
  if (!svgString) return null;

  return (
    <div
      style={{
        display: 'inline-block',
        maxWidth: '100%',
        maxHeight: '300px',
        overflow: 'auto',
        marginTop: '10px',
        borderRadius: '8px',
        border: '1px solid #ccc',
      }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};

export default ResSVG;
