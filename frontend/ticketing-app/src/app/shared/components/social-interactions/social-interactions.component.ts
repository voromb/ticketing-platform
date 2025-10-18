import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialService, EventSocialStats, Comment, CommentListResponse } from '../../../core/services/social.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-social-interactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [SocialService, AuthService],
  template: `
    <div class="social-interactions">
      <!-- Like Section -->
      <div class="like-section">
        <button 
          class="like-btn" 
          [class.liked]="isLiked"
          (click)="toggleLike()"
          [disabled]="!isAuthenticated">
          <i class="fas fa-heart" [class.fas]="isLiked" [class.far]="!isLiked"></i>
          <span>{{ likesCount }}</span>
        </button>
      </div>

      <!-- Comments Section -->
      <div class="comments-section">
        <div class="comments-header">
          <h3>Comentarios ({{ commentsCount }})</h3>
        </div>

        <!-- Add Comment Form -->
        <div class="add-comment" *ngIf="isAuthenticated">
          <textarea 
            [(ngModel)]="newComment"
            placeholder="Escribe tu comentario..."
            maxlength="1000"
            rows="3">
          </textarea>
          <div class="comment-actions">
            <span class="char-count">{{ newComment.length }}/1000</span>
            <button 
              class="btn-primary"
              (click)="addComment()"
              [disabled]="!newComment.trim() || isSubmitting">
              {{ isSubmitting ? 'Enviando...' : 'Comentar' }}
            </button>
          </div>
        </div>

        <!-- Login Prompt -->
        <div class="login-prompt" *ngIf="!isAuthenticated">
          <p>Inicia sesión para comentar y dar likes</p>
          <button class="btn-primary" (click)="onLoginRequired.emit()">Iniciar Sesión</button>
        </div>

        <!-- Comments List -->
        <div class="comments-list">
          <div 
            class="comment-item" 
            *ngFor="let comment of comments; trackBy: trackByCommentId">
            
            <!-- Main Comment -->
            <div class="comment-main">
              <div class="comment-header">
                <div class="user-info">
                  <img 
                    [src]="comment.user?.avatar || '/assets/default-avatar.png'" 
                    [alt]="comment.user?.username"
                    class="user-avatar">
                  <div class="user-details">
                    <span class="username">{{ comment.user?.username }}</span>
                    <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                    <span class="edited-badge" *ngIf="comment.isEdited">(editado)</span>
                  </div>
                </div>
                <div class="comment-actions" *ngIf="isAuthenticated">
                  <button 
                    class="like-comment-btn"
                    [class.liked]="isCommentLiked(comment)"
                    (click)="toggleCommentLike(comment)">
                    <i class="fas fa-heart" [class.fas]="isCommentLiked(comment)" [class.far]="!isCommentLiked(comment)"></i>
                    {{ comment.likesCount }}
                  </button>
                </div>
              </div>
              
              <div class="comment-content">
                <p>{{ comment.content }}</p>
              </div>

              <!-- Reply Button -->
              <div class="comment-footer" *ngIf="isAuthenticated">
                <button 
                  class="reply-btn"
                  (click)="toggleReply(comment)"
                  [class.active]="replyingTo === comment.id">
                  {{ replyingTo === comment.id ? 'Cancelar' : 'Responder' }}
                </button>
              </div>

              <!-- Reply Form -->
              <div class="reply-form" *ngIf="replyingTo === comment.id">
                <textarea 
                  [(ngModel)]="replyText"
                  placeholder="Escribe tu respuesta..."
                  maxlength="1000"
                  rows="2">
                </textarea>
                <div class="reply-actions">
                  <span class="char-count">{{ replyText.length }}/1000</span>
                  <button 
                    class="btn-primary"
                    (click)="addReply(comment)"
                    [disabled]="!replyText.trim() || isSubmitting">
                    {{ isSubmitting ? 'Enviando...' : 'Responder' }}
                  </button>
                </div>
              </div>

              <!-- Replies -->
              <div class="replies" *ngIf="comment.replies && comment.replies.length > 0">
                <div 
                  class="reply-item" 
                  *ngFor="let reply of comment.replies; trackBy: trackByCommentId">
                  <div class="reply-header">
                    <img 
                      [src]="reply.user?.avatar || '/assets/default-avatar.png'" 
                      [alt]="reply.user?.username"
                      class="user-avatar small">
                    <div class="user-details">
                      <span class="username">{{ reply.user?.username }}</span>
                      <span class="comment-date">{{ formatDate(reply.createdAt) }}</span>
                      <span class="edited-badge" *ngIf="reply.isEdited">(editado)</span>
                    </div>
                    <div class="comment-actions" *ngIf="isAuthenticated">
                      <button 
                        class="like-comment-btn"
                        [class.liked]="isCommentLiked(reply)"
                        (click)="toggleCommentLike(reply)">
                        <i class="fas fa-heart" [class.fas]="isCommentLiked(reply)" [class.far]="!isCommentLiked(reply)"></i>
                        {{ reply.likesCount }}
                      </button>
                    </div>
                  </div>
                  <div class="reply-content">
                    <p>{{ reply.content }}</p>
                  </div>
                </div>
                
                <!-- Load More Replies -->
                <button 
                  class="load-more-replies"
                  *ngIf="comment.repliesCount > comment.replies!.length"
                  (click)="loadMoreReplies(comment)">
                  Ver {{ comment.repliesCount - comment.replies!.length }} respuestas más
                </button>
              </div>
            </div>
          </div>

          <!-- Load More Comments -->
          <div class="load-more-section" *ngIf="hasMoreComments">
            <button 
              class="load-more-btn"
              (click)="loadMoreComments()"
              [disabled]="isLoading">
              {{ isLoading ? 'Cargando...' : 'Cargar más comentarios' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .social-interactions {
      margin-top: 2rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .like-section {
      margin-bottom: 2rem;
    }

    .like-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 1rem;
    }

    .like-btn:hover:not(:disabled) {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .like-btn.liked {
      border-color: #ef4444;
      background: #fef2f2;
      color: #ef4444;
    }

    .like-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .comments-section {
      margin-top: 2rem;
    }

    .comments-header h3 {
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .add-comment {
      margin-bottom: 2rem;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: #f9fafb;
    }

    .add-comment textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      resize: vertical;
      font-family: inherit;
      font-size: 0.875rem;
    }

    .add-comment textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .comment-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.75rem;
    }

    .char-count {
      font-size: 0.75rem;
      color: #6b7280;
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

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .login-prompt {
      text-align: center;
      padding: 2rem;
      background: #f9fafb;
      border-radius: 0.5rem;
      margin-bottom: 2rem;
    }

    .login-prompt p {
      margin: 0 0 1rem 0;
      color: #6b7280;
    }

    .comments-list {
      margin-top: 1rem;
    }

    .comment-item {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: white;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-avatar.small {
      width: 2rem;
      height: 2rem;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .username {
      font-weight: 600;
      font-size: 0.875rem;
    }

    .comment-date {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .edited-badge {
      font-size: 0.75rem;
      color: #9ca3af;
      font-style: italic;
    }

    .comment-content p {
      margin: 0;
      line-height: 1.5;
      color: #374151;
    }

    .comment-footer {
      margin-top: 0.75rem;
    }

    .reply-btn {
      background: none;
      border: none;
      color: #3b82f6;
      cursor: pointer;
      font-size: 0.875rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      transition: background 0.2s;
    }

    .reply-btn:hover {
      background: #f3f4f6;
    }

    .reply-btn.active {
      background: #e5e7eb;
    }

    .reply-form {
      margin-top: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 0.375rem;
    }

    .reply-form textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.25rem;
      resize: vertical;
      font-family: inherit;
      font-size: 0.875rem;
    }

    .reply-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.5rem;
    }

    .replies {
      margin-top: 1rem;
      padding-left: 1rem;
      border-left: 2px solid #e5e7eb;
    }

    .reply-item {
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 0.375rem;
    }

    .reply-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .like-comment-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.25rem;
      background: white;
      cursor: pointer;
      font-size: 0.75rem;
      transition: all 0.2s;
    }

    .like-comment-btn:hover:not(:disabled) {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .like-comment-btn.liked {
      border-color: #ef4444;
      background: #fef2f2;
      color: #ef4444;
    }

    .load-more-replies,
    .load-more-btn {
      background: none;
      border: 1px solid #d1d5db;
      color: #6b7280;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .load-more-replies:hover,
    .load-more-btn:hover:not(:disabled) {
      border-color: #3b82f6;
      color: #3b82f6;
    }

    .load-more-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .load-more-section {
      text-align: center;
      margin-top: 2rem;
    }
  `]
})
export class SocialInteractionsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() eventId!: string;
  @Output() onLoginRequired = new EventEmitter<void>();

  // State
  isAuthenticated = false;
  isLiked = false;
  likesCount = 0;
  commentsCount = 0;
  comments: Comment[] = [];
  newComment = '';
  replyText = '';
  replyingTo: string | null = null;
  isSubmitting = false;
  isLoading = false;
  hasMoreComments = false;
  currentPage = 1;
  private destroy$ = new Subject<void>();

  constructor(
    private socialService: SocialService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('🚀 SocialInteractionsComponent initialized with eventId:', this.eventId);
    this.isAuthenticated = this.authService.isAuthenticated();
    console.log('🔐 User authenticated:', this.isAuthenticated);
    if (this.eventId) {
      this.loadSocialStats();
      this.loadComments();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['eventId'] && changes['eventId'].currentValue && changes['eventId'].currentValue !== changes['eventId'].previousValue) {
      console.log('🔄 EventId changed from', changes['eventId'].previousValue, 'to', changes['eventId'].currentValue);
      this.loadSocialStats();
      this.loadComments();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSocialStats() {
    this.socialService.getEventLikes(this.eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLiked = response.isLikedByUser;
          this.likesCount = response.totalLikes;
        },
        error: (error) => console.error('Error loading likes:', error)
      });
  }

  private loadComments(page: number = 1) {
    this.isLoading = true;
    console.log('🔄 Loading comments for event:', this.eventId, 'page:', page);
    this.socialService.getEventComments(this.eventId, page, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: CommentListResponse) => {
          console.log('📝 Comments loaded:', response);
          if (page === 1) {
            this.comments = response.comments;
          } else {
            this.comments.push(...response.comments);
          }
          this.commentsCount = response.total;
          this.hasMoreComments = response.page < response.totalPages;
          this.currentPage = response.page;
          this.isLoading = false;
          console.log('📊 Comments state updated:', {
            comments: this.comments.length,
            total: this.commentsCount,
            hasMore: this.hasMoreComments
          });
        },
        error: (error) => {
          console.error('❌ Error loading comments:', error);
          this.isLoading = false;
        }
      });
  }

  toggleLike() {
    if (!this.isAuthenticated) {
      this.onLoginRequired.emit();
      return;
    }

    this.socialService.likeEvent(this.eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLiked = response.isLiked;
          this.likesCount = response.totalLikes;
        },
        error: (error) => console.error('Error toggling like:', error)
      });
  }

  addComment() {
    if (!this.newComment.trim() || this.isSubmitting) return;

    this.isSubmitting = true;
    console.log('💬 Adding comment:', this.newComment.trim());
    this.socialService.createComment(this.eventId, this.newComment.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Comment created response:', response);
          if (response.success && response.comment) {
            this.comments.unshift(response.comment!);
            this.commentsCount++;
            this.newComment = '';
            console.log('📝 Comment added to list. Total comments:', this.comments.length);
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('❌ Error adding comment:', error);
          this.isSubmitting = false;
        }
      });
  }

  addReply(parentComment: Comment) {
    if (!this.replyText.trim() || this.isSubmitting) return;

    this.isSubmitting = true;
    this.socialService.createComment(this.eventId, this.replyText.trim(), parentComment.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.comment) {
            if (!parentComment.replies) {
              parentComment.replies = [];
            }
            parentComment.replies.push(response.comment!);
            parentComment.repliesCount++;
            this.replyText = '';
            this.replyingTo = null;
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error adding reply:', error);
          this.isSubmitting = false;
        }
      });
  }

  toggleReply(comment: Comment) {
    if (this.replyingTo === comment.id) {
      this.replyingTo = null;
      this.replyText = '';
    } else {
      this.replyingTo = comment.id;
      this.replyText = '';
    }
  }

  toggleCommentLike(comment: Comment) {
    if (!this.isAuthenticated) {
      this.onLoginRequired.emit();
      return;
    }

    this.socialService.likeComment(comment.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          comment.likesCount = response.likesCount;
          // Update likes array based on response
          if (response.isLiked) {
            if (!comment.likes.includes(this.authService.getCurrentUser()?.id || '')) {
              comment.likes.push(this.authService.getCurrentUser()?.id || '');
            }
          } else {
            comment.likes = comment.likes.filter(id => id !== this.authService.getCurrentUser()?.id);
          }
        },
        error: (error) => console.error('Error toggling comment like:', error)
      });
  }

  isCommentLiked(comment: Comment): boolean {
    const currentUserId = this.authService.getCurrentUser()?.id;
    return currentUserId ? comment.likes.includes(currentUserId) : false;
  }

  loadMoreComments() {
    if (!this.hasMoreComments || this.isLoading) return;
    this.loadComments(this.currentPage + 1);
  }

  loadMoreReplies(comment: Comment) {
    // Implementar carga de más respuestas si es necesario
    console.log('Loading more replies for comment:', comment.id);
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment.id;
  }
}
