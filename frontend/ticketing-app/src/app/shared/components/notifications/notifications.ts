import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {MessagingService, Notification} from '../../../core/services_enterprise/messaging.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isOpen = false;
  loading = false;
  
  private subscriptions: Subscription[] = [];

  constructor(private messagingService: MessagingService) {}

  ngOnInit(): void {
    // Suscribirse al contador de notificaciones no leídas
    const countSub = this.messagingService.getUnreadNotificationsCount().subscribe({
      next: (count) => {
        this.unreadCount = count;
      }
    });
    this.subscriptions.push(countSub);

    // Cargar notificaciones iniciales
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    this.loading = true;
    this.messagingService.getNotifications(1, 10).subscribe({
      next: (response) => {
        this.notifications = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.loading = false;
      }
    });
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead && notification._id) {
      this.messagingService.markNotificationAsRead(notification._id).subscribe({
        next: () => {
          notification.isRead = true;
          this.messagingService.refreshUnreadCounts();
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }
  }

  markAllAsRead(): void {
    this.messagingService.markAllNotificationsAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.messagingService.refreshUnreadCounts();
      },
      error: (error) => {
        console.error('Error marking all as read:', error);
      }
    });
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    if (notification._id) {
      this.messagingService.deleteNotification(notification._id).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n._id !== notification._id);
          this.messagingService.refreshUnreadCounts();
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
        }
      });
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'SUCCESS': return '✓';
      case 'INFO': return 'ℹ';
      case 'WARNING': return '⚠';
      case 'ERROR': return '✗';
      default: return '•';
    }
  }

  getNotificationClass(type: string): string {
    switch (type) {
      case 'SUCCESS': return 'notification-success';
      case 'INFO': return 'notification-info';
      case 'WARNING': return 'notification-warning';
      case 'ERROR': return 'notification-error';
      default: return 'notification-default';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'PURCHASE': return '🛒';
      case 'APPROVAL': return '✓';
      case 'SYSTEM': return '⚙';
      case 'GENERAL': return '📢';
      default: return '•';
    }
  }

  getTimeAgo(date: Date | undefined): string {
    if (!date) return '';
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  }
}
