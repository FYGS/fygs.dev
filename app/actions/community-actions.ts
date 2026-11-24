/**
 * Community Server Actions (public entry point)
 *
 * The implementation lives in ./community/*, split by domain. This module keeps
 * the historical import path stable. It is intentionally not a "use server" file
 * and uses explicit named re-exports (never `export *`).
 */

export {
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
} from "./community/discussions";

export {
  createReply,
  updateReply,
  deleteReply,
} from "./community/replies";

export {
  vote,
  voteOnDiscussion,
  voteOnReply,
} from "./community/votes";

export {
  toggleBookmark,
} from "./community/bookmarks";

export {
  toggleTopicFollow,
  toggleUserFollow,
  getUserFollowers,
  getUserFollowing,
  checkUserFollow,
} from "./community/follows";

export {
  createMentorRequest,
  getAvailableMentors,
  getMentorRequests,
  respondToMentorRequest,
} from "./community/mentors";

export {
  updateCommunityProfile,
} from "./community/profile";

export {
  getNotifications,
  markNotificationsAsRead,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "./community/notifications";

export {
  moderateContent,
  updateUserRole,
  banUser,
  unbanUser,
} from "./community/moderation";
