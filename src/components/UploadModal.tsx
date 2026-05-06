'use client';

import { useState, useRef } from 'react';
import { uploadMemory } from '@/app/actions';
import styles from './UploadModal.module.css';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // format YYYY-MM-DD
}

// Format date string to readable Indonesian date
function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function UploadModal({ isOpen, onClose, selectedDate }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) {
      setFile(dropped);
      setPreview(URL.createObjectURL(dropped));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedDate) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('date', selectedDate);
    formData.append('caption', caption);

    const result = await uploadMemory(formData);

    setIsUploading(false);

    if (result.success) {
      setFile(null);
      setPreview(null);
      setCaption('');
      onClose();
    } else {
      alert('Gagal mengupload foto: ' + result.error);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setCaption('');
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Tutup">
          &times;
        </button>

        <h2 className={styles.modalTitle}>Tambah Kenangan 📷</h2>
        <p className={styles.modalDate}>{formatDate(selectedDate)}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* File picker / drag-drop area */}
          {!preview ? (
            <div
              className={styles.filePicker}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => {}} // No longer need manual click, label handles it
            >
              <label 
                htmlFor="photo-upload"
                className={styles.filePickerLabel}
              >
                <span className={styles.filePickerIcon}>🖼️</span>
                <span className={styles.filePickerText}>
                  <span className={styles.filePickerTextBold}>Pilih foto</span>{' '}
                  atau seret ke sini
                </span>
                <span className={styles.filePickerText} style={{ fontSize: '0.78rem' }}>
                  JPG, PNG, WEBP
                </span>
              </label>
              <input
                id="photo-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.hiddenInput}
                required
              />
            </div>
          ) : (
            <div className={styles.previewWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className={styles.previewImg} />
            </div>
          )}

          {/* Change photo button when preview exists */}
          {preview && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-color)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                textAlign: 'left',
              }}
            >
              Ganti foto
            </button>
          )}
          <input
            ref={preview ? fileInputRef : undefined}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />

          {/* Caption */}
          <textarea
            placeholder="Tulis ceritamu hari ini... ✍️"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className={styles.caption}
            rows={3}
          />

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!file || isUploading}
          >
            {isUploading ? '⏳ Menyimpan...' : '💾 Simpan Kenangan'}
          </button>
        </form>
      </div>
    </div>
  );
}
