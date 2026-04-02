-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  onboarding_done BOOLEAN DEFAULT FALSE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  daily_rec_count INTEGER DEFAULT 0,
  daily_rec_reset TIMESTAMPTZ DEFAULT NOW(),
  country_code TEXT DEFAULT 'US',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MOVIES (cached from TMDB)
CREATE TABLE public.movies (
  id SERIAL PRIMARY KEY,
  tmdb_id INTEGER UNIQUE NOT NULL,
  imdb_id TEXT,
  title TEXT NOT NULL,
  original_title TEXT,
  overview TEXT,
  tagline TEXT,
  release_date DATE,
  runtime INTEGER,
  vote_average NUMERIC(3,1),
  vote_count INTEGER,
  popularity NUMERIC,
  poster_path TEXT,
  backdrop_path TEXT,
  genres JSONB,
  keywords JSONB,
  cast_crew JSONB,
  production_countries JSONB,
  original_language TEXT,
  embedding vector(1536),
  embedding_text TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_movies_tmdb_id ON public.movies(tmdb_id);
CREATE INDEX idx_movies_embedding ON public.movies USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_movies_genres ON public.movies USING gin(genres);
CREATE INDEX idx_movies_vote ON public.movies(vote_average DESC);

-- WATCH PROVIDERS
CREATE TABLE public.watch_providers (
  id SERIAL PRIMARY KEY,
  movie_id INTEGER REFERENCES public.movies(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  provider_id INTEGER NOT NULL,
  provider_name TEXT NOT NULL,
  provider_logo TEXT,
  monetization TEXT CHECK (monetization IN ('flatrate','rent','buy','free','ads')),
  tmdb_link TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(movie_id, country_code, provider_id, monetization)
);

CREATE INDEX idx_wp_movie_country ON public.watch_providers(movie_id, country_code);
CREATE INDEX idx_wp_provider ON public.watch_providers(provider_id, country_code);

-- USER STREAMING SERVICES
CREATE TABLE public.user_streaming_services (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id INTEGER NOT NULL,
  provider_name TEXT NOT NULL,
  provider_logo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider_id)
);

-- RATINGS
CREATE TABLE public.ratings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id INTEGER REFERENCES public.movies(id) ON DELETE CASCADE,
  rating NUMERIC(2,1) CHECK (rating >= 0.5 AND rating <= 5.0),
  reaction TEXT CHECK (reaction IN ('loved','liked','meh','disliked','skip')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('onboarding','manual','recommendation','watchlist','letterboxd','imdb','csv')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

CREATE INDEX idx_ratings_user ON public.ratings(user_id);

-- TASTE PROFILES
CREATE TABLE public.taste_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  taste_vector vector(1536),
  genre_scores JSONB,
  decade_scores JSONB,
  director_affinities JSONB,
  theme_tags JSONB,
  pacing_pref TEXT,
  mood_history JSONB,
  total_ratings INTEGER DEFAULT 0,
  profile_summary TEXT,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RECOMMENDATIONS
CREATE TABLE public.recommendations (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID DEFAULT gen_random_uuid(),
  query_text TEXT,
  mood_context JSONB,
  movies_recommended JSONB,
  model_used TEXT,
  tokens_used INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WATCHLIST
CREATE TABLE public.watchlist (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id INTEGER REFERENCES public.movies(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,
  notes TEXT,
  added_from TEXT DEFAULT 'manual' CHECK (added_from IN ('manual','recommendation','group','letterboxd')),
  watched BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- GROUPS
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  merged_vector vector(1536),
  merged_genres JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.group_members (
  id SERIAL PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- IMPORT JOBS
CREATE TABLE public.import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('letterboxd','imdb','csv')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','parsing','matching','preview','confirmed','processing','completed','failed')),
  file_name TEXT,
  raw_count INTEGER,
  matched_count INTEGER,
  unmatched_count INTEGER,
  imported_count INTEGER,
  skipped_count INTEGER,
  preview_data JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_import_jobs_user ON public.import_jobs(user_id);

-- ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taste_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaming_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Ratings policies
CREATE POLICY "Users read own ratings" ON public.ratings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own ratings" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own ratings" ON public.ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own ratings" ON public.ratings FOR DELETE USING (auth.uid() = user_id);

-- Taste profiles policies
CREATE POLICY "Users read own taste" ON public.taste_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own taste" ON public.taste_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own taste" ON public.taste_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Watchlist policies
CREATE POLICY "Users read own watchlist" ON public.watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own watchlist" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own watchlist" ON public.watchlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own watchlist" ON public.watchlist FOR DELETE USING (auth.uid() = user_id);

-- User streaming services policies
CREATE POLICY "Users read own services" ON public.user_streaming_services FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own services" ON public.user_streaming_services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own services" ON public.user_streaming_services FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own services" ON public.user_streaming_services FOR DELETE USING (auth.uid() = user_id);

-- Recommendations policies
CREATE POLICY "Users read own recs" ON public.recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own recs" ON public.recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Import jobs policies
CREATE POLICY "Users read own imports" ON public.import_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own imports" ON public.import_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own imports" ON public.import_jobs FOR UPDATE USING (auth.uid() = user_id);

-- Movies and watch_providers are public read
CREATE POLICY "Movies are public" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Watch providers are public" ON public.watch_providers FOR SELECT USING (true);

-- Groups (public read for members)
CREATE POLICY "Group members can read groups" ON public.groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_members.group_id = groups.id AND group_members.user_id = auth.uid())
  OR created_by = auth.uid()
);

-- Auto-create profile and taste_profiles on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  INSERT INTO public.taste_profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_movies(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 50
)
RETURNS TABLE (
  id int,
  tmdb_id int,
  title text,
  overview text,
  genres jsonb,
  keywords jsonb,
  cast_crew jsonb,
  vote_average numeric,
  runtime int,
  poster_path text,
  backdrop_path text,
  release_date date,
  original_language text,
  production_countries jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    m.id, m.tmdb_id, m.title, m.overview, m.genres, m.keywords,
    m.cast_crew, m.vote_average, m.runtime, m.poster_path,
    m.backdrop_path, m.release_date, m.original_language,
    m.production_countries,
    1 - (m.embedding <=> query_embedding) as similarity
  FROM public.movies m
  WHERE m.embedding IS NOT NULL
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
$$;
