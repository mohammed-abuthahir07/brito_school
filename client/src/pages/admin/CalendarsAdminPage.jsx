import React, { useEffect, useState, useRef } from 'react';
import { adminService } from '../../services/adminService';
import { API_BASE_URL } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  IconCalendar,
  IconPlus,
  IconTrash,
  IconDownload,
  IconExternalLink,
  IconRefresh,
} from '../../components/common/Icons';
import './CalendarsAdminPage.css';

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB

export const CalendarsAdminPage = () => {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Upload Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Delete State
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef(null);

  const fetchCalendars = () => {
    setLoading(true);
    adminService.getCalendars()
      .then((res) => {
        if (res.success && Array.isArray(res.calendars)) {
          setCalendars(res.calendars);
        } else {
          setCalendars([]);
        }
      })
      .catch((err) => {
        setAlert({ type: 'danger', message: err.message || 'Failed to fetch calendars.' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  const openUploadModal = () => {
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setFileError('');
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size >= MAX_FILE_SIZE) {
      setFileError('File size exceeds the 30 MB maximum allowed restriction.');
      setSelectedFile(null);
      return;
    }

    setFileError('');
    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFileError('Please enter a title for the calendar.');
      return;
    }
    if (!selectedFile) {
      setFileError('Please select a calendar file (PDF, JPG, PNG, etc. up to 30 MB).');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    if (description.trim()) {
      formData.append('description', description.trim());
    }
    formData.append('file', selectedFile);

    setUploading(true);
    try {
      await adminService.uploadCalendar(formData);
      setAlert({ type: 'success', message: 'Calendar file uploaded successfully!' });
      setModalOpen(false);
      fetchCalendars();
    } catch (err) {
      setFileError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await adminService.deleteCalendar(deleteItem.id);
      setAlert({ type: 'success', message: 'Calendar deleted successfully from storage.' });
      setDeleteItem(null);
      fetchCalendars();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to delete calendar.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-page-container">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Action Header */}
      <div className="admin-action-bar">
        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--brown-900)' }}>
          Total Published Calendars: <strong>{calendars.length}</strong>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="md"
            icon={<IconRefresh size={16} />}
            onClick={fetchCalendars}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<IconPlus size={16} />}
            onClick={openUploadModal}
          >
            Upload Calendar
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading calendars..." />
      ) : calendars.length === 0 ? (
        <EmptyState
          icon={<IconCalendar size={32} />}
          title="No Calendars Uploaded"
          description="Upload an academic calendar (PDF, image, or document up to 30 MB) to allow parents and students to download it."
          action={
            <Button variant="primary" size="sm" onClick={openUploadModal}>
              Upload First Calendar
            </Button>
          }
        />
      ) : (
        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Calendar Title</th>
                <th style={{ width: '35%' }}>Description</th>
                <th style={{ width: '15%' }}>Upload Date</th>
                <th style={{ width: '20%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {calendars.map((cal) => {
                const fileUrl = cal.file_url?.startsWith('http')
                  ? cal.file_url
                  : `${API_BASE_URL}${cal.file_url || `/uploads/calendars/${cal.file_path}`}`;

                return (
                  <tr key={cal.id}>
                    <td>
                      <div className="table-title">{cal.title}</div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {cal.file_path ? cal.file_path.split('/').pop() : 'Attached document'}
                      </span>
                    </td>
                    <td>
                      <div className="table-content-preview">
                        {cal.description || '—'}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {cal.created_at
                          ? new Date(cal.created_at).toLocaleDateString('en-IN')
                          : '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-icon-btn edit"
                          title="Open Calendar File in New Tab"
                        >
                          <IconExternalLink size={16} />
                        </a>
                        <a
                          href={fileUrl}
                          download
                          className="action-icon-btn edit"
                          title="Download Calendar File"
                        >
                          <IconDownload size={16} />
                        </a>
                        <button
                          type="button"
                          className="action-icon-btn delete"
                          onClick={() => setDeleteItem(cal)}
                          title="Delete Calendar"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Calendar Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Upload Academic Calendar Schedule"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUploadSubmit} loading={uploading}>
              Upload File
            </Button>
          </>
        }
      >
        <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {fileError && <Alert type="danger" message={fileError} />}

          <div className="form-group">
            <label htmlFor="calendarUploadTitle" className="form-label">
              Calendar Title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="calendarUploadTitle"
              type="text"
              className="form-input"
              placeholder="e.g. Academic Calendar 2026-27"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="calendarUploadDesc" className="form-label">
              Description (Optional)
            </label>
            <textarea
              id="calendarUploadDesc"
              rows="3"
              className="form-textarea"
              placeholder="e.g. Schedule of terms, mid-term examinations, and festival holidays."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Select Calendar Document / PDF / Image (Max 30 MB) <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div
              className="calendar-upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconDownload size={28} style={{ color: 'var(--brown-600)' }} />
              {selectedFile ? (
                <div>
                  <div className="calendar-file-name">{selectedFile.name}</div>
                  <div className="calendar-file-size">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--brown-800)' }}>
                    Click here to browse file
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    PDF, JPG, PNG, WEBP (under 30 MB)
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Academic Calendar"
        message="Are you sure you want to permanently delete this calendar? The uploaded document will be unlinked from storage."
        itemPreview={deleteItem?.title}
        loading={deleting}
      />
    </div>
  );
};
