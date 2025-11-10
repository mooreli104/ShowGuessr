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
  async getRandomShow(showType: ShowType, difficulty: string): Promise<ShowContent> {
    switch (showType) {
      case ShowType.ANIME:
        return this.getRandomAnime(difficulty);
      case ShowType.MOVIE:
        return this.getRandomMovie(difficulty);
      case ShowType.CARTOON:
        return this.getRandomCartoon(difficulty);
      case ShowType.TV_SERIES:
        return this.getRandomTVSeries(difficulty);
      default:
        throw new Error('Invalid show type');
    }
  }

  /**
   * Fetch random anime from AniList API
   */
  private async getRandomAnime(difficulty: string): Promise<ShowContent> {
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
      page: Math.floor(Math.random() * 10) + 1,
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
  private async getRandomMovie(difficulty: string): Promise<ShowContent> {
    if (!config.tmdbApiKey) {
      throw new Error('TMDB API key not configured');
    }

    try {
      const page = Math.floor(Math.random() * 20) + 1;
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
  private async getRandomCartoon(difficulty: string): Promise<ShowContent> {
    if (!config.tmdbApiKey) {
      throw new Error('TMDB API key not configured');
    }

    try {
      const page = Math.floor(Math.random() * 10) + 1;
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
  private async getRandomTVSeries(difficulty: string): Promise<ShowContent> {
    if (!config.tmdbApiKey) {
      throw new Error('TMDB API key not configured');
    }

    try {
      const page = Math.floor(Math.random() * 20) + 1;
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
    const normalize = (str: string) => str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const normalizedAnswer = normalize(userAnswer);
    const normalizedCorrect = normalize(correctAnswer);

    if (normalizedAnswer === normalizedCorrect) {
      return true;
    }

    if (alternativeTitles) {
      return alternativeTitles.some(alt => normalize(alt) === normalizedAnswer);
    }

    return false;
  }
}
