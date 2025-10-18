import { Router } from 'express';
import SocialController from '../controllers/social.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// ==================== LIKE ROUTES ====================
router.post('/events/:eventId/like', authenticateToken, SocialController.likeEvent);
router.get('/events/:eventId/likes', SocialController.getEventLikes);

// ==================== FOLLOW ROUTES ====================
router.post('/users/follow', authenticateToken, SocialController.followUser);
router.get('/users/:userId/follow-stats', SocialController.getUserFollowStats);
router.get('/users/:userId/followers', SocialController.getFollowers);
router.get('/users/:userId/following', SocialController.getFollowing);

// ==================== COMMENT ROUTES ====================
router.post('/events/comments', authenticateToken, SocialController.createComment);
router.get('/events/:eventId/comments', SocialController.getEventComments);
router.put('/comments/:commentId', authenticateToken, SocialController.updateComment);
router.delete('/comments/:commentId', authenticateToken, SocialController.deleteComment);
router.post('/comments/:commentId/like', authenticateToken, SocialController.likeComment);

export default router;
