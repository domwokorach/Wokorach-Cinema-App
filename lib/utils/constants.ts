export const MOODS = [
  { id: 'tense', label: 'Tense', emoji: '😰' },
  { id: 'cozy', label: 'Cozy', emoji: '🛋️' },
  { id: 'mind-bending', label: 'Mind-bending', emoji: '🌀' },
  { id: 'feel-good', label: 'Feel-good', emoji: '😊' },
  { id: 'dark', label: 'Dark', emoji: '🖤' },
  { id: 'light-hearted', label: 'Light-hearted', emoji: '☀️' },
] as const

export type MoodId = (typeof MOODS)[number]['id']

export const STREAMING_PROVIDERS = [
  { id: 8, name: 'Netflix', logo: '/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg' },
  { id: 9, name: 'Amazon Prime Video', logo: '/emthp39XA2YScoYL1p0sdbAH2WA.jpg' },
  { id: 337, name: 'Disney Plus', logo: '/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg' },
  { id: 1899, name: 'Max', logo: '/6Q3YRUI0e4QHCNyEr9dqr5oijE9.jpg' },
  { id: 350, name: 'Apple TV Plus', logo: '/6uhKBfmtzFqOcLousHwZuzcrScK.jpg' },
  { id: 15, name: 'Hulu', logo: '/zxrQdKQoIaHJMgVFMmnFnUxLFYp.jpg' },
  { id: 531, name: 'Paramount Plus', logo: '/xbhHHa1YgtpwhC8lb1NQ3ACVcLd.jpg' },
  { id: 386, name: 'Peacock', logo: '/8VCV78prwd9QzZnEhV8pCFkYXMn.jpg' },
  { id: 283, name: 'Crunchyroll', logo: '/8Gt1iClBlzTeQs8WQm8UrCoIxnQ.jpg' },
  { id: 2, name: 'Apple TV', logo: '/peURlLlr8jggOwK53fJ5wdQl05y.jpg' },
  { id: 192, name: 'YouTube', logo: '/oIkQkEkwfmcG7IGpRR1NB8frZZM.jpg' },
  { id: 3, name: 'Google Play Movies', logo: '/tbEdFQDwx5LEVr8WpSeXQSIirVq.jpg' },
] as const

export const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
] as const

export const DECADES = [
  '2020s', '2010s', '2000s', '1990s', '1980s', '1970s', '1960s', 'Classic',
] as const

export const FREE_TIER_DAILY_LIMIT = 5
export const PRO_PLAN_ID = 'pro'

export const TMDB_API_BASE = 'https://api.themoviedb.org/3'
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'
