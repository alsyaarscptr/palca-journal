import prisma from '@/lib/prisma';
import styles from './page.module.css';
import CalendarClient from '@/components/CalendarClient';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/app/auth-actions';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Ambil semua memori MILIK USER untuk ditampilkan di kalender
  const memories = await prisma.memory.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: { date: 'asc' },
  });

  // Ambil foto terakhir yang diupload untuk dijadikan background
  const latestMemory = memories.length > 0 ? memories[memories.length - 1] : null;
  const backgroundImageUrl = latestMemory?.imageUrl || null;

  return (
    <main className={styles.main}>
      {/* Aesthetic Background */}
      <div 
        className={styles.staticBackground}
        style={backgroundImageUrl ? { backgroundImage: `url(${backgroundImageUrl})` } : {}}
      >
        <div className={styles.overlay}></div>
      </div>

      {/* Konten Utama */}
      <div className={styles.contentContainer}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className="title">Jurnal Kenangan</h1>
            <div className={styles.userMenu}>
              <Link href="/social" className={styles.socialLink}>Sosial</Link>
              <span>Halo, {session.user.name}</span>
              <form action={logout}>
                <button type="submit" className={styles.logoutBtn}>Keluar</button>
              </form>
            </div>
          </div>
          <p className="subtitle">Simpan momen indahmu setiap hari, satu demi satu.</p>
        </header>

        <section className={styles.calendarSection}>
          <CalendarClient memories={memories} />
        </section>
      </div>
    </main>
  );
}
