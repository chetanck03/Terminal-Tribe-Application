import { prisma } from '@/lib/prisma';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface CreateNotificationParams {
  userId: string;
  message: string;
  type?: NotificationType;
}

export const createNotification = async ({ userId, message, type = 'info' }: CreateNotificationParams) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
        type,
      },
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const createActivityNotification = async (params: {
  actorId: string;
  targetUserId: string;
  action: string;
  targetType: string;
  targetName: string;
}) => {
  const { actorId, targetUserId, action, targetType, targetName } = params;
  
  try {
    const actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: { name: true },
    });

    if (!actor) return;

    const message = `${actor.name} ${action} ${targetType} "${targetName}"`;
    
    await createNotification({
      userId: targetUserId,
      message,
      type: 'info',
    });
  } catch (error) {
    console.error('Error creating activity notification:', error);
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}; 