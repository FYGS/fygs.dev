/**
 * Test helper: a Prisma-like `db` whose every `db.<model>.<method>(args)` call is
 * recorded and answered from a generic table, so that service code can be
 * characterised (queries issued + value returned) without a database.
 */
export type RecorderMode = "empty" | "rich";

export function createDbRecorder() {
  const calls: unknown[] = [];
  const state = { mode: "empty" as RecorderMode };

  const when = new Date("2030-01-01T00:00:00.000Z");
  const user = {
    id: "u1",
    name: "Alice",
    email: "alice@example.test",
    image: null,
    role: "STUDENT",
    createdAt: when,
    updatedAt: when,
    _count: { discussions: 2, replies: 3, followers: 4, following: 5 },
  };
  const makeRow = (i: number): Record<string, unknown> => ({
    id: `id${i}`,
    slug: `slug-${i}`,
    name: `Name ${i}`,
    title: `Title ${i}`,
    content: `Content ${i}`,
    description: "desc",
    color: "#fff",
    icon: "i",
    order: i,
    isDefault: i === 1,
    isPinned: false,
    isSolved: i === 1,
    isLocked: false,
    status: "ACTIVE",
    views: 10 * i,
    viewCount: 10 * i,
    likeCount: i,
    replyCount: i,
    points: 5 * i,
    createdAt: when,
    updatedAt: when,
    lastActivityAt: when,
    userId: "u1",
    authorId: "u1",
    topicId: "t1",
    discussionId: "d1",
    parentId: null,
    author: user,
    user,
    topic: { id: "t1", name: "Topic", slug: "topic", color: "#000", icon: "i" },
    discussion: { id: "d1", title: "D", slug: "d", topic: { slug: "topic" } },
    tags: [{ tag: { id: "tg1", name: "ts" } }],
    likes: [{ userId: "u1" }],
    bookmarks: [{ userId: "u1" }],
    followers: [{ userId: "u1" }],
    replies: [],
    badges: [],
    userBadges: [],
    stats: { totalPoints: 12, level: 2 },
    _count: {
      discussions: 2,
      replies: 3,
      followers: 4,
      following: 5,
      likes: 6,
      bookmarks: 7,
    },
  });

  const answer = (method: string) => {
    const rich = state.mode === "rich";
    switch (method) {
      case "findMany":
        return rich ? [makeRow(1), makeRow(2)] : [];
      case "findUnique":
      case "findFirst":
      case "findUniqueOrThrow":
      case "findFirstOrThrow":
        return rich ? makeRow(1) : null;
      case "count":
        return rich ? 7 : 0;
      case "groupBy":
        return rich ? [{ authorId: "u1", _count: { id: 3 }, _sum: { points: 9 } }] : [];
      case "aggregate":
        return rich ? { _sum: { points: 9 }, _count: { id: 3 }, _avg: { rating: 4 } } : {};
      default:
        return rich ? makeRow(1) : null;
    }
  };

  const db = new Proxy(
    {},
    {
      get: (_t, model: string) => {
        if (model === "$transaction") {
          return async (arg: unknown) => {
            calls.push([model]);
            return Array.isArray(arg) ? Promise.all(arg) : arg;
          };
        }
        return new Proxy(
          {},
          {
            get:
              (_m, method: string) =>
              async (args?: unknown) => {
                calls.push([`${model}.${method}`, args]);
                return answer(method);
              },
          },
        );
      },
    },
  );

  return { db, calls, state };
}
