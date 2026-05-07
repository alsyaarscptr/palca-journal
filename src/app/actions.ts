'use server';

import prisma from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function uploadMemory(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Anda harus login untuk mengupload memori.');
    }

    const file = formData.get('file') as File;
    const dateStr = formData.get('date') as string;
    const caption = formData.get('caption') as string;

    if (!file || !dateStr) {
      throw new Error('File dan tanggal wajib diisi.');
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload ke Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'photo-journal' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    }) as any;

    const imageUrl = uploadResult.secure_url;

    // Simpan ke database Aiven MySQL
    const date = new Date(dateStr);
    
    await prisma.memory.create({
      data: {
        date,
        imageUrl,
        caption: caption || null,
        userId: session.user.id,
      },
    });

    // Refresh halaman agar data terbaru muncul
    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error uploading memory:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteMemory(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    // Pastikan user adalah pemilik memori
    const memory = await prisma.memory.findUnique({
      where: { id },
    });

    if (!memory || memory.userId !== session.user.id) {
      throw new Error('Anda tidak memiliki izin untuk menghapus memori ini.');
    }

    await prisma.memory.delete({
      where: { id },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting memory:', error);
    return { success: false, error: error.message };
  }
}

export async function updateMemory(id: string, caption: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    // Pastikan user adalah pemilik memori
    const memory = await prisma.memory.findUnique({
      where: { id },
    });

    if (!memory || memory.userId !== session.user.id) {
      throw new Error('Anda tidak memiliki izin untuk mengubah memori ini.');
    }

    await prisma.memory.update({
      where: { id },
      data: { caption },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating memory:', error);
    return { success: false, error: error.message };
  }
}
