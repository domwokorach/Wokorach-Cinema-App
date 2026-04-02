"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecommendationStore, type Recommendation } from "@/stores/recommendation-store";

const moodChips = [
  { label: "Tense", emoji: "😰" },
  { label: "Cozy", emoji: "🛋️" },
  { label: "Mind-bending", emoji: "🌀" },
  { label: "Feel-good", emoji: "😊" },
  { label: "Dark", emoji: "🌑" },
  { label: "Light-hearted", emoji: "☀️" },
];

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-card overflow-hidden">
      <div className="aspect-[2/3] bg-secondary" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-secondary" />
        <div className="h-3 w-1/2 rounded bg-secondary" />
        <div className="h-3 w-full rounded bg-secondary" />
      </div>
    </div>
  );
}

function MovieCard({ movie }: { movie: Recommendation }) {
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w342${movie.posterPath}`
    : null;

  return (
    <motion.a
      href={`/movie/${movie.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50"
    >
      <div className="aspect-[2/3] overflow-hidden bg-secondary">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No Poster
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground truncate">
          {movie.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{movie.year}</span>
          {movie.voteAverage > 0 && (
            <>
              <span>-</span>
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                {movie.voteAverage.toFixed(1)}
              </span>
            </>
          )}
        </div>
        {movie.reason && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
            {movie.reason}
          </p>
        )}
      </div>
    </motion.a>
  );
}

export default function DiscoverPage() {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { recommendations, isLoading, setQuery, setLoading, setRecommendations } =
    useRecommendationStore();

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSubmit = async (query: string) => {
    if (!query.trim()) return;
    setQuery(query);
    setInputValue("");
    setLoading(true);

    // Simulate API call - in production this calls the recommendation API
    setTimeout(() => {
      const mockResults: Recommendation[] = [
        {
          id: 550,
          title: "Fight Club",
          year: 1999,
          posterPath: "/pB8BM7pdSp6B6Ih7QI4S2t0PODy.jpg",
          backdropPath: "/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg",
          overview: "A ticking-Loss bomb insomniac and a slippery soap salesman...",
          voteAverage: 8.4,
          genreIds: [18, 53],
          reason: "Matches your love for mind-bending thrillers with dark undertones.",
        },
        {
          id: 680,
          title: "Pulp Fiction",
          year: 1994,
          posterPath: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
          backdropPath: null,
          overview: "The lives of two mob hitmen, a boxer, a gangster...",
          voteAverage: 8.5,
          genreIds: [53, 80],
          reason: "Its non-linear storytelling and dark humor match your taste.",
        },
      ];
      setRecommendations(mockResults);
      setLoading(false);
    }, 2000);
  };

  const handleChipClick = (label: string) => {
    const query = `I'm in the mood for something ${label.toLowerCase()}`;
    setInputValue(query);
    handleSubmit(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(inputValue);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Discover</h1>
        <p className="mt-1 text-muted-foreground">
          Tell us what you are in the mood for
        </p>
      </div>

      {/* Chat input */}
      <div className="space-y-4">
        <div className="relative rounded-xl border border-border bg-card p-1">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you're in the mood for..."
            rows={1}
            className="w-full resize-none bg-transparent px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={() => handleSubmit(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="absolute bottom-3 right-3 rounded-lg bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Mood chips */}
        <div className="flex flex-wrap gap-2">
          {moodChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleChipClick(chip.label)}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {chip.emoji} {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </motion.div>
        ) : recommendations.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Recommendations
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {recommendations.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="rounded-full bg-secondary p-6">
              <Sparkles className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-lg font-medium text-foreground">
              Describe what you are in the mood for
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Tell us about your mood, favorite films, or what kind of
              experience you are looking for. Our AI will find the perfect match.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
