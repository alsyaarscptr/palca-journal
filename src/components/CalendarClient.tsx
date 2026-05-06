'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '@/app/page.module.css';
import UploadModal from './UploadModal';
import { deleteMemory, updateMemory } from '@/app/actions';

interface Memory {
  id: string;
  date: Date;
  imageUrl: string;
  caption: string | null;
}

interface CalendarClientProps {
  memories: Memory[];
}

// Indonesian month & day names
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// ──────────────────────────────────────────────────────────────
// View Memory Modal
// ──────────────────────────────────────────────────────────────
function ViewMemoryModal({
  memory,
  onClose,
}: {
  memory: Memory;
  onClose: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(memory.caption || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const dateLabel = new Date(memory.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleDelete = async () => {
    if (!confirm('Apakah kamu yakin ingin menghapus kenangan ini?')) return;
    
    setIsDeleting(true);
    const result = await deleteMemory(memory.id);
    setIsDeleting(false);

    if (result.success) {
      onClose();
    } else {
      alert('Gagal menghapus: ' + result.error);
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    const result = await updateMemory(memory.id, editedCaption);
    setIsSaving(false);

    if (result.success) {
      setIsEditing(false);
    } else {
      alert('Gagal mengupdate: ' + result.error);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.viewModalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>

        {/* Polaroid card */}
        <div className={styles.polaroidCard}>
          <div className={styles.polaroidImageWrap}>
            <Image
              src={memory.imageUrl}
              alt={memory.caption || 'Kenangan'}
              fill
              style={{ objectFit: 'cover' }}
              sizes="420px"
              priority
            />
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea
                className={styles.editTextarea}
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                placeholder="Tulis ceritamu..."
              />
              <div className={styles.editActions}>
                <button 
                  className={styles.cancelBtn} 
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Batal
                </button>
                <button 
                  className={styles.saveBtn} 
                  onClick={handleUpdate}
                  disabled={isSaving}
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {memory.caption && (
                <p className={styles.polaroidCaption}>{memory.caption}</p>
              )}
              <p className={styles.polaroidDate}>{dateLabel}</p>

              {/* Edit/Delete Actions */}
              <div className={styles.modalActions}>
                <button 
                  className={`${styles.actionBtn} ${styles.editBtn}`}
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Edit Teks
                </button>
                <button 
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Menghapus...' : '🗑️ Hapus'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


// ──────────────────────────────────────────────────────────────
// Main CalendarClient
// ──────────────────────────────────────────────────────────────
export default function CalendarClient({ memories }: CalendarClientProps) {
  const [viewYear, setViewYear] = useState(2026); 
  const [viewMonth, setViewMonth] = useState(4); // Mei (0-indexed)

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewingMemory, setViewingMemory] = useState<Memory | null>(null);

  // Initialize date only on client to avoid hydration mismatch
  useEffect(() => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    console.log('--- Client Hydration Complete ---');
  }, []);

  // ── Helpers ──────────────────────────────────────────────────
  const getMemoryForDate = (year: number, month: number, day: number) => {
    return memories.find((m) => {
      const d = new Date(m.date);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // 0=Sun, 1=Mon, ... getDay() of the 1st of the month
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // ── Navigation ───────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      viewYear === today.getFullYear() &&
      viewMonth === today.getMonth() &&
      day === today.getDate()
    );
  };

  // ── Click handlers ───────────────────────────────────────────
  const handleDayClick = (day: number) => {
    const memory = getMemoryForDate(viewYear, viewMonth, day);
    if (memory) {
      setViewingMemory(memory);
    } else {
      const mm = String(viewMonth + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      setSelectedDateStr(`${viewYear}-${mm}-${dd}`);
      setIsUploadOpen(true);
    }
  };

  // ── Calendar grid cells ──────────────────────────────────────
  // Leading empty cells so day 1 lands on the right column
  const leadingBlanks = Array.from({ length: firstDayOfWeek });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <>
      {/* ── Calendar Card ─────────────────────────────────── */}
      <div className={styles.calendarCard}>
        {/* Header */}
        <div className={styles.calendarHeader}>
          <button className={styles.navBtn} onClick={prevMonth} aria-label="Bulan sebelumnya">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div className={styles.monthWrapper}>
            <div className={styles.leafIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a38d7d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2zm0 0l-2 2"></path></svg>
            </div>
            <h2 className={styles.calendarTitle}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h2>
            <div className={`${styles.leafIcon} ${styles.leafFlipped}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a38d7d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2zm0 0l-2 2"></path></svg>
            </div>
          </div>
          <button className={styles.navBtn} onClick={nextMonth} aria-label="Bulan berikutnya">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        {/* Day-name row */}
        <div className={styles.calendarGrid}>
          {DAY_NAMES.map((d) => (
            <div key={d} className={styles.dayName}>
              {d}
            </div>
          ))}

          {/* Leading blank cells */}
          {leadingBlanks.map((_, i) => (
            <div key={`blank-${i}`} className={styles.dayCellBlank} />
          ))}

          {/* Day cells */}
          {days.map((day) => {
            const memory = getMemoryForDate(viewYear, viewMonth, day);
            const today_ = isToday(day);

            return (
              <button
                key={day}
                type="button"
                id={`day-${viewYear}-${viewMonth + 1}-${day}`}
                className={[
                  styles.dayCell,
                  memory ? styles.dayCellFilled : '',
                  today_ ? styles.dayCellToday : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleDayClick(day)}
                aria-label={
                  memory
                    ? `Lihat kenangan ${day} ${MONTH_NAMES[viewMonth]} ${viewYear}`
                    : `Tambah kenangan ${day} ${MONTH_NAMES[viewMonth]} ${viewYear}`
                }
              >
                <span className={styles.dateNumber}>{day}</span>

                {memory && (
                  <div
                    className={styles.photoIndicator}
                    style={{ backgroundImage: `url(${memory.imageUrl})` }}
                  />
                )}

                <span className={styles.cellPlus}>+</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className={styles.calendarLegend}>
          <div className={styles.legendBoxMemory} />
          <span>Ada kenangan</span>
          <div className={styles.legendBoxToday} />
          <span>Hari ini</span>
        </div>
      </div>

      {/* ── Upload Modal ───────────────────────────────────── */}
      {isUploadOpen && (
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          selectedDate={selectedDateStr || ''}
        />
      )}

      {/* ── View Memory Modal ──────────────────────────────── */}
      {viewingMemory && (
        <ViewMemoryModal
          memory={viewingMemory}
          onClose={() => setViewingMemory(null)}
        />
      )}
    </>
  );
}
