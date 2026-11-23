import React, { useEffect, useState, useRef } from 'react';
import { adminService } from '../../services/adminService';
import { isAbortError } from '../../utils/userFacingError';
import { recordGalleryActivity } from '../../utils/galleryActivity';
import { API_BASE_URL } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  IconImage,
  IconPlus,
  IconEdit,
  IconTrash,
  IconRefresh,
} from '../../components/common/Icons';
import './GalleriesAdminPage.css';

const MAX_CAPACITY = 30;
const MAX_IMAGE_SIZE = 30 * 1024 * 1024; // 30 MB

export const GalleriesAdminPage = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete State
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef(null);

  const fetchGalleries = (signal) => {
    setLoading(true);
    adminService
      .getGalleries({ signal })
      .then((res) => {
        if (res.success && Array.isArray(res.galleries)) {
          setGalleries(res.galleries);
        } else {
          setGalleries([]);
        }
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setAlert({ type: 'danger', message: err.message || 'Failed to fetch galleries.' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchGalleries(controller.signal);
    return () => controller.abort();
  }, []);

  // Upload handling
  const openUploadModal = () => {
    if (galleries.length >= MAX_CAPACITY) {
      setAlert({
        type: 'warning',
        message: 'Maximum gallery capacity of 30 images reached. Please delete an older image before uploading a new one.',
      });
      return;
    }
    setTitle('');
    setDescription('');
    setImageFile(null);
    setPreviewUrl(null);
    setFileError('');
    setUploadModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size >= MAX_IMAGE_SIZE) {
      setFileError('Image size exceeds 30 MB. Please select a smaller photo.');
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }

    setFileError('');
    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFileError('Image title is required.');
      return;
    }
    if (!imageFile) {
      setFileError('Please select an image file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    if (description.trim()) {
      formData.append('description', description.trim());
    }
    formData.append('image', imageFile);

    if (uploading) return;
    setUploading(true);
    try {
      await adminService.uploadGallery(formData);
      recordGalleryActivity('upload');
      setAlert({ type: 'success', message: 'Gallery photograph uploaded successfully!' });
      setUploadModalOpen(false);
      fetchGalleries();
    } catch (err) {
      if (err.status === 409) {
        setFileError('Conflict: Maximum capacity of 30 images has already been reached.');
      } else {
        setFileError(err.message || 'Upload failed.');
      }
    } finally {
      setUploading(false);
    }
  };

  // Edit handling
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setAlert({ type: 'danger', message: 'Title is required for updating.' });
      return;
    }

    if (updating) return;
    setUpdating(true);
    try {
      await adminService.updateGallery(editingItem.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      recordGalleryActivity('update');
      setAlert({ type: 'success', message: 'Gallery details updated successfully.' });
      setEditModalOpen(false);
      fetchGalleries();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Update failed.' });
    } finally {
      setUpdating(false);
    }
  };

  // Delete handling
  const handleDelete = async () => {
    if (!deleteItem || deleting) return;
    setDeleting(true);
    try {
      await adminService.deleteGallery(deleteItem.id);
      recordGalleryActivity('delete');
      setAlert({ type: 'success', message: 'Gallery photograph deleted and removed from storage.' });
      setDeleteItem(null);
      fetchGalleries();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to delete gallery item.' });
    } finally {
      setDeleting(false);
    }
  };

  const isFull = galleries.length >= MAX_CAPACITY;
  const remaining = Math.max(0, MAX_CAPACITY - galleries.length);
  const percentUsed = Math.min(100, Math.round((galleries.length / MAX_CAPACITY) * 100));

  const getImageSrc = (item) => {
    const rawPath = item.image_path || item.file_url || '';
    if (rawPath.startsWith('http')) return rawPath;
    const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    return `${API_BASE_URL}${cleanPath}`;
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

      {/* 30 Image Capacity Tracker Card */}
      <div className="capacity-status-card">
        <div className="capacity-header">
          <div className="capacity-title">
            Gallery Storage Capacity: <strong>{galleries.length} / {MAX_CAPACITY} images</strong>
          </div>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: isFull ? 'var(--danger)' : 'var(--brown-700)' }}>
            {isFull ? 'Limit Reached (Delete older photos to upload)' : `${remaining} slots remaining`}
          </span>
        </div>

        <div className="capacity-bar-track">
          <div
            className={`capacity-bar-fill ${isFull ? 'full' : ''}`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Action Header */}
      <div className="admin-action-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <IconImage size={20} style={{ color: 'var(--brown-700)' }} />
          <span>Active Memories</span>
        </div>

        <div className="admin-action-buttons">
          <Button
            variant="outline"
            size="md"
            icon={<IconRefresh size={16} />}
            onClick={fetchGalleries}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<IconPlus size={16} />}
            onClick={openUploadModal}
            disabled={isFull}
          >
            {isFull ? 'Capacity Full (30/30)' : 'Upload Photograph'}
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading gallery items..." />
      ) : galleries.length === 0 ? (
        <EmptyState
          icon={<IconImage size={32} />}
          title="No Gallery Photographs Uploaded"
          description="Upload school event photographs to showcase sports tournaments, assemblies, and celebrations on the public site."
          action={
            <Button variant="primary" size="sm" onClick={openUploadModal}>
              Upload First Photograph
            </Button>
          }
        />
      ) : (
        <div className="gallery-admin-grid">
          {galleries.map((item) => (
            <article key={item.id} className="gallery-admin-card">
              <div className="gallery-admin-img-wrapper">
                <img
                  src={getImageSrc(item)}
                  alt={item.title}
                  className="gallery-admin-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="gallery-admin-card-body">
                <h3 className="gallery-admin-card-title">{item.title}</h3>
                <p className="gallery-admin-card-desc">
                  {item.description || 'No description provided.'}
                </p>
                <div className="gallery-admin-card-footer">
                  <button
                    type="button"
                    className="action-icon-btn edit"
                    onClick={() => openEditModal(item)}
                    title="Edit Title & Description"
                  >
                    <IconEdit size={16} />
                  </button>
                  <button
                    type="button"
                    className="action-icon-btn delete"
                    onClick={() => setDeleteItem(item)}
                    title="Delete Photograph"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Gallery Photograph (Max 30 MB)"
        footer={
          <>
            <Button variant="ghost" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUploadSubmit} loading={uploading}>
              Upload to Gallery
            </Button>
          </>
        }
      >
        <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {fileError && <Alert type="danger" message={fileError} />}

          <div className="form-group">
            <label htmlFor="galleryUploadTitle" className="form-label">
              Photograph Title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="galleryUploadTitle"
              type="text"
              className="form-input"
              placeholder="e.g. Annual Sports Day 2026 March-Past"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="galleryUploadDesc" className="form-label">
              Description (Optional)
            </label>
            <textarea
              id="galleryUploadDesc"
              rows="3"
              className="form-textarea"
              placeholder="e.g. Highlights of students receiving state championship trophies."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Select Photo File (JPEG, PNG, GIF, WEBP under 30 MB) <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div
              className="calendar-upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconImage size={28} style={{ color: 'var(--brown-600)' }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--brown-800)' }}>
                  Click here to browse image
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Max 30 MB. Accepted by backend.
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleImageChange}
              accept="image/*,.jpg,.jpeg,.png,.gif,.webp"
            />
            {previewUrl && (
              <div className="image-preview-box">
                <img src={previewUrl} alt="Upload preview" />
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Gallery Item Details"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditSubmit} loading={updating}>
              Update Details
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label htmlFor="editGalleryTitle" className="form-label">
              Title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="editGalleryTitle"
              type="text"
              className="form-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="editGalleryDesc" className="form-label">
              Description
            </label>
            <textarea
              id="editGalleryDesc"
              rows="3"
              className="form-textarea"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Photograph"
        message="Are you sure you want to permanently delete this photo? It will free up one slot in the 30-image capacity."
        itemPreview={deleteItem?.title}
        loading={deleting}
      />
    </div>
  );
};
