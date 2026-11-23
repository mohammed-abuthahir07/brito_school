import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  IconBookOpen,
  IconPlus,
  IconEdit,
  IconTrash,
  IconRefresh,
} from '../../components/common/Icons';
import './ThirukkuralAdminPage.css';

export const ThirukkuralAdminPage = () => {
  const [kurals, setKurals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [search, setSearch] = useState('');

  // Modal State (Add or Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    kural_number: '',
    tamil_text: '',
    english_meaning: '',
    explanation: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchKurals = () => {
    setLoading(true);
    adminService.getKurals()
      .then((res) => {
        if (res.success && Array.isArray(res.kurals)) {
          setKurals(res.kurals);
        } else {
          setKurals([]);
        }
      })
      .catch((err) => {
        setAlert({ type: 'danger', message: err.message || 'Failed to fetch Thirukkural records.' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchKurals();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      kural_number: '',
      tamil_text: '',
      english_meaning: '',
      explanation: '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      kural_number: item.kural_number || '',
      tamil_text: item.tamil_text || '',
      english_meaning: item.english_meaning || '',
      explanation: item.explanation || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.kural_number || isNaN(formData.kural_number) || Number(formData.kural_number) <= 0) {
      errs.kural_number = 'A valid positive Kural Number (1-1330) is required.';
    }
    if (!formData.tamil_text.trim()) {
      errs.tamil_text = 'Tamil verse text is required.';
    }
    if (!formData.english_meaning.trim()) {
      errs.english_meaning = 'English translation meaning is required.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        kural_number: Number(formData.kural_number),
        tamil_text: formData.tamil_text.trim(),
        english_meaning: formData.english_meaning.trim(),
        explanation: formData.explanation.trim() || undefined,
      };

      if (editingItem) {
        await adminService.updateKural(editingItem.id, payload);
        setAlert({ type: 'success', message: 'Thirukkural updated successfully!' });
      } else {
        await adminService.publishKural(payload);
        setAlert({ type: 'success', message: 'Daily Thirukkural published successfully! Live on public site.' });
      }
      setModalOpen(false);
      fetchKurals();
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
      await adminService.deleteKural(deleteItem.id);
      setAlert({ type: 'success', message: 'Thirukkural deleted successfully.' });
      setDeleteItem(null);
      fetchKurals();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to delete Thirukkural.' });
    } finally {
      setDeleting(false);
    }
  };

  const filteredKurals = kurals.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.kural_number?.toString().includes(term) ||
      item.tamil_text?.toLowerCase().includes(term) ||
      item.english_meaning?.toLowerCase().includes(term) ||
      item.explanation?.toLowerCase().includes(term)
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
            placeholder="Search by Kural number, Tamil text, or meaning..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="md"
            icon={<IconRefresh size={16} />}
            onClick={fetchKurals}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<IconPlus size={16} />}
            onClick={openAddModal}
          >
            Publish Daily Kural
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading Thirukkural literature records..." />
      ) : filteredKurals.length === 0 ? (
        <EmptyState
          icon={<IconBookOpen size={32} />}
          title="No Thirukkural Verses Found"
          description={
            search
              ? 'No verses match your search criteria.'
              : 'Publish the daily Thirukkural verse to display on the public website for students and visitors.'
          }
          action={
            <Button variant="primary" size="sm" onClick={openAddModal}>
              Publish First Kural
            </Button>
          }
        />
      ) : (
        <div>
          {filteredKurals.map((k) => (
            <article key={k.id} className="kural-card-admin">
              <div className="kural-admin-header">
                <span className="kural-number-badge">குறள் #{k.kural_number}</span>
                <div className="table-actions">
                  <button
                    type="button"
                    className="action-icon-btn edit"
                    onClick={() => openEditModal(k)}
                    title="Edit Kural"
                  >
                    <IconEdit size={16} />
                  </button>
                  <button
                    type="button"
                    className="action-icon-btn delete"
                    onClick={() => setDeleteItem(k)}
                    title="Delete Kural"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>

              <div className="kural-tamil-display">{k.tamil_text}</div>

              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--brown-700)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  English Meaning
                </div>
                <div className="kural-meaning-display">{k.english_meaning}</div>
              </div>

              {k.explanation && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--brown-700)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    Explanation • விளக்கம்
                  </div>
                  <div className="kural-explanation-display">{k.explanation}</div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Thirukkural Verse' : 'Publish Daily Thirukkural'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              {editingItem ? 'Save Changes' : 'Publish Verse'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label htmlFor="kuralNumberInput" className="form-label">
              Kural Number (1 - 1330) <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="kuralNumberInput"
              type="number"
              min="1"
              max="1330"
              className={`form-input ${formErrors.kural_number ? 'error' : ''}`}
              placeholder="e.g. 1"
              value={formData.kural_number}
              onChange={(e) => setFormData({ ...formData, kural_number: e.target.value })}
              required
            />
            {formErrors.kural_number && <span className="field-error-msg">{formErrors.kural_number}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="kuralTamilTextInput" className="form-label">
              Tamil Verse Text (2 Lines) <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              id="kuralTamilTextInput"
              rows="3"
              className={`form-textarea font-tamil ${formErrors.tamil_text ? 'error' : ''}`}
              placeholder="அகர முதல எழுத்தெல்லாம் ஆதி&#10;பகவன் முதற்றே உலகு."
              value={formData.tamil_text}
              onChange={(e) => setFormData({ ...formData, tamil_text: e.target.value })}
              required
            />
            {formErrors.tamil_text && <span className="field-error-msg">{formErrors.tamil_text}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="kuralEnglishInput" className="form-label">
              English Meaning / Translation <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              id="kuralEnglishInput"
              rows="2"
              className={`form-textarea ${formErrors.english_meaning ? 'error' : ''}`}
              placeholder="As the letter A is the first of all letters, so the eternal God is first in the world."
              value={formData.english_meaning}
              onChange={(e) => setFormData({ ...formData, english_meaning: e.target.value })}
              required
            />
            {formErrors.english_meaning && <span className="field-error-msg">{formErrors.english_meaning}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="kuralExplanationInput" className="form-label">
              Explanation / Commentary (Optional)
            </label>
            <textarea
              id="kuralExplanationInput"
              rows="3"
              className="form-textarea"
              placeholder="Commentary on the moral, spiritual, or ethical principle conveyed by the verse..."
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Thirukkural Verse"
        message="Are you sure you want to delete this Thirukkural record?"
        itemPreview={`குறள் #${deleteItem?.kural_number}`}
        loading={deleting}
      />
    </div>
  );
};
