import axios from 'axios';
import { ShowContent, ShowType } from '@showguessr/shared';
import { config } from '../config';

/**
 * Service to fetch show content from various APIs
 */
export class ContentService {
  /**
   * Fetch random show based on type
   */
  async getRandomShow(showType: ShowType, roundNumber: number): Promise<ShowContent> {
    switch (showType) {
      case ShowType.ANIME:
        return this.getRandomAnime(roundNumber);
      case ShowType.MOVIE:
        return this.getRandomMovie(roundNumber);
      case ShowType.CARTOON:
        return this.getRandomCartoon(roundNumber);
      case ShowType.TV_SERIES:
        return this.getRandomTVSeries(roundNumber);
      default:
        throw new Error('Invalid show type');
    }
  }

  /**
   * Fetch random anime from AniList API
   */
  private async getRandomAnime(roundNumber: number): Promise<ShowContent> {
    // GraphQL query for AniList
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              large
            }
            startDate {
              year
            }
          }
        }
      }
    `;

    const variables = {
      page: roundNumber, // Use round number for progressive difficulty
      perPage: 50
    };

    try {
      const response = await axios.post('https://graphql.anilist.co', {
        query,
        variables
      });

      const media = response.data.data.Page.media;
      const randomIndex = Math.floor(Math.random() * media.length);
      const anime = media[randomIndex];

      return {
        id: anime.id.toString(),
        title: anime.title.english || anime.title.romaji,
        imageUrl: anime.coverImage.large,
        showType: ShowType.ANIME,
        alternativeTitles: [anime.title.romaji, anime.title.english, anime.title.native].filter(Boolean),
        year: anime.startDate?.year
      };
    } catch (error) {
      console.error('Error fetching anime:', error);
      throw new Error('Failed to fetch anime content');
    }
  }

  /**
   * Fetch random movie from TMDB API
   */
  private async getRandomMovie(roundNumber: number): Promise<ShowContent> {
    if (!config.tmdbApiKey) {
      throw new Error('TMDB API key not configured');
    }

    try {
      const page = roundNumber; // Use round number for progressive difficulty
      const response = await axios.get('https://api.themoviedb.org/3/movie/popular', {
        params: {
          api_key: config.tmdbApiKey,
          page: page
        }
      });

      const movies = response.data.results;
      const randomIndex = Math.floor(Math.random() * movies.length);
      const movie = movies[randomIndex];

      return {
        id: movie.id.toString(),
        title: movie.title,
        imageUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        showType: ShowType.MOVIE,
        alternativeTitles: [movie.original_title],
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined
      };
    } catch (error) {
      console.error('Error fetching movie:', error);
      throw new Error('Failed to fetch movie content');
    }
  }

  /**
   * Fetch random cartoon (animated TV series)
   */
  private async getRandomCartoon(roundNumber: number): Promise<ShowContent> {
    if (!config.tmdbApiKey) {
      throw new Error('TMDB API key not configured');
    }

    try {
      const page = roundNumber; // Use round number for progressive difficulty
      const response = await axios.get('https://api.themoviedb.org/3/discover/tv', {
        params: {
          api_key: config.tmdbApiKey,
          with_genres: 16, // Animation genre
          page: page
        }
      });

      const shows = response.data.results;
      const randomIndex = Math.floor(Math.random() * shows.length);
      const show = shows[randomIndex];

      return {
        id: show.id.toString(),
        title: show.name,
        imageUrl: `https://image.tmdb.org/t/p/w500${show.poster_path}`,
        showType: ShowType.CARTOON,
        alternativeTitles: [show.original_name],
        year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : undefined
      };
    } catch (error) {
      console.error('Error fetching cartoon:', error);
      throw new Error('Failed to fetch cartoon content');
    }
  }

  /**
   * Fetch random TV series from TMDB API
   */
  private async getRandomTVSeries(roundNumber: number): Promise<ShowContent> {
    if (!config.tmdbApiKey) {
      throw new Error('TMDB API key not configured');
    }

    try {
      const page = roundNumber; // Use round number for progressive difficulty
      const response = await axios.get('https://api.themoviedb.org/3/tv/popular', {
        params: {
          api_key: config.tmdbApiKey,
          page: page
        }
      });

      const shows = response.data.results;
      const randomIndex = Math.floor(Math.random() * shows.length);
      const show = shows[randomIndex];

      return {
        id: show.id.toString(),
        title: show.name,
        imageUrl: `https://image.tmdb.org/t/p/w500${show.poster_path}`,
        showType: ShowType.TV_SERIES,
        alternativeTitles: [show.original_name],
        year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : undefined
      };
    } catch (error) {
      console.error('Error fetching TV series:', error);
      throw new Error('Failed to fetch TV series content');
    }
  }

  /**
   * Check if an answer matches the correct show title
   */
  checkAnswer(userAnswer: string, correctAnswer: string, alternativeTitles?: string[]): boolean {
    // A more forgiving normalization function. It removes non-alphanumeric characters
    // but is less aggressive than the previous version.
    const normalize = (str: string) =>
      str.toLowerCase()
         .trim()
         // Remove articles and common punctuation
         .replace(/^(the|a|an)\s+/i, '')
         .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()']/g, "")
         .replace(/\s+/g, ' '); // Collapse whitespace
    const normalizedUserAnswer = normalize(userAnswer);

    const titlesToCheck = [correctAnswer, ...(alternativeTitles || [])].filter(Boolean);

    for (const title of titlesToCheck) {
      const normalizedTitle = normalize(title);

      // 1. Check for an exact normalized match first
      if (normalizedUserAnswer === normalizedTitle) {
        return true;
      }

      // 2. If no exact match, use a combination of fuzzy matching algorithms.
      
      // Levenshtein distance is good for typos.
      const distance = this.levenshteinDistance(normalizedUserAnswer, normalizedTitle);
      const threshold = Math.max(1, Math.floor(normalizedTitle.length * 0.25));
      if (distance <= threshold) { // If the edit distance is small, it's a match.
        return true;
      }

      // Jaccard similarity is good for matching word sets, even if order is different.
      const jaccardSim = this.jaccardSimilarity(normalizedUserAnswer, normalizedTitle);
      if (jaccardSim >= 0.75) { // If the word sets are 75% similar, it's a match.
        return true;
      }
    }

    return false;
  }

  /**
   * Calculates the Levenshtein distance between two strings.
   * This measures the number of edits (insertions, deletions, substitutions)
   * needed to change one string into the other.
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i += 1) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= b.length; j += 1) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j += 1) {
      for (let i = 1; i <= a.length; i += 1) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Calculates the Jaccard similarity between two strings based on their word sets.
   * This is good for comparing strings where word order might differ or words are missing.
   */
  private jaccardSimilarity(a: string, b: string): number {
    const setA = new Set(a.split(' '));
    const setB = new Set(b.split(' '));

    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    if (union.size === 0) {
      return 1; // Both strings are empty
    }

    return intersection.size / union.size;
  }
}
