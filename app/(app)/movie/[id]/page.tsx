import {
  Star,
  Clock,
  Calendar,
  Plus,
  Play,
  Heart,
} from "lucide-react";

// In production, this would fetch from TMDB API / database
async function getMovie(id: string) {
  // Mock movie data for demonstration
  return {
    id: Number(id),
    title: "Inception",
    year: 2010,
    runtime: 148,
    voteAverage: 8.4,
    overview:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.",
    posterPath: "/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
    backdropPath: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    genres: [
      { id: 28, name: "Action" },
      { id: 878, name: "Science Fiction" },
      { id: 12, name: "Adventure" },
    ],
    director: "Christopher Nolan",
    cast: [
      "Leonardo DiCaprio",
      "Joseph Gordon-Levitt",
      "Elliot Page",
      "Tom Hardy",
      "Ken Watanabe",
      "Cillian Murphy",
      "Marion Cotillard",
      "Michael Caine",
      "Dileep Rao",
      "Tom Berenger",
    ],
    providers: [
      { name: "Netflix", logoPath: null },
      { name: "Amazon Prime", logoPath: null },
    ],
    matchReason:
      "This film matches your love for mind-bending narratives with layered storytelling. Its blend of action and cerebral themes aligns perfectly with your taste profile.",
  };
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getMovie(id);

  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null;
  const backdropUrl = movie.backdropPath
    ? `https://image.tmdb.org/t/p/w1280${movie.backdropPath}`
    : null;

  return (
    <div className="-mx-4 -mt-6 sm:-mx-6 lg:-mx-8">
      {/* Backdrop */}
      <div className="relative h-64 w-full overflow-hidden sm:h-80 lg:h-96">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Movie info section */}
        <div className="-mt-32 relative flex flex-col gap-6 sm:flex-row sm:gap-8">
          {/* Poster */}
          <div className="mx-auto w-48 flex-shrink-0 sm:mx-0 sm:w-56">
            <div className="overflow-hidden rounded-xl border-2 border-border shadow-2xl">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="aspect-[2/3] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center bg-secondary text-muted-foreground">
                  No Poster
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4 pt-2">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              {movie.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {movie.year}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-medium text-foreground">
                  {movie.voteAverage.toFixed(1)}
                </span>
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Add to Watchlist
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover">
                <Heart className="h-4 w-4" />
                Rate
              </button>
            </div>

            {/* Rating stars */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:text-warning"
                >
                  <Star className="h-6 w-6" />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                Rate this movie
              </span>
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="mt-8 space-y-8 pb-12">
          {/* Overview */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Overview
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {movie.overview}
            </p>
          </section>

          {/* Why You'll Like This */}
          {movie.matchReason && (
            <section className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-primary">
                <Heart className="h-5 w-5" />
                Why You Will Like This
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {movie.matchReason}
              </p>
            </section>
          )}

          {/* Director */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Director
            </h2>
            <p className="text-muted-foreground">{movie.director}</p>
          </section>

          {/* Cast */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Top Cast
            </h2>
            <div className="flex flex-wrap gap-2">
              {movie.cast.map((actor) => (
                <span
                  key={actor}
                  className="rounded-lg bg-card border border-border px-3 py-1.5 text-sm text-foreground"
                >
                  {actor}
                </span>
              ))}
            </div>
          </section>

          {/* Streaming Availability */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Where to Watch
            </h2>
            <div className="flex flex-wrap gap-3">
              {movie.providers.map((provider) => (
                <div
                  key={provider.name}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground"
                >
                  <Play className="h-4 w-4 text-primary" />
                  {provider.name}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
