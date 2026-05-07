'use client';

import { useState } from 'react';
import { register } from '@/app/auth-actions';
import styles from '../login/login.module.css'; // Reusing login styles
import Link from 'next/link';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const result = await register(formData);
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.success);
    }
    setLoading(false);
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Daftar</h1>
          <p>Mulai simpan kenanganmu bersama teman-teman</p>
        </div>

        {success ? (
          <div className={styles.successContainer}>
            <div className={styles.successMessage}>{success}</div>
            <Link href="/login" className={styles.button}>Ke Halaman Login</Link>
          </div>
        ) : (
          <form action={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="name">Nama Lengkap</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Nama Anda"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="nama@email.com"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>
        )}

        {!success && (
          <div className={styles.footer}>
            Sudah punya akun? <Link href="/login">Masuk</Link>
          </div>
        )}
      </div>
    </main>
  );
}
