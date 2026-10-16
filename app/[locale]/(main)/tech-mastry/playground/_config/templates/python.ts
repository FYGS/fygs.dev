import type { PlaygroundTemplate } from "../../_types";

/** Python and Python data-science templates. */
export const pythonTemplates: PlaygroundTemplate[] = [
  // ─── Python Template ───────────────────────────────────────────────────────
  {
    id: "python",
    name: "Python",
    description: "Python starter with data structures and algorithms",
    icon: "FileCode",
    category: "language",
    tags: ["python", "data-science", "algorithms"],
    mainFile: "main.py",
    files: [
      {
        name: "main.py",
        path: "main.py",
        content: `# Python Playground 🐍
# Powered by Pyodide (Python in WebAssembly)

def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence up to n terms."""
    if n <= 0:
        return []
    if n == 1:
        return [0]
    
    seq = [0, 1]
    for _ in range(2, n):
        seq.append(seq[-1] + seq[-2])
    return seq

# Print Fibonacci sequence
fib = fibonacci(10)
print(f"Fibonacci(10): {fib}")

# List comprehensions
squares = [x**2 for x in range(1, 11)]
evens = [x for x in squares if x % 2 == 0]
print(f"Squares: {squares}")
print(f"Even squares: {evens}")

# Dictionaries
student = {
    "name": "Alice",
    "age": 22,
    "grades": {"math": 95, "science": 88, "english": 92}
}

avg = sum(student["grades"].values()) / len(student["grades"])
print(f"{student['name']}'s average grade: {avg:.1f}")

# Classes
class Stack:
    def __init__(self):
        self._items = []
    
    def push(self, item):
        self._items.append(item)
    
    def pop(self):
        if not self._items:
            raise IndexError("Stack is empty")
        return self._items.pop()
    
    def peek(self):
        return self._items[-1] if self._items else None
    
    def __len__(self):
        return len(self._items)
    
    def __repr__(self):
        return f"Stack({self._items})"

stack = Stack()
for i in [10, 20, 30]:
    stack.push(i)

print(f"\\nStack: {stack}")
print(f"Pop: {stack.pop()}")
print(f"Peek: {stack.peek()}")
print(f"Size: {len(stack)}")
`,
        language: "python",
        isEntryPoint: true,
      },
    ],
  },
  // ─── Python Data Science Template ──────────────────────────────────────────
  {
    id: "python-data",
    name: "Python Data Science",
    description: "Data analysis with built-in Python libraries",
    icon: "BarChart3",
    category: "language",
    tags: ["python", "data-science", "statistics"],
    mainFile: "analysis.py",
    files: [
      {
        name: "analysis.py",
        path: "analysis.py",
        content: `# Data Analysis with Python 📊
import json
import math
from collections import Counter, defaultdict

# Sample dataset
data = [
    {"name": "Alice", "age": 28, "salary": 75000, "dept": "Engineering"},
    {"name": "Bob", "age": 35, "salary": 85000, "dept": "Engineering"},
    {"name": "Charlie", "age": 42, "salary": 95000, "dept": "Management"},
    {"name": "Diana", "age": 31, "salary": 72000, "dept": "Design"},
    {"name": "Eve", "age": 26, "salary": 68000, "dept": "Design"},
    {"name": "Frank", "age": 38, "salary": 92000, "dept": "Engineering"},
    {"name": "Grace", "age": 29, "salary": 78000, "dept": "Management"},
]

# Basic statistics
salaries = [d["salary"] for d in data]
mean_salary = sum(salaries) / len(salaries)
sorted_sal = sorted(salaries)
median_salary = sorted_sal[len(sorted_sal) // 2]
std_dev = math.sqrt(sum((s - mean_salary) ** 2 for s in salaries) / len(salaries))

print("=== Salary Statistics ===")
print(f"Mean:   \${mean_salary:,.0f}")
print(f"Median: \${median_salary:,.0f}")
print(f"Std Dev: \${std_dev:,.0f}")
print(f"Range:  \${min(salaries):,} - \${max(salaries):,}")

# Group by department
dept_data = defaultdict(list)
for d in data:
    dept_data[d["dept"]].append(d["salary"])

print("\\n=== Average Salary by Department ===")
for dept, sals in sorted(dept_data.items()):
    avg = sum(sals) / len(sals)
    print(f"  {dept}: \${avg:,.0f} ({len(sals)} employees)")

# Age distribution
age_groups = Counter()
for d in data:
    group = f"{(d['age'] // 10) * 10}s"
    age_groups[group] += 1

print("\\n=== Age Distribution ===")
for group, count in sorted(age_groups.items()):
    bar = "█" * (count * 5)
    print(f"  {group}: {bar} ({count})")
`,
        language: "python",
        isEntryPoint: true,
      },
    ],
  },
];
