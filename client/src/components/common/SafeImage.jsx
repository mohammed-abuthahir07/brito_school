import React, { useState } from 'react';

export const SafeImage = ({ alt = '', className = '', onError, ...props }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`safe-image-fallback ${className}`.trim()} role="img" aria-label={alt || 'Image unavailable'}>
        Photo unavailable
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className={className}
      {...props}
      onError={(event) => {
        setFailed(true);
        if (typeof onError === 'function') onError(event);
      }}
    />
  );
};
