'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function sendFriendRequest(receiverId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');
    const senderId = session.user.id;

    if (senderId === receiverId) throw new Error('Tidak bisa mengirim permintaan ke diri sendiri.');

    // Cek jika sudah berteman
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: senderId, friendId: receiverId },
          { userId: receiverId, friendId: senderId },
        ],
      },
    });

    if (existingFriendship) throw new Error('Sudah berteman.');

    // Cek jika sudah ada permintaan
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
        status: 'PENDING',
      },
    });

    if (existingRequest) throw new Error('Permintaan sudah dikirim.');

    await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
      },
    });

    revalidatePath('/social');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function acceptFriendRequest(requestId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.receiverId !== session.user.id) {
      throw new Error('Permintaan tidak ditemukan.');
    }

    // Update status permintaan
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    });

    // Buat hubungan pertemanan (dua arah)
    await prisma.friendship.createMany({
      data: [
        { userId: request.senderId, friendId: request.receiverId },
        { userId: request.receiverId, friendId: request.senderId },
      ],
    });

    revalidatePath('/social');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function searchUsers(query: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
        ],
        NOT: { id: session.user.id },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 10,
    });

    return { users };
  } catch (error: any) {
    return { error: error.message };
  }
}
