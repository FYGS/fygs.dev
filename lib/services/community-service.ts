/**
 * Community Service Layer
 * Comprehensive service for forum operations with advanced features
 *
 * Facade: the queries live in ./community/*, grouped by domain.
 */

import { TopicQueries } from "./community/topics";
import { DiscussionQueries } from "./community/discussions";
import { DiscoveryQueries } from "./community/discovery";
import { StatsQueries } from "./community/stats";
import { UserQueries } from "./community/user";
import { MentorshipQueries } from "./community/mentorship";

export class CommunityService {
  static getTopics = TopicQueries.getTopics;
  static getFollowedTopics = TopicQueries.getFollowedTopics;
  static isFollowingTopic = TopicQueries.isFollowingTopic;

  static getDiscussions = DiscussionQueries.getDiscussions;
  static getDiscussion = DiscussionQueries.getDiscussion;
  static getDiscussionById = DiscussionQueries.getDiscussionById;
  static getReplies = DiscussionQueries.getReplies;

  static searchDiscussions = DiscoveryQueries.searchDiscussions;
  static getTrendingDiscussions = DiscoveryQueries.getTrendingDiscussions;
  static getRecommendations = DiscoveryQueries.getRecommendations;

  static getCommunityStats = StatsQueries.getCommunityStats;

  static getUnreadNotificationsCount = UserQueries.getUnreadNotificationsCount;
  static getUserBookmarks = UserQueries.getUserBookmarks;
  static getUserReplies = UserQueries.getUserReplies;
  static getUserProfile = UserQueries.getUserProfile;

  static getAvailableMentors = MentorshipQueries.getAvailableMentors;
  static getMentorshipStats = MentorshipQueries.getMentorshipStats;
}
