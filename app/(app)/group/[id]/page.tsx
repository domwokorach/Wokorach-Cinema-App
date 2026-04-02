"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Share2,
  Sparkles,
  Star,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

// Mock data
const mockGroup = {
  id: "grp-1",
  name: "Friday Night Crew",
  inviteCode: "CINE-XK7R",
  members: [
    { id: "u1", name: "Alice", avatar: null },
    { id: "u2", name: "Bob", avatar: null },
    { id: "u3", name: "Carol", avatar: null },
    { id: "u4", name: "Dave", avatar: null },
  ],
  mergedTaste: {
    topGenres: ["Thriller", "Comedy", "Sci-Fi"],
    commonThemes: ["redemption", "friendship", "adventure"],
  },
};

const mockGroupRecommendations = [
  {
    id: 27205,
    title: "Inception",
    year: 2010,
    posterPath: "/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
    voteAverage: 8.4,
    reason: "Matches the group's shared love of cerebral sci-fi.",
  },
  {
    id: 550,
    title: "Fight Club",
    year: 1999,
    posterPath: "/pB8BM7pdSp6B6Ih7QI4S2t0PODy.jpg",
    voteAverage: 8.4,
    reason: "Dark humor and twist endings appeal to all members.",
  },
];

export default function GroupSessionPage() {
  const [recommendations, setRecommendations] = useState<typeof mockGroupRecommendations>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const group = mockGroup;

  const handleGetRecommendations = () => {
    setIsLoading(true);
    setTimeout(() => {
      setRecommendations(mockGroupRecommendations);
      setIsLoading(false);
    }, 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/group/join?code=${group.inviteCode}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/group"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Groups
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {group.members.length} members
          </p>
        </div>
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-success" />
              Copied
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              Share Invite
            </>
          )}
        </button>
      </div>

      {/* Members */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Members</h2>
        <div className="flex flex-wrap gap-3">
          {group.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                {member.name[0]}
              </div>
              <span className="text-sm text-foreground">{member.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Merged Taste Visualization */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Group Taste Profile
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Shared Top Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.mergedTaste.topGenres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Common Themes
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.mergedTaste.commonThemes.map((theme) => (
                <span
                  key={theme}
                  className="rounded-full border border-border bg-secondary px-3 py-1 text-sm text-foreground"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Get Recommendations */}
      <div className="flex justify-center">
        <button
          onClick={handleGetRecommendations}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Sparkles className="h-5 w-5" />
          {isLoading ? "Finding movies..." : "Get Group Recommendations"}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-border bg-card p-4"
              >
                <div className="flex gap-4">
                  <div className="h-32 w-24 rounded-lg bg-secondary" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-3/4 rounded bg-secondary" />
                    <div className="h-3 w-1/2 rounded bg-secondary" />
                    <div className="h-3 w-full rounded bg-secondary" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {!isLoading && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-foreground">
              Recommendations for the Group
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {recommendations.map((movie) => {
                const posterUrl = movie.posterPath
                  ? `https://image.tmdb.org/t/p/w200${movie.posterPath}`
                  : null;

                return (
                  <Link
                    key={movie.id}
                    href={`/movie/${movie.id}`}
                    className="flex gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
                  >
                    <div className="h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {posterUrl ? (
                        <img
                          src={posterUrl}
                          alt={movie.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          No Poster
                        </div>
                      )}
                    </div>
                    <div className="flex-1 py-1">
                      <h3 className="font-semibold text-foreground">
                        {movie.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{movie.year}</span>
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-warning text-warning" />
                          {movie.voteAverage.toFixed(1)}
                        </span>
                      </div>
                      {movie.reason && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {movie.reason}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
