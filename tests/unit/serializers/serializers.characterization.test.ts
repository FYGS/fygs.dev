/**
 * Characterization tests: lib/serialization-utils.ts and
 * lib/serializers/course-serializer.ts
 *
 * Snapshots of the CURRENT output over realistic Prisma-shaped payloads
 * (Decimal, Date, null / missing relations). They guard the removal of `any`
 * typing in refactor stage 4: output must not change.
 */
import { describe, it, expect } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";
import {
  safeNumber,
  serializeRevenueData,
  serializeUserGrowthData,
  serializeCourse,
} from "@/lib/serialization-utils";
import {
  serializeCourseSummary,
  serializeCourseDetail,
  serializeFeatured,
} from "@/lib/serializers/course-serializer";

describe("safeNumber", () => {
  it("converts every supported input the way it does today", () => {
    const out = {
      null: safeNumber(null),
      undefined: safeNumber(undefined),
      number: safeNumber(12.5),
      decimal: safeNumber(new Decimal("19.99")),
      bigint: safeNumber(BigInt(42)),
      numericString: safeNumber("3.5"),
      junkString: safeNumber("abc"),
      objectWithToString: safeNumber({ toString: () => "7" }),
      objectJunk: safeNumber({}),
      nan: safeNumber(Number.NaN),
      booleanTrue: safeNumber(true),
    };
    expect(out).toMatchInlineSnapshot(`
      {
        "bigint": 42,
        "booleanTrue": 1,
        "decimal": 19.99,
        "junkString": 0,
        "nan": 0,
        "null": 0,
        "number": 12.5,
        "numericString": 3.5,
        "objectJunk": 0,
        "objectWithToString": 7,
        "undefined": 0,
      }
    `);
  });
});

describe("serializeRevenueData / serializeUserGrowthData", () => {
  const month = new Date("2025-03-01T00:00:00.000Z");

  it("serializes revenue rows, including the derived average order value", () => {
    const rows = serializeRevenueData([
      { month, revenue: new Decimal("100.50"), transactions: BigInt(3) },
      { month, revenue: 40, transactions: 2, avg_order_value: new Decimal("25") },
      { month, revenue: 0, transactions: 0 },
    ]);
    expect(rows).toMatchInlineSnapshot(`
      [
        {
          "avg_order_value": 33.5,
          "month": 2025-03-01T00:00:00.000Z,
          "revenue": 100.5,
          "transactions": 3,
        },
        {
          "avg_order_value": 25,
          "month": 2025-03-01T00:00:00.000Z,
          "revenue": 40,
          "transactions": 2,
        },
        {
          "avg_order_value": 0,
          "month": 2025-03-01T00:00:00.000Z,
          "revenue": 0,
          "transactions": 0,
        },
      ]
    `);
  });

  it("serializes user growth rows", () => {
    expect(
      serializeUserGrowthData([
        { month, new_users: BigInt(5), total_users: "120" },
        { month, new_users: null, total_users: undefined },
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "month": 2025-03-01T00:00:00.000Z,
          "new_users": 5,
          "total_users": 120,
        },
        {
          "month": 2025-03-01T00:00:00.000Z,
          "new_users": 0,
          "total_users": 0,
        },
      ]
    `);
  });
});

describe("serializeCourse (admin)", () => {
  it("adds counts, average rating and ISO dates", () => {
    const course = {
      id: "c1",
      title: "Course",
      price: new Decimal("49.90"),
      createdAt: new Date("2025-01-01T10:00:00.000Z"),
      updatedAt: new Date("2025-02-01T10:00:00.000Z"),
      enrollments: [{ id: "e1" }, { id: "e2" }],
      reviews: [{ rating: 5 }, { rating: 4 }, { rating: 4 }],
    };
    expect(serializeCourse(course)).toMatchInlineSnapshot(`
      {
        "averageRating": 4.333333333333333,
        "createdAt": "2025-01-01T10:00:00.000Z",
        "enrollmentCount": 2,
        "enrollments": [
          {
            "id": "e1",
          },
          {
            "id": "e2",
          },
        ],
        "id": "c1",
        "price": 49.9,
        "reviews": [
          {
            "rating": 5,
          },
          {
            "rating": 4,
          },
          {
            "rating": 4,
          },
        ],
        "title": "Course",
        "totalRevenue": 0,
        "updatedAt": "2025-02-01T10:00:00.000Z",
      }
    `);
  });

  it("defaults counts and rating when relations are missing", () => {
    const course = {
      id: "c2",
      price: null,
      createdAt: new Date("2025-01-01T10:00:00.000Z"),
      updatedAt: new Date("2025-01-01T10:00:00.000Z"),
    };
    const out = serializeCourse(course);
    expect({
      price: out.price,
      enrollmentCount: out.enrollmentCount,
      averageRating: out.averageRating,
      totalRevenue: out.totalRevenue,
    }).toMatchInlineSnapshot(`
      {
        "averageRating": 0,
        "enrollmentCount": 0,
        "price": 0,
        "totalRevenue": 0,
      }
    `);
  });
});

const baseCourse = () => ({
  id: "c1",
  title: "Next.js",
  slug: "nextjs",
  description: "desc",
  thumbnail: "/t.png",
  price: new Decimal("29.99"),
  level: "BEGINNER",
  category: "JAVASCRIPT",
  duration: 120,
  featured: true,
  accessTier: "FREE",
  previewEnabled: true,
  enrollments: [{ id: "e1" }, { id: "e2" }, { id: "e3" }],
  reviews: [
    {
      id: "r1",
      userId: "u1",
      courseId: "c1",
      rating: 5,
      comment: "great",
      createdAt: new Date("2025-01-02T00:00:00.000Z"),
      updatedAt: new Date("2025-01-03T00:00:00.000Z"),
      user: { name: "Ada", image: "/a.png" },
    },
    {
      id: "r2",
      userId: "u2",
      courseId: "c1",
      rating: 4,
      comment: "",
      createdAt: new Date("2025-01-04T00:00:00.000Z"),
      updatedAt: new Date("2025-01-04T00:00:00.000Z"),
      user: null,
    },
  ],
  tags: [{ tag: { id: "t1", name: "react", color: "#61dafb" } }],
  lessons: [
    { id: "l2", title: "Two", slug: "two", order: 2, moduleId: null },
    { id: "l1", title: "One", slug: "one", order: 1, moduleId: null, duration: 5 },
    { id: "l3", title: "InModule", slug: "in-module", order: 1, moduleId: "m1" },
  ],
  modules: [
    {
      id: "m1",
      title: "Mod",
      slug: "mod",
      order: 1,
      courseId: "c1",
      lessons: [{ id: "l3", title: "InModule", slug: "in-module", order: 1, moduleId: "m1" }],
    },
  ],
  quizzes: [
    {
      id: "q1",
      moduleId: "m1",
      title: "Quiz",
      questions: [
        { id: "qq1", question: "?", options: ["a", "b"], correct: 0, order: 1 },
      ],
    },
  ],
  visualSupports: [{ id: "v1", title: "Diagram", moduleId: "m1", order: 1, content: "<svg/>" }],
  publicStructure: null,
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-02-01T00:00:00.000Z"),
});

describe("serializeCourseSummary / serializeFeatured", () => {
  it("summarises a course with standalone lessons", () => {
    expect(serializeCourseSummary(baseCourse())).toMatchInlineSnapshot(`
      {
        "averageRating": 4.5,
        "category": "JAVASCRIPT",
        "description": "desc",
        "duration": 120,
        "enrollmentCount": 3,
        "featured": true,
        "firstLessonSlug": "one",
        "hasEntitlement": undefined,
        "id": "c1",
        "isEnrolled": undefined,
        "isInSubscription": undefined,
        "isUnlocked": undefined,
        "level": "BEGINNER",
        "previewEnabled": true,
        "price": 29.99,
        "requiredTier": "FREE",
        "slug": "nextjs",
        "tags": [
          {
            "color": "#61dafb",
            "id": "t1",
            "name": "react",
          },
        ],
        "thumbnail": "/t.png",
        "title": "Next.js",
      }
    `);
  });

  it("falls back to the first module lesson when there are no standalone lessons", () => {
    const course = { ...baseCourse(), lessons: [] as unknown[] };
    expect(serializeCourseSummary(course).firstLessonSlug).toMatchInlineSnapshot(`"in-module"`);
  });

  it("handles a bare course (no relations, no price)", () => {
    const bare = {
      id: "c9",
      title: "Bare",
      slug: "bare",
      description: "",
      thumbnail: null,
      price: null,
      level: "BEGINNER",
      category: "JAVASCRIPT",
      featured: false,
      accessTier: "FREE",
      previewEnabled: false,
    };
    expect(serializeCourseSummary(bare)).toMatchInlineSnapshot(`
      {
        "averageRating": 0,
        "category": "JAVASCRIPT",
        "description": "",
        "duration": null,
        "enrollmentCount": 0,
        "featured": false,
        "firstLessonSlug": null,
        "hasEntitlement": undefined,
        "id": "c9",
        "isEnrolled": undefined,
        "isInSubscription": undefined,
        "isUnlocked": undefined,
        "level": "BEGINNER",
        "previewEnabled": false,
        "price": 0,
        "requiredTier": "FREE",
        "slug": "bare",
        "tags": [],
        "thumbnail": null,
        "title": "Bare",
      }
    `);
  });

  it("serializeFeatured is identical to serializeCourseSummary", () => {
    expect(serializeFeatured(baseCourse())).toEqual(
      serializeCourseSummary(baseCourse()),
    );
  });
});

describe("serializeCourseDetail", () => {
  it("serializes lessons, modules, reviews, quizzes and dates", () => {
    expect(serializeCourseDetail(baseCourse())).toMatchInlineSnapshot(`
      {
        "averageRating": 4.5,
        "category": "JAVASCRIPT",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "description": "desc",
        "duration": 120,
        "enrollmentCount": 3,
        "featured": true,
        "firstLessonSlug": "one",
        "hasEntitlement": undefined,
        "id": "c1",
        "isEnrolled": undefined,
        "isInSubscription": undefined,
        "isUnlocked": undefined,
        "lessons": [
          {
            "description": null,
            "duration": null,
            "id": "l2",
            "moduleId": null,
            "order": 2,
            "slug": "two",
            "title": "Two",
          },
          {
            "description": null,
            "duration": 5,
            "id": "l1",
            "moduleId": null,
            "order": 1,
            "slug": "one",
            "title": "One",
          },
          {
            "description": null,
            "duration": null,
            "id": "l3",
            "moduleId": "m1",
            "order": 1,
            "slug": "in-module",
            "title": "InModule",
          },
        ],
        "level": "BEGINNER",
        "modules": [
          {
            "courseId": "c1",
            "id": "m1",
            "lessons": [
              {
                "description": null,
                "duration": null,
                "id": "l3",
                "moduleId": "m1",
                "order": 1,
                "slug": "in-module",
                "title": "InModule",
              },
            ],
            "order": 1,
            "slug": "mod",
            "title": "Mod",
          },
        ],
        "previewEnabled": true,
        "price": 29.99,
        "publicEvaluation": null,
        "publicPrerequisites": null,
        "publicResources": null,
        "publicStructure": null,
        "quizzes": [
          {
            "id": "q1",
            "moduleId": "m1",
            "questions": [
              {
                "correct": 0,
                "explanation": null,
                "id": "qq1",
                "options": [
                  "a",
                  "b",
                ],
                "order": 1,
                "question": "?",
              },
            ],
            "title": "Quiz",
          },
        ],
        "requiredTier": "FREE",
        "reviews": [
          {
            "comment": "great",
            "courseId": "c1",
            "createdAt": "2025-01-02T00:00:00.000Z",
            "id": "r1",
            "rating": 5,
            "updatedAt": "2025-01-03T00:00:00.000Z",
            "user": {
              "image": "/a.png",
              "name": "Ada",
            },
            "userId": "u1",
          },
          {
            "comment": null,
            "courseId": "c1",
            "createdAt": "2025-01-04T00:00:00.000Z",
            "id": "r2",
            "rating": 4,
            "updatedAt": "2025-01-04T00:00:00.000Z",
            "user": {
              "image": null,
              "name": "Utilisateur anonyme",
            },
            "userId": "u2",
          },
        ],
        "slug": "nextjs",
        "tags": [
          {
            "color": "#61dafb",
            "id": "t1",
            "name": "react",
          },
        ],
        "thumbnail": "/t.png",
        "title": "Next.js",
        "updatedAt": "2025-02-01T00:00:00.000Z",
        "visualSupports": [
          {
            "content": "<svg/>",
            "id": "v1",
            "moduleId": "m1",
            "order": 1,
            "title": "Diagram",
          },
        ],
      }
    `);
  });
});
