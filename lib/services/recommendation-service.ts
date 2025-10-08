import { db } from "@/lib/db";
import { serializeCourseSummary } from "@/lib/serializers/course-serializer";
import { CourseRepository } from "@/lib/repositories/course-repository";

interface WeightMaps {
  category: Map<string, number>;
  level: Map<string, number>;
  tag: Map<string, number>;
}

function decayWeight(days: number, halfLifeDays = 14) {
  // Exponential decay: weight * 0.5 every halfLifeDays
  return Math.pow(0.5, days / halfLifeDays);
}

function bump(map: Map<string, number>, key: string, amount = 1) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + amount);
}

export class RecommendationService {
  /**
   * Basic recommendation strategy:
   * 1. Collect user preference vectors (categories, tags, levels)
   * 2. Score published, not-enrolled courses by overlap + featured + rating
   * 3. Return top N serialized summaries
   */
  static async recommendCourses(userId: string, limit = 3) {
    // Pull core behavioral signals
    const [enrollments, progresses, events] = await Promise.all([
      db.enrollment.findMany({
        where: { userId },
        select: { course: { select: { id: true, category: true, level: true, tags: { include: { tag: true } } } }, enrolledAt: true }
      }),
      db.progress.findMany({
        where: { userId, completed: true },
        select: { completedAt: true, lesson: { select: { course: { select: { id: true, category: true, level: true, tags: { include: { tag: true } } } } } } }
      }),
      db.analyticsEvent.findMany({
        where: { userId, createdAt: { gte: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) } }, // last 45 days
        select: { type: true, createdAt: true, properties: true }
      }).catch(() => [])
    ]);

    const weights: WeightMaps = {
      category: new Map(),
      level: new Map(),
      tag: new Map(),
    };

    const now = Date.now();

    // Base preferences from enrollments (strong signal)
    for (const e of enrollments) {
      const c = e.course;
      bump(weights.category, c.category, 5);
      bump(weights.level, c.level, 3);
      for (const t of c.tags) bump(weights.tag, t.tag.name, 2);
    }

    // Completions reinforce interest with recency decay
    for (const p of progresses) {
      const c = p.lesson.course;
      const days = p.completedAt ? (now - p.completedAt.getTime()) / 86400000 : 30;
      const factor = decayWeight(days);
      bump(weights.category, c.category, 4 * factor);
      bump(weights.level, c.level, 2 * factor);
      for (const t of c.tags) bump(weights.tag, t.tag.name, 1.5 * factor);
    }

    // Analytics events (preview interest, recommendation clicks, subscription start, refunds)
    for (const ev of events) {
      const days = (now - ev.createdAt.getTime()) / 86400000;
      const factor = decayWeight(days, 21); // slightly slower decay for explicit events
      switch (ev.type) {
        case 'PREVIEW_VIEWED': {
          const cat = (ev.properties as any)?.category;
          const lvl = (ev.properties as any)?.level;
          const tags: string[] = (ev.properties as any)?.tags || [];
          if (cat) bump(weights.category, cat, 2 * factor);
          if (lvl) bump(weights.level, lvl, 1.5 * factor);
          tags.forEach(tag => bump(weights.tag, tag, 1 * factor));
          break;
        }
        case 'RECOMMENDATION_CLICKED': {
          const cat = (ev.properties as any)?.category;
          const lvl = (ev.properties as any)?.level;
          const tags: string[] = (ev.properties as any)?.tags || [];
          if (cat) bump(weights.category, cat, 4 * factor);
          if (lvl) bump(weights.level, lvl, 2 * factor);
          tags.forEach(tag => bump(weights.tag, tag, 2 * factor));
          break;
        }
        case 'SUBSCRIPTION_STARTED': {
          // Light global boost to advanced categories since user invested
          for (const [k, v] of weights.level.entries()) {
            weights.level.set(k, v * 1.05);
          }
          break;
        }
        case 'COURSE_REFUNDED': {
          const cat = (ev.properties as any)?.category;
          if (cat) {
            // Slight negative weight (don't oversurface refunded domain soon)
            bump(weights.category, cat, -3 * factor);
          }
          break;
        }
      }
    }

    // Candidate courses: published not yet enrolled
    const candidateCourses = await db.course.findMany({
      where: { published: true, enrollments: { none: { userId } } },
      include: CourseRepository.baseIncludes(),
      take: 60,
    });

    // Score function (multi-factor)
    const scoreCourse = (course: any) => {
      let score = 0;
      score += (weights.category.get(course.category) || 0) * 3;
      score += (weights.level.get(course.level) || 0) * 2;
      for (const ct of course.tags) score += (weights.tag.get(ct.tag.name) || 0) * 1.2;
      if (course.featured) score += 3;
      // Rating (diminishing returns)
      const avg = course.reviews?.length ? course.reviews.reduce((s: number, r: any) => s + r.rating, 0) / course.reviews.length : 0;
      score += Math.sqrt(avg) * 1.5; // sqrt softens extremes
      // Popularity (enrollments) with log scaling to avoid runaway
      score += Math.log10(1 + course.enrollments.length) * 2;
      return score;
    };

    const ranked = candidateCourses.map(c => ({ course: c, score: scoreCourse(c) }));

    // Diversity enforcement: if too many top from same category, penalize subsequent ones
    const categoryCounts: Record<string, number> = {};
    ranked.sort((a, b) => b.score - a.score);
    for (const item of ranked) {
      const cat = item.course.category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      if (categoryCounts[cat] > 2) {
        // Penalize duplicates after 2 appearances
        item.score *= 0.88 ** (categoryCounts[cat] - 2);
      }
    }
    ranked.sort((a, b) => b.score - a.score);

    return ranked.slice(0, limit).map(r => serializeCourseSummary(r.course));
  }
}