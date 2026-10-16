// Types
export interface Lesson {
  id: string;
  title: string;
  slug: string;
  order: number;
  published: boolean;
  duration: number | null;
}

export interface Module {
  id: string;
  title: string;
  slug: string;
  order: number;
  lessons: Lesson[];
}

export interface CurriculumTabProps {
  courseId: string;
  modules: Module[];
}
