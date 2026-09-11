/**
 * Expanded Mood Taxonomy & Mapping
 */
export const MOOD_MAP = {
  romantic: ["romance", "romantic", "love", "heartfelt", "emotional", "passion", "couple", "drama", "nostalgic"],
  emotional: ["drama", "heartbreaking", "sad", "emotional", "touching", "tears", "romance", "family", "nostalgic"],
  thrilled: ["thriller", "mystery", "suspense", "crime", "action", "investigation", "twist"],
  excited: ["action", "adventure", "sci-fi", "superhero", "fast-paced", "energy", "vibrant"],
  cheerful: ["comedy", "humor", "fun", "family", "animation", "feel-good", "laugh", "chill"],
  intense: ["action", "war", "thriller", "dark", "crime", "revenge", "intense"],
  vibrant: ["vibrant", "action", "sci-fi", "musical", "concert", "energy"],
  chill: ["chill", "comedy", "relaxing", "casual", "fun", "humor"],
  nostalgic: ["nostalgic", "retro", "classic", "emotional", "drama", "romance"],
  comedy: ["comedy", "humor", "fun", "laugh", "standup"],
  horror: ["horror", "scary", "supernatural", "thriller", "dark"]
};

/**
 * Evaluates movies against a selected mood/vibe across multi-fields (title, genre, description, vibe).
 * 
 * @param {Array} movies - List of movie objects
 * @param {string} selectedMood - Selected mood/vibe keyword
 * @returns {Array} Filtered list of movie objects matching mood, with fallback if strict match fails.
 */
export const filterMoviesByMood = (movies, selectedMood) => {
  if (!movies || !Array.isArray(movies) || movies.length === 0) return [];
  if (!selectedMood || selectedMood.trim().toLowerCase() === 'all') return movies;

  const normalizedMood = selectedMood.trim().toLowerCase();
  
  // Get keywords associated with this mood key, or fall back to [normalizedMood] itself
  const moodKeywords = MOOD_MAP[normalizedMood] || [normalizedMood];

  // Helper to extract a unified searchable text string from a movie object
  const getSearchableText = (movie) => {
    const title = movie.title || '';
    const genre = Array.isArray(movie.genre) ? movie.genre.join(' ') : (movie.genre || '');
    const genres = Array.isArray(movie.genres) ? movie.genres.join(' ') : (movie.genres || '');
    const description = movie.description || movie.storyline || movie.synopsis || movie.plot || '';
    const vibe = Array.isArray(movie.vibe) ? movie.vibe.join(' ') : (movie.vibe || '');
    const vibes = Array.isArray(movie.vibes) ? movie.vibes.join(' ') : (movie.vibes || '');

    return `${title} ${genre} ${genres} ${description} ${vibe} ${vibes}`.trim().toLowerCase();
  };

  // 1. Primary Semantic Match: check if any keyword from mood map appears in searchable text
  const primaryMatches = movies.filter(movie => {
    const fullText = getSearchableText(movie);
    return moodKeywords.some(keyword => fullText.includes(keyword.toLowerCase()));
  });

  if (primaryMatches.length > 0) {
    return primaryMatches;
  }

  // 2. Secondary Direct Substring Match: check if normalizedMood string is inside fullText
  const secondaryMatches = movies.filter(movie => {
    const fullText = getSearchableText(movie);
    return fullText.includes(normalizedMood);
  });

  if (secondaryMatches.length > 0) {
    return secondaryMatches;
  }

  // 3. Fallback: Return all movies rather than an empty blank screen
  return movies;
};
