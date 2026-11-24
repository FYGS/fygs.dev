import type { Project } from "../../types";

export const schoolManagement: Project = {
  id: "school-management",
  title: "School Management System",
  description:
    "A comprehensive School Management System designed to streamline administrative tasks, enhance communication, and improve overall efficiency in educational institutions. Features include student management, attendance tracking, grade management, and parent communication portal.",
  image: "/projects/school-management.png",
  detailImages: [
    {
      url: "/projects/school-management-admin-assignments.png",
      alt: "School Management Admin Assignments Dashboard",
    },
    {
      url: "/projects/school-management-admin-classes.png",
      alt: "School Management Admin Classes Dashboard",
    },
    {
      url: "/projects/school-management-admin-classes-update.png",
      alt: "School Management Admin Classes Update Dashboard",
    },
    {
      url: "/projects/school-management-admin-exams.png",
      alt: "School Management Admin Exams Dashboard",
    },
    {
      url: "/projects/school-management-admin-exams-update.png",
      alt: "School Management Admin Exams Update Dashboard",
    },
    {
      url: "/projects/school-management-admin-home.png",
      alt: "School Management Admin Home Dashboard",
    },
    {
      url: "/projects/school-management-admin-lessons.png",
      alt: "School Management Admin Lessons Dashboard",
    },
    {
      url: "/projects/school-management-admin-parents.png",
      alt: "School Management Admin Parents Dashboard",
    },
    {
      url: "/projects/school-management-admin-results.png",
      alt: "School Management Admin Results Dashboard",
    },
    {
      url: "/projects/school-management-admin-students.png",
      alt: "School Management Admin Students Dashboard",
    },
    {
      url: "/projects/school-management-admin-students-detail.png",
      alt: "School Management Admin Students Detail Dashboard",
    },
    {
      url: "/projects/school-management-admin-students-detail-update.png",
      alt: "School Management Admin Students Detail Update Dashboard",
    },
    {
      url: "/projects/school-management-admin-subjects.png",
      alt: "School Management Admin Subjects Dashboard",
    },
    {
      url: "/projects/school-management-admin-subjects-update.png",
      alt: "School Management Admin Subjects Update Dashboard",
    },
    {
      url: "/projects/school-management-admin-teachers.png",
      alt: "School Management Admin Teachers Dashboard",
    },
    {
      url: "/projects/school-management-admin-teachers-detail.png",
      alt: "School Management Admin Teachers Detail Dashboard",
    },
    {
      url: "/projects/school-management-admin-teachers-delete-prevent.png",
      alt: "School Management Admin Teachers Delete Prevent Dashboard",
    },
  ],
  technologies: [
    "Next.js",
    "TypeScript",
    "Prisma",
    "PostgreSQL",
    "TailwindCSS",
  ],
  link: "https://school-management-app-psi.vercel.app",
  githubUrl: "https://github.com/fygs/school-management-system",
  stats: {
    stars: 750,
    forks: 35,
    contributors: 1,
    linesOfCode: 3000,
  },
  features: [
    "👧 Student information management",
    "🕰️ Attendance tracking system",
    "🎓 Grade management",
    "📨 Parent communication portal",
    "📊 Administrative dashboard",
  ],
  technicalDetails:
    "Built with Next.js 14 App Router, using Prisma as ORM with PostgreSQL database. Implements real-time updates with WebSocket for attendance and grade notifications.",
  challenges:
    "Implementing a scalable database schema that could handle complex relationships between students, classes, and grades while maintaining optimal performance.",
};
