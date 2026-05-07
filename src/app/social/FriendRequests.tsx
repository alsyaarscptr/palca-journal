'use client';

import { acceptFriendRequest } from './actions';
import styles from './social.module.css';
import { useState } from 'react';

export default function FriendRequests({ requests }: { requests: any[] }) {
  const [localRequests, setLocalRequests] = useState(requests);

  async function handleAccept(requestId: string) {
    const result = await acceptFriendRequest(requestId);
    if (result.success) {
      setLocalRequests(prev => prev.filter(r => r.id !== requestId));
    } else {
      alert(result.error);
    }
  }

  return (
    <div className={styles.userList}>
      {localRequests.map((req) => (
        <div key={req.id} className={styles.userItem}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {req.sender.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className={styles.userName}>{req.sender.name}</div>
              <div className={styles.userEmail}>{req.sender.email}</div>
            </div>
          </div>
          <button
            onClick={() => handleAccept(req.id)}
            className={styles.actionBtn}
          >
            Terima
          </button>
        </div>
      ))}
    </div>
  );
}
