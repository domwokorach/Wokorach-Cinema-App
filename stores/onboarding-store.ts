import { create } from "zustand";

interface OnboardingState {
  selectedGenres: number[];
  ratings: Record<number, "loved" | "liked" | "skip">;
  selectedProviders: number[];
  currentStep: number;

  setGenres: (genres: number[]) => void;
  addRating: (movieId: number, reaction: "loved" | "liked" | "skip") => void;
  setProviders: (providers: number[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  selectedGenres: [],
  ratings: {},
  selectedProviders: [],
  currentStep: 1,

  setGenres: (genres) => set({ selectedGenres: genres }),

  addRating: (movieId, reaction) =>
    set((state) => ({
      ratings: { ...state.ratings, [movieId]: reaction },
    })),

  setProviders: (providers) => set({ selectedProviders: providers }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 4),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  reset: () =>
    set({
      selectedGenres: [],
      ratings: {},
      selectedProviders: [],
      currentStep: 1,
    }),
}));
