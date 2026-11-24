const matrix2d = [
  [1, 2, 3],
  [4, 5, 6],
];
const arr1d = [1, 2, 3, 4, 5, 6];

export type Shape = "1d" | "2d" | "3d";
export type NumpyOp = "none" | "transpose" | "reshape" | "sum" | "dot";

// What the NumPy visualizer shows for a shape / operation
export function getNumpyDisplay(shape: Shape, opNp: NumpyOp) {
  if (shape === "1d")
    return {
      data: [arr1d],
      code: "np.array([1,2,3,4,5,6])",
      label: "Shape: (6,)",
    };
  if (shape === "3d")
    return {
      data: [
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ] as any,
      code: "np.arange(1,9).reshape(2,2,2)",
      label: "Shape: (2,2,2)",
    };
  switch (opNp) {
    case "transpose":
      return {
        data: [
          [1, 4],
          [2, 5],
          [3, 6],
        ],
        code: "arr.T",
        label: "Shape: (3,2)",
      };
    case "reshape":
      return {
        data: [
          [1, 2],
          [3, 4],
          [5, 6],
        ],
        code: "arr.reshape(3,2)",
        label: "Shape: (3,2)",
      };
    case "sum":
      return {
        data: [[5, 7, 9]],
        code: "arr.sum(axis=0)",
        label: "Shape: (3,)",
      };
    case "dot":
      return {
        data: [[14], [32]],
        code: "arr @ np.array([[1],[2],[3]])",
        label: "Shape: (2,1)",
      };
    default:
      return {
        data: matrix2d,
        code: "np.array([[1,2,3],[4,5,6]])",
        label: "Shape: (2,3)",
      };
  }
}
