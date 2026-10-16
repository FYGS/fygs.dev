import { SITE_URL } from "@/app/_lib/constants";

import { createBaseTemplate } from "./base";

/** Community notification emails (discussions, follows, mentoring, badges). */
export class CommunityEmailTemplates {
  // ============ COMMUNITY NOTIFICATION TEMPLATES ============

  /**
   * Send notification when someone replies to a discussion
   */
  static discussionReply({
    authorName,
    replierName,
    discussionTitle,
    replyContent,
    discussionId,
    siteUrl = SITE_URL,
  }: {
    authorName: string;
    replierName: string;
    discussionTitle: string;
    replyContent: string;
    discussionId: string;
    siteUrl?: string;
  }) {
    const content = `
      <div class="content">
        <h2>💬 Nouvelle réponse à votre discussion</h2>
        
        <p>Bonjour <strong>${authorName}</strong>,</p>

        <p><strong>${replierName}</strong> a répondu à votre discussion "<strong>${discussionTitle}</strong>".</p>

        <div class="features-list" style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
          <p style="margin: 0; white-space: pre-wrap; line-height: 1.7;">${replyContent}</p>
        </div>

        <a href="${siteUrl}/community/discussions/${discussionId}" class="cta-button">Voir la discussion</a>

        <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
          Continuez la conversation et engagez-vous avec la communauté ! 🚀
        </p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Communauté</p>
        <p><a href="${siteUrl}/community">Explorer la communauté</a></p>
      </div>
    `;

    return {
      subject: `💬 ${replierName} a répondu à votre discussion`,
      html: createBaseTemplate(content, "Nouvelle réponse"),
    };
  }

  /**
   * Send notification when someone follows you
   */
  static newFollower({
    recipientName,
    followerName,
    followerAvatar,
    followerId,
    siteUrl = SITE_URL,
  }: {
    recipientName: string;
    followerName: string;
    followerAvatar?: string | null;
    followerId: string;
    siteUrl?: string;
  }) {
    const content = `
      <div class="content">
        <h2>👥 Nouveau follower !</h2>
        
        <p>Bonjour <strong>${recipientName}</strong>,</p>

        <p><strong>${followerName}</strong> vous suit maintenant dans la communauté FYGS !</p>

        ${
          followerAvatar
            ? `
          <div style="text-align: center; margin: 25px 0;">
            <img src="${followerAvatar}" alt="${followerName}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #667eea;" />
          </div>
        `
            : ""
        }

        <div class="features-list">
          <h4>Pourquoi suivre des membres ?</h4>
          <ul>
            <li>Restez informé de leurs nouvelles discussions</li>
            <li>Découvrez leurs réponses utiles</li>
            <li>Construisez votre réseau d'apprentissage</li>
          </ul>
        </div>

        <a href="${siteUrl}/community/users/${followerId}" class="cta-button">Voir le profil</a>

        <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
          Votre réseau grandit ! Continuez à partager vos connaissances. 🌟
        </p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Communauté</p>
        <p><a href="${siteUrl}/community/following">Gérer mes abonnements</a></p>
      </div>
    `;

    return {
      subject: `👥 ${followerName} vous suit maintenant`,
      html: createBaseTemplate(content, "Nouveau follower"),
    };
  }

  /**
   * Send notification for mentor request
   */
  static mentorRequest({
    mentorName,
    studentName,
    message,
    siteUrl = SITE_URL,
  }: {
    mentorName: string;
    studentName: string;
    message?: string | null;
    courseId?: string | null;
    requestId: string;
    siteUrl?: string;
  }) {
    const content = `
      <div class="content">
        <h2>🎓 Nouvelle demande de mentorat</h2>
        
        <p>Bonjour <strong>${mentorName}</strong>,</p>

        <p><strong>${studentName}</strong> souhaite bénéficier de votre expertise et vous a envoyé une demande de mentorat.</p>

        ${
          message
            ? `
          <div class="features-list" style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h4>Message :</h4>
            <p style="margin: 10px 0 0 0; white-space: pre-wrap; line-height: 1.7;">${message}</p>
          </div>
        `
            : ""
        }

        <div class="features-list">
          <h4>💡 Avantages du mentorat :</h4>
          <ul>
            <li>Partagez votre expérience et expertise</li>
            <li>Guidez un apprenant dans son parcours</li>
            <li>Renforcez votre réputation dans la communauté</li>
            <li>Gagnez des points communautaires</li>
          </ul>
        </div>

        <a href="${siteUrl}/community/mentorship" class="cta-button">Voir la demande</a>

        <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
          Votre expertise peut faire la différence ! 🌟
        </p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Mentorat</p>
        <p><a href="${siteUrl}/community/mentorship">Gérer mes demandes</a></p>
      </div>
    `;

    return {
      subject: `🎓 ${studentName} demande votre mentorat`,
      html: createBaseTemplate(content, "Demande de mentorat"),
    };
  }

  /**
   * Send notification when mentor responds to request
   */
  static mentorResponse({
    studentName,
    mentorName,
    action,
    siteUrl = SITE_URL,
  }: {
    studentName: string;
    mentorName: string;
    action: "accept" | "decline";
    siteUrl?: string;
  }) {
    const isAccepted = action === "accept";

    const content = `
      <div class="content">
        <h2>${
          isAccepted
            ? "✅ Demande de mentorat acceptée !"
            : "📌 Réponse à votre demande de mentorat"
        }</h2>
        
        <p>Bonjour <strong>${studentName}</strong>,</p>

        <p><strong>${mentorName}</strong> a ${
      isAccepted ? "accepté" : "décliné"
    } votre demande de mentorat.</p>

        ${
          isAccepted
            ? `
          <div class="features-list" style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h4>🎉 Félicitations !</h4>
            <p style="margin: 10px 0 0 0;">Vous pouvez maintenant échanger avec votre mentor et bénéficier de son expertise pour progresser dans votre apprentissage.</p>
          </div>

          <div class="features-list">
            <h4>💡 Prochaines étapes :</h4>
            <ul>
              <li>Présentez vos objectifs d'apprentissage</li>
              <li>Planifiez vos sessions de mentorat</li>
              <li>Posez vos questions et demandez des conseils</li>
              <li>Partagez vos progrès régulièrement</li>
            </ul>
          </div>
        `
            : `
          <div class="features-list" style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0;">Ne vous découragez pas ! De nombreux mentors sont disponibles dans la communauté.</p>
          </div>

          <div class="features-list">
            <h4>💡 Alternatives :</h4>
            <ul>
              <li>Trouvez d'autres mentors dans votre domaine</li>
              <li>Participez aux discussions de la communauté</li>
              <li>Consultez nos formations premium</li>
              <li>Rejoignez des groupes d'étude</li>
            </ul>
          </div>
        `
        }

        <a href="${siteUrl}/community/mentorship" class="cta-button">${
      isAccepted ? "Contacter mon mentor" : "Trouver d'autres mentors"
    }</a>

        <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
          ${
            isAccepted
              ? "Profitez pleinement de cette opportunité d'apprentissage ! 🚀"
              : "Continuez votre parcours d'apprentissage avec la communauté ! 💪"
          }
        </p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Mentorat</p>
        <p><a href="${siteUrl}/community">Explorer la communauté</a></p>
      </div>
    `;

    return {
      subject: isAccepted
        ? `✅ ${mentorName} a accepté votre demande de mentorat`
        : `📌 ${mentorName} a répondu à votre demande`,
      html: createBaseTemplate(content, "Réponse de mentorat"),
    };
  }

  /**
   * Send notification when user earns a badge
   */
  static badgeEarned({
    userName,
    badgeName,
    badgeDescription,
    badgeIcon,
    points,
    siteUrl = SITE_URL,
  }: {
    userName: string;
    badgeName: string;
    badgeDescription: string;
    badgeIcon: string;
    points: number;
    siteUrl?: string;
  }) {
    const content = `
      <div class="content">
        <h2>🏆 Nouveau badge débloqué !</h2>
        
        <p>Bonjour <strong>${userName}</strong>,</p>

        <p>Félicitations ! Vous venez de débloquer le badge <strong>${badgeName}</strong> ! 🎉</p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">
            <div style="font-size: 64px; margin-bottom: 10px;">${badgeIcon}</div>
            <h3 style="color: white; margin: 10px 0;">${badgeName}</h3>
            <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">+${points} points</p>
          </div>
        </div>

        <div class="features-list" style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; text-align: center; font-style: italic; color: #6b7280;">"${badgeDescription}"</p>
        </div>

        <div class="features-list">
          <h4>🎯 Vos accomplissements :</h4>
          <ul>
            <li>Badge ${badgeName} débloqué</li>
            <li>+${points} points communautaires gagnés</li>
            <li>Votre réputation augmente dans la communauté</li>
          </ul>
        </div>

        <a href="${siteUrl}/community/users/${userName}" class="cta-button">Voir mon profil</a>

        <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
          Continuez comme ça ! D'autres badges vous attendent. 🚀
        </p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Badges</p>
        <p><a href="${siteUrl}/community">Explorer la communauté</a></p>
      </div>
    `;

    return {
      subject: `🏆 Badge débloqué : ${badgeName} (+${points} points)`,
      html: createBaseTemplate(content, "Nouveau badge"),
    };
  }

  /**
   * Send weekly digest of community activity
   */
  static communityWeeklyDigest({
    userName,
    weeklyStats,
    topDiscussions,
    newBadges,
    siteUrl = SITE_URL,
  }: {
    userName: string;
    weeklyStats: {
      totalDiscussions: number;
      totalReplies: number;
      pointsEarned: number;
      newFollowers: number;
    };
    topDiscussions: Array<{
      id: string;
      title: string;
      replyCount: number;
    }>;
    newBadges: Array<{
      name: string;
      icon: string;
    }>;
    siteUrl?: string;
  }) {
    const { totalDiscussions, totalReplies, pointsEarned, newFollowers } =
      weeklyStats;

    const content = `
      <div class="content">
        <h2>📊 Votre semaine dans la communauté</h2>
        
        <p>Bonjour <strong>${userName}</strong>,</p>

        <p>Voici un résumé de votre activité cette semaine dans la communauté FYGS :</p>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 25px 0;">
          <div style="background: #eff6ff; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #3b82f6;">
            <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">${totalDiscussions}</div>
            <div style="color: #6b7280; font-size: 14px;">Discussions créées</div>
          </div>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #10b981;">
            <div style="font-size: 32px; font-weight: bold; color: #10b981;">${totalReplies}</div>
            <div style="color: #6b7280; font-size: 14px;">Réponses postées</div>
          </div>
          <div style="background: #fef3c7; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #f59e0b;">
            <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${pointsEarned}</div>
            <div style="color: #6b7280; font-size: 14px;">Points gagnés</div>
          </div>
          <div style="background: #fce7f3; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #ec4899;">
            <div style="font-size: 32px; font-weight: bold; color: #ec4899;">${newFollowers}</div>
            <div style="color: #6b7280; font-size: 14px;">Nouveaux followers</div>
          </div>
        </div>

        ${
          newBadges.length > 0
            ? `
          <div class="features-list" style="background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%); border: 2px solid #667eea; padding: 20px; border-radius: 12px; margin: 25px 0;">
            <h4>🏆 Nouveaux badges débloqués :</h4>
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 15px;">
              ${newBadges
                .map(
                  (badge) => `
                <div style="text-align: center;">
                  <div style="font-size: 48px;">${badge.icon}</div>
                  <div style="font-size: 12px; color: #6b7280;">${badge.name}</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }

        ${
          topDiscussions.length > 0
            ? `
          <div class="features-list">
            <h4>🔥 Discussions populaires cette semaine :</h4>
            <ul>
              ${topDiscussions
                .map(
                  (discussion) => `
                <li><a href="${siteUrl}/community/discussions/${discussion.id}" style="color: #667eea; text-decoration: none;"><strong>${discussion.title}</strong></a> - ${discussion.replyCount} réponses</li>
              `
                )
                .join("")}
            </ul>
          </div>
        `
            : ""
        }

        <a href="${siteUrl}/community" class="cta-button">Explorer la communauté</a>

        <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
          ${
            pointsEarned > 50
              ? "Excellente semaine ! Vous êtes très actif dans la communauté. 🌟"
              : pointsEarned > 20
              ? "Belle activité ! Continuez à partager vos connaissances. 👏"
              : "N'hésitez pas à participer davantage aux discussions ! 💪"
          }
        </p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Communauté</p>
        <p><a href="${siteUrl}/community/notifications">Gérer mes notifications</a></p>
      </div>
    `;

    return {
      subject: `📊 Votre semaine communautaire : ${pointsEarned} points gagnés`,
      html: createBaseTemplate(content, "Résumé hebdomadaire"),
    };
  }
}
