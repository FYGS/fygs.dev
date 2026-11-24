export type Op = "none" | "filter" | "sort" | "groupby" | "select" | "mutate";

export const INITIAL_DATA = [
  { id: 1, name: "Alice", age: 28, salary: 55000, dept: "Eng" },
  { id: 2, name: "Bob", age: 34, salary: 72000, dept: "Sales" },
  { id: 3, name: "Claire", age: 25, salary: 48000, dept: "Eng" },
  { id: 4, name: "David", age: 41, salary: 91000, dept: "Mgmt" },
  { id: 5, name: "Eva", age: 30, salary: 63000, dept: "Sales" },
  { id: 6, name: "Frank", age: 37, salary: 85000, dept: "Eng" },
];

export const OP_CODE: Record<Op, string> = {
  none: "df",
  filter: 'df[df["salary"] > 60000]',
  sort: 'df.sort_values("age")',
  groupby:
    'df.groupby("dept").agg(count=("id","count"), avgSalary=("salary","mean"))',
  select: 'df[["name", "salary"]]',
  mutate: 'df.assign(bonus=df["salary"] * 0.1)',
};

// Apply a pandas-like operation to the data
export function applyOp(op: Op, initialData: typeof INITIAL_DATA) {
  switch (op) {
    case "filter":
      return initialData.filter((r) => r.salary > 60000);
    case "sort":
      return [...initialData].sort((a, b) => a.age - b.age);
    case "select":
      return initialData.map(({ name, salary }) => ({
        name,
        salary,
      })) as any[];
    case "mutate":
      return initialData.map((r) => ({
        ...r,
        bonus: Math.round(r.salary * 0.1),
      }));
    case "groupby":
      const groups: Record<string, { count: number; avgSalary: number }> = {};
      initialData.forEach((r) => {
        if (!groups[r.dept]) groups[r.dept] = { count: 0, avgSalary: 0 };
        groups[r.dept].count++;
        groups[r.dept].avgSalary += r.salary;
      });
      return Object.entries(groups).map(([dept, v]) => ({
        dept,
        count: v.count,
        avgSalary: Math.round(v.avgSalary / v.count),
      }));
    default:
      return initialData;
  }
}
