import mongoose, { Schema, Document } from 'mongoose';

// ==================== LIKE MODEL ====================
export interface IEventLike extends Document {
  userId: string;
  eventId: string;
  createdAt: Date;
}

const EventLikeSchema = new Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  eventId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar likes duplicados
EventLikeSchema.index({ userId: 1, eventId: 1 }, { unique: true });
EventLikeSchema.index({ eventId: 1 });
EventLikeSchema.index({ userId: 1 });

// ==================== FOLLOW MODEL ====================
export interface IUserFollow extends Document {
  followerId: string;  // Usuario que sigue
  followingId: string; // Usuario seguido
  createdAt: Date;
}

const UserFollowSchema = new Schema({
  followerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  followingId: {
    type: String,
    required: true,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar follows duplicados
UserFollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
UserFollowSchema.index({ followerId: 1 });
UserFollowSchema.index({ followingId: 1 });

// ==================== COMMENT MODEL ====================
export interface IEventComment extends Document {
  userId: string;
  eventId: string;
  content: string;
  parentCommentId?: string; // Para respuestas a comentarios
  isEdited: boolean;
  isDeleted: boolean;
  likes: string[]; // Array de user IDs que dieron like al comentario
  createdAt: Date;
  updatedAt: Date;
}

const EventCommentSchema = new Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  eventId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
  },
  parentCommentId: {
    type: String,
    ref: 'EventComment',
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: String,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para comentarios
EventCommentSchema.index({ eventId: 1, createdAt: -1 });
EventCommentSchema.index({ userId: 1 });
EventCommentSchema.index({ parentCommentId: 1 });
EventCommentSchema.index({ isDeleted: 1 });

// Middleware para actualizar updatedAt
EventCommentSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.isEdited = true;
  }
  next();
});

// ==================== EXPORT MODELS ====================
export const EventLike = mongoose.model<IEventLike>('EventLike', EventLikeSchema);
export const UserFollow = mongoose.model<IUserFollow>('UserFollow', UserFollowSchema);
export const EventComment = mongoose.model<IEventComment>('EventComment', EventCommentSchema);
