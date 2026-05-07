'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

export async function register(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
      return { error: 'Semua field wajib diisi.' };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'Email sudah terdaftar.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return { success: 'Akun berhasil dibuat! Silakan login.' };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { error: 'Terjadi kesalahan saat pendaftaran.' };
  }
}

export async function login(formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Email atau password salah.' };
        default:
          return { error: 'Terjadi kesalahan saat login.' };
      }
    }
    throw error; // Rethrow redirect or other errors
  }
}

export async function logout() {
  await signOut({ redirectTo: '/login' });
}
