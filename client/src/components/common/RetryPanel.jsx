import React from 'react';
import { Button } from './Button';
import { Alert } from './Alert';

export const RetryPanel = ({
  title = 'Unable to load this section',
  message,
  onRetry,
  retryLabel = 'Try again',
}) => (
  <div className="retry-panel" style={{ padding: '0.25rem 0 0.5rem' }}>
    <Alert type="danger" title={title} message={message} />
    {onRetry && (
      <Button type="button" variant="primary" size="sm" onClick={onRetry}>
        {retryLabel}
      </Button>
    )}
  </div>
);
