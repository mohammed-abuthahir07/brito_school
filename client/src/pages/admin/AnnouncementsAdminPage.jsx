import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  IconBell,
  IconPlus,
  IconEdit,
  IconTrash,
  IconRefresh,
} from '../../components/common/Icons';
import './AnnouncementsAdminPage.css';

const CATEGORIES = ['General', 'Academic', 'Events', 'Sports', 'Urgent'];

export const AnnouncementsAdminPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [search, setSearch] = useState('');

  // Form Modal State (Add or Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'General' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm State
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAnnouncements = () => {
    setLoading(true);
    adminService.getAnnouncements()
      .then((res) => {
        if (res.success && Array.isArray(res.announcements)) {
          setAnnouncements(res.announcements);
        } else {
          setAnnouncements([]);
        }
      })
      .catch((err) => {
        setAlert({ type: 'danger', message: err.message || 'Failed to fetch announcements.' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ title: '', content: '', category: 'General' });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category || 'General',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.content.trim()) errs.content = 'Content is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editingItem) {
        await adminService.updateAnnouncement(editingItem.id, formData);
        setAlert({ type: 'success', message: 'Announcement updated successfully!' });
      } else {
        await adminService.createAnnouncement(formData);
        setAlert({ type: 'success', message: 'Announcement created successfully! Public ticker updated.' });
      }
      setModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Operation failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await adminService.deleteAnnouncement(deleteItem.id);
      setAlert({ type: 'success', message: 'Announcement deleted successfully.' });
      setDeleteItem(null);
      fetchAnnouncements();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to delete announcement.' });
    } finally {
      setDeleting(false);
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(term) ||
      item.content?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term)
    );
  });

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
        <div className="search-filter-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, category, or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="md"
            icon={<IconRefresh size={16} />}
            onClick={fetchAnnouncements}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<IconPlus size={16} />}
            onClick={openAddModal}
          >
            New Announcement
          </Button>
        </div>
      </div>

      {/* Table / Empty State */}
      {loading ? (
        <LoadingSpinner text="Loading announcements..." />
      ) : filteredAnnouncements.length === 0 ? (
        <EmptyState
          icon={<IconBell size={32} />}
          title="No Announcements Found"
          description={
            search
              ? 'No announcements match your search term.'
              : 'There are currently no active school announcements.'
          }
          action={
            <Button variant="primary" size="sm" onClick={openAddModal}>
              Create First Announcement
            </Button>
          }
        />
      ) : (
        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Category</th>
                <th style={{ width: '30%' }}>Title</th>
                <th style={{ width: '35%' }}>Content Preview</th>
                <th style={{ width: '10%' }}>Date</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnnouncements.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="table-category-badge">{item.category || 'General'}</span>
                  </td>
                  <td>
                    <div className="table-title">{item.title}</div>
                  </td>
                  <td>
                    <div className="table-content-preview">{item.content}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="action-icon-btn edit"
                        onClick={() => openEditModal(item)}
                        aria-label="Edit announcement"
                      >
                        <IconEdit size={16} />
                      </button>
                      <button
                        type="button"
                        className="action-icon-btn delete"
                        onClick={() => setDeleteItem(item)}
                        aria-label="Delete announcement"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Announcement' : 'Publish New Announcement'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              {editingItem ? 'Save Changes' : 'Publish Announcement'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label htmlFor="announcementTitle" className="form-label">
              Title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="announcementTitle"
              type="text"
              className={`form-input ${formErrors.title ? 'error' : ''}`}
              placeholder="e.g. Annual Day Celebration 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            {formErrors.title && <span className="field-error-msg">{formErrors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="announcementCategory" className="form-label">
              Category
            </label>
            <select
              id="announcementCategory"
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="announcementContent" className="form-label">
              Content / Notice Text <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              id="announcementContent"
              rows="4"
              className={`form-textarea ${formErrors.content ? 'error' : ''}`}
              placeholder="Detailed announcement information to be displayed on ticker and listings..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
            {formErrors.content && <span className="field-error-msg">{formErrors.content}</span>}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? It will be immediately removed from the public scrolling ticker."
        itemPreview={deleteItem?.title}
        loading={deleting}
      />
    </div>
  );
};
