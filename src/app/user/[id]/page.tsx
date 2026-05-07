import prisma from '@/lib/prisma';
import styles from '../../page.module.css';
import CalendarClient from '@/components/CalendarClient';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function FriendJournalPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { id: friendId } = await params;

  // Cek apakah user adalah teman dari friendId
  const friendship = await prisma.friendship.findFirst({
    where: {
      userId: session.user.id,
      friendId: friendId,
    },
  });

  if (!friendship && friendId !== session.user.id) {
    // Jika bukan teman dan bukan diri sendiri, jangan izinkan
    return (
      <main className={styles.main}>
        <div className={styles.contentContainer}>
          <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>Akses Ditolak 🔒</h2>
            <p>Anda hanya bisa melihat jurnal orang yang sudah menjadi teman Anda.</p>
            <Link href="/social" className={styles.socialLink} style={{ display: 'inline-block', marginTop: '1rem' }}>Kembali ke Sosial</Link>
          </div>
        </div>
      </main>
    );
  }

  const friend = await prisma.user.findUnique({
    where: { id: friendId },
  });

  if (!friend) notFound();

  // Ambil semua memori MILIK TEMAN
  const memories = await prisma.memory.findMany({
    where: {
      userId: friendId,
    },
    orderBy: { date: 'asc' },
  });

  const latestMemory = memories.length > 0 ? memories[memories.length - 1] : null;
  const backgroundImageUrl = latestMemory?.imageUrl || null;

  return (
    <main className={styles.main}>
      <div 
        className={styles.staticBackground}
        style={backgroundImageUrl ? { backgroundImage: `url(${backgroundImageUrl})` } : {}}
      >
        <div className={styles.overlay}></div>
      </div>

      <div className={styles.contentContainer}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className="title">Jurnal {friend.name}</h1>
            <Link href="/social" className={styles.socialLink}>← Kembali ke Sosial</Link>
          </div>
          <p className="subtitle">Melihat momen indah dari {friend.name}.</p>
        </header>

        <section className={styles.calendarSection}>
          {/* Kita gunakan CalendarClient tapi pastikan dia readonly jika bukan pemilik? */}
          {/* Untuk saat ini, user bisa melihat tapi tombol upload mungkin harus disembunyikan di CalendarClient jika bukan pemilik */}
          <CalendarClient memories={memories} isReadOnly={friendId !== session.user.id} />
        </section>
      </div>
    </main>
  );
}
