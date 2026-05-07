import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import styles from './social.module.css';
import { redirect } from 'next/navigation';
import SearchUsers from './SearchUsers';
import FriendRequests from './FriendRequests';
import FriendsList from './FriendsList';
import Link from 'next/link';

export default async function SocialPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;

  // Ambil permintaan pertemanan yang diterima
  const pendingRequests = await prisma.friendRequest.findMany({
    where: {
      receiverId: userId,
      status: 'PENDING',
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  // Ambil daftar teman
  const friendships = await prisma.friendship.findMany({
    where: { userId },
    include: {
      friend: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return (
    <main className={styles.main}>
      <div className={styles.staticBackground}>
        <div className={styles.overlay}></div>
      </div>

      <div className={styles.contentContainer}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className="title">Sosial</h1>
            <Link href="/" className={styles.backBtn}>← Kembali ke Jurnal</Link>
          </div>
          <p className="subtitle">Temukan teman dan bagikan momen indahmu.</p>
        </header>

        <section className={styles.section}>
          <div className={styles.card}>
            <h2>Cari Teman</h2>
            <SearchUsers />
          </div>
        </section>

        {pendingRequests.length > 0 && (
          <section className={styles.section}>
            <div className={styles.card}>
              <h2>Permintaan Pertemanan</h2>
              <FriendRequests requests={pendingRequests} />
            </div>
          </section>
        )}

        <section className={styles.section}>
          <div className={styles.card}>
            <h2>Teman Saya</h2>
            <FriendsList friends={friendships.map(f => f.friend)} />
          </div>
        </section>
      </div>
    </main>
  );
}
