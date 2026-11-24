import { describe, it, expect } from "vitest";
import {
  INITIAL_DATA,
  OP_CODE,
  applyOp,
} from "@/app/[locale]/(main)/tech-mastry/data-science/python-data/_components/dataframe-ops";
import { getNumpyDisplay } from "@/app/[locale]/(main)/tech-mastry/data-science/python-data/_components/numpy-display";
import { CLEANING_PIPELINE_CODE, PIPELINE_STEPS } from "@/app/[locale]/(main)/tech-mastry/data-science/python-data/_data/cleaning-pipeline";
import { essentialLibs, pandasOps } from "@/app/[locale]/(main)/tech-mastry/data-science/python-data/_data/content";

describe("python data page - DataFrame operations", () => {
  it("returns the original data by default", () => {
    expect(applyOp("none", INITIAL_DATA)).toBe(INITIAL_DATA);
  });

  it("filters, sorts, selects and mutates without touching the source", () => {
    const before = JSON.stringify(INITIAL_DATA);
    expect(applyOp("filter", INITIAL_DATA).map((r) => r.name)).toEqual(["Bob", "David", "Eva", "Frank"]);
    expect(applyOp("sort", INITIAL_DATA).map((r) => r.age)).toEqual([25, 28, 30, 34, 37, 41]);
    expect(applyOp("select", INITIAL_DATA)[0]).toEqual({ name: "Alice", salary: 55000 });
    expect(applyOp("mutate", INITIAL_DATA)[1]).toMatchObject({ name: "Bob", bonus: 7200 });
    expect(JSON.stringify(INITIAL_DATA)).toBe(before);
  });

  it("groups by department with the rounded average salary", () => {
    expect(applyOp("groupby", INITIAL_DATA)).toEqual([
      { dept: "Eng", count: 3, avgSalary: 62667 },
      { dept: "Sales", count: 2, avgSalary: 67500 },
      { dept: "Mgmt", count: 1, avgSalary: 91000 },
    ]);
  });

  it("has a code sample for every operation", () => {
    expect(Object.keys(OP_CODE)).toEqual(["none", "filter", "sort", "groupby", "select", "mutate"]);
  });
});

describe("python data page - NumPy display", () => {
  it("depends on the shape first, then on the operation", () => {
    expect(getNumpyDisplay("1d", "dot")).toEqual({
      data: [[1, 2, 3, 4, 5, 6]],
      code: "np.array([1,2,3,4,5,6])",
      label: "Shape: (6,)",
    });
    expect(getNumpyDisplay("3d", "none").label).toBe("Shape: (2,2,2)");
    expect(getNumpyDisplay("2d", "transpose")).toMatchObject({ code: "arr.T", label: "Shape: (3,2)" });
    expect(getNumpyDisplay("2d", "sum").data).toEqual([[5, 7, 9]]);
    expect(getNumpyDisplay("2d", "dot").data).toEqual([[14], [32]]);
    expect(getNumpyDisplay("2d", "none")).toMatchObject({ code: "np.array([[1,2,3],[4,5,6]])", label: "Shape: (2,3)" });
  });
});

describe("python data page - content", () => {
  it("keeps the reference data", () => {
    expect(essentialLibs.map((l) => l.name)).toEqual(["NumPy", "Pandas", "Polars", "Matplotlib", "Seaborn", "Scikit-learn", "Jupyter"]);
    expect(pandasOps).toHaveLength(10);
    expect(PIPELINE_STEPS).toHaveLength(7);
    expect(CLEANING_PIPELINE_CODE.startsWith("import pandas as pd\n")).toBe(true);
    expect(CLEANING_PIPELINE_CODE.endsWith('df.to_parquet("clean_data.parquet", index=False)')).toBe(true);
  });
});
