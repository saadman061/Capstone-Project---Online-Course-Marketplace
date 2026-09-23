import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Notification } from '../entities/Supporting';

export class NotificationService {
  async createNotification(userId: string, message: string) {
    const notificationRepository = getRepository(Notification);

    const notification = new Notification();
    notification.notificationId = uuidv4();
    notification.userId = userId;
    notification.message = message;
    notification.isRead = false;

    await notificationRepository.save(notification);
    return notification;
  }

  async getUserNotifications(userId: string) {
    const notificationRepository = getRepository(Notification);

    return await notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    const notificationRepository = getRepository(Notification);

    const notification = await notificationRepository.findOne({ where: { notificationId } });
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized');
    }

    notification.isRead = true;
    await notificationRepository.save(notification);
    return notification;
  }

  async markAllAsRead(userId: string) {
    const notificationRepository = getRepository(Notification);

    await notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('user_id = :userId AND is_read = false', { userId })
      .execute();
  }
}

export default new NotificationService();
