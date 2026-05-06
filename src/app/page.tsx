import prisma from '@/lib/prisma';
import styles from './page.module.css';
import CalendarClient from '@/components/CalendarClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Ambil semua memori untuk ditampilkan di kalender
  const memories = await prisma.memory.findMany({
    orderBy: { date: 'asc' },
  });

  // Ambil foto terakhir yang diupload untuk dijadikan background
  const latestMemory = memories.length > 0 ? memories[memories.length - 1] : null;
  const backgroundImageUrl = latestMemory?.imageUrl || null;

  return (
    <main className={styles.main}>
      {/* Aesthetic Background */}
      <div className={styles.staticBackground}>
        <div className={styles.overlay}></div>
      </div>

      {/* Konten Utama */}
      <div className={styles.contentContainer}>
        <header className={styles.header}>
          <h1 className="title">Jurnal Kenangan</h1>
          <p className="subtitle">Simpan momen indahmu setiap hari, satu demi satu.</p>
        </header>

        <section className={styles.calendarSection}>
          <CalendarClient memories={memories} />
        </section>
      </div>
    </main>
  );
}
