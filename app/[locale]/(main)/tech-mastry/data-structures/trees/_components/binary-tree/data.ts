import type { TreeNode } from "./types";

// Create a sample binary tree
export const createSampleTree = (): TreeNode => {
  return {
    value: 50,
    left: {
      value: 30,
      left: {
        value: 20,
        left: null,
        right: null,
        x: 0,
        y: 0,
      },
      right: {
        value: 40,
        left: null,
        right: null,
        x: 0,
        y: 0,
      },
      x: 0,
      y: 0,
    },
    right: {
      value: 70,
      left: {
        value: 60,
        left: null,
        right: null,
        x: 0,
        y: 0,
      },
      right: {
        value: 80,
        left: null,
        right: null,
        x: 0,
        y: 0,
      },
      x: 0,
      y: 0,
    },
    x: 0,
    y: 0,
  };
};
