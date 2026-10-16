import type { Action, VisualizationState } from "./types";

// Reducer function
export function reducer(
  state: VisualizationState,
  action: Action
): VisualizationState {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        tree: action.payload.tree,
        traversalSteps: action.payload.steps,
        currentStep: -1,
        isPlaying: false,
        initialized: true,
      };
    case "SET_TRAVERSAL":
      return {
        ...state,
        traversalSteps: action.payload.steps,
        currentStep: -1,
        isPlaying: false,
      };
    case "SET_CURRENT_STEP":
      return {
        ...state,
        currentStep: action.payload,
      };
    case "PLAY":
      return {
        ...state,
        isPlaying: true,
      };
    case "PAUSE":
      return {
        ...state,
        isPlaying: false,
      };
    case "RESET":
      return {
        ...state,
        currentStep: -1,
        isPlaying: false,
      };
    case "STEP_FORWARD":
      if (state.currentStep < state.traversalSteps.length - 1) {
        return {
          ...state,
          currentStep: state.currentStep + 1,
        };
      }
      return state;
    case "STEP_BACKWARD":
      if (state.currentStep > 0) {
        return {
          ...state,
          currentStep: state.currentStep - 1,
        };
      }
      return state;
    case "SKIP_TO_END":
      return {
        ...state,
        currentStep: state.traversalSteps.length - 1,
        isPlaying: false,
      };
    case "SET_SPEED":
      return {
        ...state,
        speed: action.payload,
      };
    case "UPDATE_TREE":
      return {
        ...state,
        tree: action.payload,
      };
    default:
      return state;
  }
}
