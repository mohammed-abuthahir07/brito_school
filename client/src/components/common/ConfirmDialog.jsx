import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import './ConfirmDialog.css';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  itemPreview = null,
  confirmText = 'Delete',
  confirmVariant = 'danger',
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="confirm-dialog-content">
        <p className="confirm-dialog-desc">{message}</p>
        {itemPreview && <div className="confirm-item-preview">{itemPreview}</div>}
      </div>
    </Modal>
  );
};
