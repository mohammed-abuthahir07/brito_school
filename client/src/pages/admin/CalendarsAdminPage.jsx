import React, { useEffect, useState, useRef } from 'react';
import { adminService } from '../../services/adminService';
import { isAbortError } from '../../utils/userFacingError';
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

  const fetchCalendars = (signal) => {
    setLoading(true);
    adminService
      .getCalendars({ signal })
      .then((res) => {
        if (res.success && Array.isArray(res.calendars)) {
          setCalendars(res.calendars);
        } else {
          setCalendars([]);
        }
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setAlert({ type: 'danger', message: err.message || 'Failed to fetch calendars.' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchCalendars(controller.signal);
    return () => controller.abort();
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

    if (uploading) return;
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
    if (!deleteItem || deleting) return;
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

        <div className="admin-action-buttons">
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
        <div className="calendar-admin-list">
          {calendars.map((cal) => {
            const fileUrl = cal.file_url?.startsWith('http')
              ? cal.file_url
              : `${API_BASE_URL}${cal.file_url || `/uploads/calendars/${cal.file_path}`}`;
            const fileName = (cal.file_path || fileUrl || '').split('/').pop() || '';
            const ext = (fileName.split('.').pop() || 'FILE').toUpperCase();
            const typeLabel = ext === 'JPEG' ? 'JPG' : ext.slice(0, 4);
            const published = cal.created_at
              ? new Date(cal.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Date not recorded';

            return (
              <article key={cal.id} className="calendar-admin-card">
                <div className="calendar-admin-file-badge" aria-hidden="true">
                  <IconCalendar size={18} />
                  <span>{typeLabel}</span>
                </div>
                <div className="calendar-admin-body">
                  <h3 className="calendar-admin-title">{cal.title}</h3>
                  <p className="calendar-admin-desc">
                    {cal.description || 'Official academic calendar document for students and parents.'}
                  </p>
                  <div className="calendar-admin-meta">
                    <span>Published {published}</span>
                    <span>Downloadable file</span>
                  </div>
                </div>
                <div className="calendar-admin-actions">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    <IconExternalLink size={15} />
                    <span>View</span>
                  </a>
                  <a href={fileUrl} download className="btn btn-secondary btn-sm">
                    <IconDownload size={15} />
                    <span>Download</span>
                  </a>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setDeleteItem(cal)}
                  >
                    <IconTrash size={15} />
                    <span>Delete</span>
                  </button>
                </div>
              </article>
            );
          })}
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
