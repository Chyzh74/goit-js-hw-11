import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '35460498-2829e60f1755bf2084387bda6';

export default class GalleryApi {
  constructor() {
    this.query = '';
    this.page = 1;
    this.per_page = 40;
  }

  async getImages() {
    const response = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${this.query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${this.per_page}&page=${this.page}`
    );
    this.incrementPage();
    return await response.data;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }
}