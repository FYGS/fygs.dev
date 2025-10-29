/**
 * Client-side review actions for API interactions
 */

/**
 * Vote on a review (helpful/not helpful)
 */
export async function voteOnReview(reviewId: string, helpful: boolean) {
  try {
    const response = await fetch(`/api/reviews/${reviewId}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ helpful }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Erreur lors du vote" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Vote error:", error);
    return { success: false, error: "Erreur réseau" };
  }
}

/**
 * Reply to a review
 */
export async function replyToReview(reviewId: string, content: string) {
  try {
    const response = await fetch(`/api/reviews/${reviewId}/replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Erreur lors de la réponse",
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Reply error:", error);
    return { success: false, error: "Erreur réseau" };
  }
}

/**
 * Report a review
 */
export async function reportReview(
  reviewId: string,
  reason: string,
  description?: string
) {
  try {
    const response = await fetch(`/api/reviews/${reviewId}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason, description }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Erreur lors du signalement",
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Report error:", error);
    return { success: false, error: "Erreur réseau" };
  }
}

/**
 * Get replies for a review
 */
export async function getReviewReplies(reviewId: string) {
  try {
    const response = await fetch(`/api/reviews/${reviewId}/replies`);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Erreur lors de la récupération",
      };
    }

    return { success: true, data: data.replies || [] };
  } catch (error) {
    console.error("Get replies error:", error);
    return { success: false, error: "Erreur réseau" };
  }
}

/**
 * Get vote status for a review
 */
export async function getReviewVotes(reviewId: string) {
  try {
    const response = await fetch(`/api/reviews/${reviewId}/vote`);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Erreur lors de la récupération",
      };
    }

    return { success: true, data: data.votes || {} };
  } catch (error) {
    console.error("Get votes error:", error);
    return { success: false, error: "Erreur réseau" };
  }
}
