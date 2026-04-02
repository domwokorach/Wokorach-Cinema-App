"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Trash2,
  SortAsc,
  Filter,
  Popcorn,
  ArrowUpDown,
} from "lucide-react";

interface WatchlistMovie {
  id: number;
  title: string;
  year: number;
  posterPath: string | null;
  voteAverage: number;
  addedAt: string;
  availableOnMyServices: boolean;
}

// Mock data
const mockWatchlist: WatchlistMovie[] = [
  {
    id: 550,
    title: "Fight Club",
    year: 1999,
    posterPath: "/pB8BM7pdSp6B6Ih7QI4S2t0PODy.jpg",
    voteAverage: 8.4,
    addedAt: "2025-12-01",
    availableOnMyServices: true,
  },
  {
    id: 680,
    title: "Pulp Fiction",
    year: 1994,
    posterPath: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    voteAverage: 8.5,
    addedAt: "2025-11-15",
    availableOnMyServices: false,
  },
  {
    id: 155,
    title: "The Dark Knight",
    year: 2008,
    posterPath: "/qJ2tW6WMUDux911BTUgMe4gkFID.jpg",
    voteAverage: 8.5,
    addedAt: "2025-10-20",
    availableOnMyServices: true,
  },
  {
    id: 13,
    title: "Forrest Gump",
    year: 1994,
    posterPath: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    voteAverage: 8.5,
    addedAt: "2025-09-05",
    availableOnMyServices: true,
  },
];

type SortOption = "date" | "alpha";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState(mockWatchlist);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [filterAvailable, setFilterAvailable] = useState(false);

  const filteredList = watchlist
    .filter((m) => !filterAvailable || m.availableOnMyServices)
    .sort((a, b) => {
      if (sortBy === "alpha") return a.title.localeCompare(b.title);
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });

  const removeFromWatchlist = (id: number) => {
    setWatchlist((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Watchlist</h1>
          <p className="mt-1 text-muted-foreground">
            {watchlist.length} movies saved
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setFilterAvailable(!filterAvailable)}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            filterAvailable
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <Filter className="h-4 w-4" />
          Available on my services
        </button>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setSortBy("date")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              sortBy === "date"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Date Added
          </button>
          <button
            onClick={() => setSortBy("alpha")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              sortBy === "alpha"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            A-Z
          </button>
        </div>
      </div>

      {/* Watchlist grid */}
      <AnimatePresence mode="popLayout">
        {filteredList.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {filteredList.map((movie) => {
              const posterUrl = movie.posterPath
                ? `https://image.tmdb.org/t/p/w342${movie.posterPath}`
                : null;

              return (
                <motion.div
                  key={movie.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card"
                >
                  <a href={`/movie/${movie.id}`}>
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
                    <div className="p-3">
                      <h3 className="font-semibold text-foreground truncate text-sm">
                        {movie.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{movie.year}</span>
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-warning text-warning" />
                          {movie.voteAverage.toFixed(1)}
                        </span>
                      </div>
                      {movie.availableOnMyServices && (
                        <span className="mt-1.5 inline-block rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                          Available
                        </span>
                      )}
                    </div>
                  </a>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromWatchlist(movie.id)}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="rounded-full bg-secondary p-6">
              <Popcorn className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-lg font-medium text-foreground">
              {filterAvailable
                ? "No movies available on your services"
                : "Your watchlist is empty"}
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {filterAvailable
                ? "Try turning off the filter to see all your saved movies."
                : "Start discovering movies and add them to your watchlist to watch later."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
