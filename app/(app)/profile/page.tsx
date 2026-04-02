"use client";

import { Star, Film, Clapperboard, TrendingUp, Hash } from "lucide-react";

// Mock taste profile data
const tasteProfile = {
  totalRated: 147,
  tasteSummary:
    "You gravitate toward cerebral thrillers and character-driven dramas with non-linear storytelling. You appreciate films with atmospheric cinematography and morally complex protagonists. Your taste skews toward the 2000s-2010s era, with a soft spot for 90s indie cinema.",
  topDirectors: [
    "Christopher Nolan",
    "Denis Villeneuve",
    "David Fincher",
    "Bong Joon-ho",
    "Quentin Tarantino",
  ],
  genreScores: [
    { genre: "Thriller", score: 92 },
    { genre: "Sci-Fi", score: 85 },
    { genre: "Drama", score: 80 },
    { genre: "Mystery", score: 75 },
    { genre: "Action", score: 70 },
    { genre: "Comedy", score: 55 },
    { genre: "Horror", score: 40 },
    { genre: "Romance", score: 35 },
  ],
  decadeDistribution: [
    { decade: "1970s", count: 5 },
    { decade: "1980s", count: 12 },
    { decade: "1990s", count: 28 },
    { decade: "2000s", count: 42 },
    { decade: "2010s", count: 45 },
    { decade: "2020s", count: 15 },
  ],
  themeCloud: [
    "time",
    "identity",
    "redemption",
    "isolation",
    "power",
    "memory",
    "justice",
    "obsession",
    "survival",
    "deception",
    "ambition",
    "sacrifice",
  ],
  ratingDistribution: [
    { stars: 1, count: 3 },
    { stars: 2, count: 12 },
    { stars: 3, count: 38 },
    { stars: 4, count: 62 },
    { stars: 5, count: 32 },
  ],
};

export default function ProfilePage() {
  const maxDecadeCount = Math.max(
    ...tasteProfile.decadeDistribution.map((d) => d.count)
  );
  const maxRatingCount = Math.max(
    ...tasteProfile.ratingDistribution.map((r) => r.count)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Taste Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Your cinematic DNA, based on {tasteProfile.totalRated} rated films
        </p>
      </div>

      {/* Taste Summary */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
          <TrendingUp className="h-5 w-5 text-primary" />
          Your Taste in a Nutshell
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {tasteProfile.tasteSummary}
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Genre Preferences (Radar chart placeholder) */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Film className="h-5 w-5 text-primary" />
            Genre Preferences
          </h2>
          <div className="space-y-3">
            {tasteProfile.genreScores.map((item) => (
              <div key={item.genre} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{item.genre}</span>
                  <span className="text-muted-foreground">{item.score}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Decade Distribution */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Clapperboard className="h-5 w-5 text-primary" />
            Decades You Watch
          </h2>
          <div className="flex items-end justify-between gap-2 h-48">
            {tasteProfile.decadeDistribution.map((item) => (
              <div key={item.decade} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {item.count}
                </span>
                <div
                  className="w-full rounded-t-md bg-primary/80 transition-all"
                  style={{
                    height: `${(item.count / maxDecadeCount) * 140}px`,
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  {item.decade}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Top Directors */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Star className="h-5 w-5 text-primary" />
            Top 5 Directors
          </h2>
          <ol className="space-y-3">
            {tasteProfile.topDirectors.map((director, index) => (
              <li
                key={director}
                className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <span className="text-foreground">{director}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Rating Distribution */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Star className="h-5 w-5 text-primary" />
            Rating Distribution
          </h2>
          <div className="space-y-3">
            {tasteProfile.ratingDistribution
              .slice()
              .reverse()
              .map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <div className="flex w-20 items-center gap-0.5">
                    {Array.from({ length: item.stars }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-warning text-warning"
                      />
                    ))}
                  </div>
                  <div className="flex-1 h-3 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-warning/80 transition-all"
                      style={{
                        width: `${(item.count / maxRatingCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm text-muted-foreground">
                    {item.count}
                  </span>
                </div>
              ))}
          </div>
        </section>
      </div>

      {/* Theme Cloud */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Hash className="h-5 w-5 text-primary" />
          Themes You Love
        </h2>
        <div className="flex flex-wrap gap-2">
          {tasteProfile.themeCloud.map((theme, index) => {
            const sizes = ["text-sm", "text-base", "text-lg", "text-xl"];
            const sizeIndex = Math.floor(Math.random() * sizes.length);
            return (
              <span
                key={theme}
                className={`rounded-full border border-border bg-secondary px-4 py-1.5 font-medium text-foreground/80 ${sizes[index % sizes.length]}`}
              >
                {theme}
              </span>
            );
          })}
        </div>
      </section>
    </div>
  );
}
