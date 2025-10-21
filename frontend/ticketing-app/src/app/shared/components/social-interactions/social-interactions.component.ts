import { 
  Component, 
  signal, 
  computed, 
  input, 
  output, 
  inject, 
  DestroyRef, 
  effect 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { SocialService, Comment, CommentResponse, CommentListResponse } from '../../../core/services/social.service';
import { AuthService } from '~/app/core/services/auth.service';

@Component({
  selector: 'app-social-interactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-interactions.component.html',
  styleUrls: ['./social-interactions.component.css']
})
export class SocialInteractionsComponent {

  // ===============================
  // 🔹 Inputs / Outputs
  // ===============================
  eventId = input.required<string>();
  onLoginRequired = output<void>();

  // ===============================
  // 🔹 Servicios
  // ===============================
  private social = inject(SocialService);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);

  // ===============================
  // 🔹 Signals reactivas
  // ===============================
  readonly isLiked = signal(false);
  readonly likesCount = signal(0);
  readonly comments = signal<Comment[]>([]);
  readonly hasMoreComments = signal(false);
  readonly isLoading = signal(false);
  readonly newComment = signal('');
  readonly isSubmitting = signal(false);
  readonly replyingTo = signal<string | null>(null);
  readonly replyText = signal('');

  // Usuario actual desde AuthService
  readonly currentUser = toSignal(this.authService.currentUser$, { initialValue: null });
  readonly isAuthenticated = computed(() => !!this.currentUser());

  readonly commentsCount = computed(() => this.comments().length);

  // ===============================
  // 🔹 Efecto para cargar likes automáticamente
  // ===============================
  readonly loadLikesEffect = effect(() => {
    const id = this.eventId();
    if (!id) return;

    this.social.getEventLikes(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.likesCount.set(res.totalLikes);
          this.isLiked.set(res.isLikedByUser);
        },
        error: err => console.error('❌ Error cargando likes:', err)
      });
  });

  // ===============================
  // 🔹 Efecto para cargar comentarios automáticamente
  // ===============================
  readonly loadCommentsEffect = effect(() => {
    const id = this.eventId();
    if (!id) return;

    console.log('🔄 Cargando comentarios automáticamente para evento:', id);
    // Usar setTimeout para asegurar que se ejecute en el siguiente ciclo
    setTimeout(() => {
      this.loadComments();
    }, 0);
  });

  // ===============================
  // 🔹 Métodos principales
  // ===============================

  toggleLike() {
    if (!this.isAuthenticated()) {
      this.onLoginRequired.emit();
      return;
    }

    this.social.likeEvent(this.eventId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.isLiked.set(res.isLiked);
          this.likesCount.set(res.totalLikes);
        },
        error: err => console.error('❌ Error al dar like:', err)
      });
  }

  loadComments(page: number = 1) {
    this.isLoading.set(true);
    this.social.getEventComments(this.eventId(), page, 10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: CommentListResponse) => {
          this.comments.set(res.comments);
          this.hasMoreComments.set(res.page < res.totalPages);
          this.isLoading.set(false);
        },
        error: err => {
          console.error('❌ Error cargando comentarios:', err);
          this.isLoading.set(false);
        }
      });
  }

  addComment() {
    const content = this.newComment().trim();
    if (!content || !this.isAuthenticated()) {
      this.onLoginRequired.emit();
      return;
    }

    this.isSubmitting.set(true);

    this.social.createComment(this.eventId(), content)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: CommentResponse) => {
          if (res.comment) {
            this.comments.update(list => [res.comment!, ...list]);
          }
          this.newComment.set('');
          this.isSubmitting.set(false);
        },
        error: err => {
          console.error('❌ Error creando comentario:', err);
          this.isSubmitting.set(false);
        }
      });
  }

  toggleCommentLike(comment: Comment) {
    if (!this.isAuthenticated()) {
      this.onLoginRequired.emit();
      return;
    }

    this.social.likeComment(comment.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.comments.update(list =>
            list.map(c =>
              c.id === comment.id
                ? { 
                    ...c, 
                    likesCount: res.likesCount, 
                    likes: res.isLiked 
                      ? [...(c.likes || []), this.currentUser()?.id].filter((id): id is string => !!id)
                      : (c.likes || []).filter(x => x !== this.currentUser()?.id)
                  }
                : c
            )
          );
        },
        error: err => console.error('❌ Error en like de comentario:', err)
      });
  }

  addReply(parent: Comment) {
    const content = this.replyText().trim();
    if (!content || !this.isAuthenticated()) {
      this.onLoginRequired.emit();
      return;
    }

    this.isSubmitting.set(true);

    this.social.createComment(this.eventId(), content, parent.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (res.comment) {
            this.comments.update(list =>
              list.map(c =>
                c.id === parent.id
                  ? { ...c, replies: [...(c.replies || []), res.comment!] }
                  : c
              )
            );
          }
          this.replyText.set('');
          this.replyingTo.set(null);
          this.isSubmitting.set(false);
        },
        error: err => {
          console.error('❌ Error al responder:', err);
          this.isSubmitting.set(false);
        }
      });
  }

  // ===============================
  // 🔹 Helpers
  // ===============================

  toggleReply(comment: Comment) {
    this.replyingTo.update(id => (id === comment.id ? null : comment.id));
    this.replyText.set('');
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleString();
  }

  isCommentLiked(comment: Comment): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return Array.isArray(comment.likes) && comment.likes.includes(user.id);
  }

  trackByCommentId(index: number, item: Comment) {
    return item.id;
  }
}
