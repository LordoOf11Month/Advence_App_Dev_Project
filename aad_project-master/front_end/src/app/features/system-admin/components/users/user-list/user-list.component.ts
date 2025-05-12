import { AdminService, UserAccount } from './../../../services/system-admin.service';
import { NotificationService } from './../../../../../core/services/notification.service';
// features/system-admin/components/users/user-list/user-list.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-list',
  standalone:false,
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  users: UserAccount[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private adminService: AdminService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getAllCustomers().subscribe({
      next: users => {
        // Transform the data to ensure each user has the correct properties
        this.users = users.map(user => {
          return {
            ...user,
            // Ensure roles exists as an array
            roles: user.roles || (user.role ? [user.role] : ['CUSTOMER']),
            // Set active based on banned state if not provided
            active: user.active !== undefined ? user.active : !user.banned
          };
        });
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load users', err);
        this.error = 'Could not load users.';
        this.loading = false;
      }
    });
  }

  toggleBan(user: UserAccount): void {
    if (user.active) {
      // Ban user
      this.adminService.banUser(user.id).subscribe({
        next: () => {
          user.active = false;
          this.notify.showSuccess(`User ${user.email} banned.`);
        },
        error: err => {
          console.error('Ban failed', err);
          this.notify.showError('Failed to ban user.');
        }
      });
    } else {
      // Unban user
      this.adminService.unbanUser(user.id).subscribe({
        next: () => {
          user.active = true;
          this.notify.showSuccess(`User ${user.email} unbanned.`);
        },
        error: err => {
          console.error('Unban failed', err);
          this.notify.showError('Failed to unban user.');
        }
      });
    }
  }
}
