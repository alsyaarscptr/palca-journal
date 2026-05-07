'use client';

import styles from './social.module.css';
import Link from 'next/link';

export default function FriendsList({ friends }: { friends: any[] }) {
  if (friends.length === 0) {
    return <p className={styles.emptyText}>Anda belum memiliki teman.</p>;
  }

  return (
    <div className={styles.userList}>
      {friends.map((friend) => (
        <div key={friend.id} className={styles.userItem}>
          <Link href={`/user/${friend.id}`} className={styles.userInfo} style={{ textDecoration: 'none' }}>
            <div className={styles.userAvatar}>
              {friend.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className={styles.userName}>{friend.name}</div>
              <div className={styles.userEmail}>{friend.email}</div>
            </div>
          </Link>
          <span className={styles.friendBadge}>Berteman</span>
        </div>
      ))}
    </div>
  );
}
