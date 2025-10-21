import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialService, FollowStats } from '../../../core/services/social.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-social-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "/user-social-stats.component.html",
  styleUrls: ['./user-social-stats.component.css']
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
