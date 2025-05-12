import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="notification" class="notification" [ngClass]="notification.type">
      <div class="notification-content">
        <span class="message">{{ notification.message }}</span>
        <button class="close-btn" (click)="closeNotification()">×</button>
      </div>
    </div>
  `,
  styles: [`
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      min-width: 300px;
      max-width: 500px;
      padding: 15px;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .notification-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .message {
      flex-grow: 1;
      font-size: 14px;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      color: white;
      margin-left: 10px;
    }

    .success {
      background-color: #4CAF50;
      color: white;
    }

    .error {
      background-color: #F44336;
      color: white;
    }

    .info {
      background-color: #2196F3;
      color: white;
    }

    .warning {
      background-color: #FF9800;
      color: white;
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notification: Notification | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notification$.subscribe(
      notification => {
        this.notification = notification;
      }
    );
  }

  closeNotification(): void {
    this.notificationService.clear();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
