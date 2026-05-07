'use client';

import { useState } from 'react';
import { searchUsers, sendFriendRequest } from './actions';
import styles from './social.module.css';

export default function SearchUsers() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    const data = await searchUsers(query);
    if (data.users) {
      setResults(data.users);
    }
    setLoading(false);
  }

  async function handleAddFriend(userId: string) {
    setSentRequests(prev => [...prev, userId]);
    const result = await sendFriendRequest(userId);
    if (result.error) {
      alert(result.error);
      setSentRequests(prev => prev.filter(id => id !== userId));
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.actionBtn} disabled={loading}>
          {loading ? 'Cari...' : 'Cari'}
        </button>
      </form>

      <div className={styles.userList}>
        {results.map((user) => (
          <div key={user.id} className={styles.userItem}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div className={styles.userName}>{user.name}</div>
                <div className={styles.userEmail}>{user.email}</div>
              </div>
            </div>
            <button
              onClick={() => handleAddFriend(user.id)}
              disabled={sentRequests.includes(user.id)}
              className={styles.actionBtn}
            >
              {sentRequests.includes(user.id) ? 'Terkirim' : 'Tambah Teman'}
            </button>
          </div>
        ))}
        {query && results.length === 0 && !loading && (
          <p className={styles.emptyText}>Tidak ada pengguna ditemukan.</p>
        )}
      </div>
    </div>
  );
}
