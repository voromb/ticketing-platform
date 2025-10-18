import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialService, FollowStats } from '../../../core/services/social.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-social-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-social-stats">
      <div class="stats-grid">
        <!-- Followers -->
        <div class="stat-item">
          <div class="stat-number">{{ followersCount }}</div>
          <div class="stat-label">Seguidores</div>
        </div>

        <!-- Following -->
        <div class="stat-item">
          <div class="stat-number">{{ followingCount }}</div>
          <div class="stat-label">Siguiendo</div>
        </div>
      </div>

      <!-- Follow Button -->
      <div class="follow-section" *ngIf="showFollowButton && !isOwnProfile">
        <button 
          class="follow-btn"
          [class.following]="isFollowing"
          (click)="toggleFollow()"
          [disabled]="!isAuthenticated || isLoading">
          <span *ngIf="isLoading">...</span>
          <span *ngIf="!isLoading">{{ isFollowing ? 'Siguiendo' : 'Seguir' }}</span>
        </button>
      </div>

      <!-- Login Prompt -->
      <div class="login-prompt" *ngIf="!isAuthenticated && showFollowButton && !isOwnProfile">
        <p>Inicia sesión para seguir usuarios</p>
        <button class="btn-primary" (click)="onLoginRequired.emit()">Iniciar Sesión</button>
      </div>
    </div>
  `,
  styles: [`
    .user-social-stats {
      padding: 1.5rem;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 0.375rem;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .follow-section {
      text-align: center;
    }

    .follow-btn {
      padding: 0.75rem 2rem;
      border: 2px solid #3b82f6;
      border-radius: 0.5rem;
      background: white;
      color: #3b82f6;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.2s;
      min-width: 120px;
    }

    .follow-btn:hover:not(:disabled) {
      background: #3b82f6;
      color: white;
    }

    .follow-btn.following {
      background: #3b82f6;
      color: white;
    }

    .follow-btn.following:hover:not(:disabled) {
      background: #ef4444;
      border-color: #ef4444;
    }

    .follow-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .login-prompt {
      text-align: center;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 0.375rem;
    }

    .login-prompt p {
      margin: 0 0 0.75rem 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .btn-primary {
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: #2563eb;
    }
  `]
})
export class UserSocialStatsComponent implements OnInit, OnDestroy {
  @Input() userId!: string;
  @Input() showFollowButton = true;
  @Output() onLoginRequired = new EventEmitter<void>();

  // State
  isAuthenticated = false;
  isOwnProfile = false;
  followersCount = 0;
  followingCount = 0;
  isFollowing = false;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private socialService: SocialService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isOwnProfile = this.isAuthenticated && this.authService.getCurrentUser()?.id === this.userId;
    this.loadFollowStats();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFollowStats() {
    this.socialService.getUserFollowStats(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: FollowStats) => {
          this.followersCount = stats.followersCount;
          this.followingCount = stats.followingCount;
          this.isFollowing = stats.isFollowing;
        },
        error: (error) => console.error('Error loading follow stats:', error)
      });
  }

  toggleFollow() {
    if (!this.isAuthenticated || this.isLoading) return;

    this.isLoading = true;
    this.socialService.followUser(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isFollowing = response.isFollowing;
          // Update counts based on follow action
          if (response.isFollowing) {
            this.followersCount++;
          } else {
            this.followersCount = Math.max(0, this.followersCount - 1);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error toggling follow:', error);
          this.isLoading = false;
        }
      });
  }
}
