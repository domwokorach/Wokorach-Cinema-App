import { create } from "zustand";

export interface Recommendation {
  id: number;
  title: string;
  year: number;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  voteAverage: number;
  genreIds: number[];
  reason?: string;
}

interface RecommendationState {
  recommendations: Recommendation[];
  isLoading: boolean;
  query: string;
  sessionId: string;

  setQuery: (query: string) => void;
  setRecommendations: (recommendations: Recommendation[]) => void;
  addRecommendations: (recommendations: Recommendation[]) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const useRecommendationStore = create<RecommendationState>((set) => ({
  recommendations: [],
  isLoading: false,
  query: "",
  sessionId: generateSessionId(),

  setQuery: (query) => set({ query }),

  setRecommendations: (recommendations) => set({ recommendations }),

  addRecommendations: (recommendations) =>
    set((state) => ({
      recommendations: [...state.recommendations, ...recommendations],
    })),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () =>
    set({
      recommendations: [],
      isLoading: false,
      query: "",
      sessionId: generateSessionId(),
    }),
}));
