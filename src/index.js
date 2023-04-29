import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';


import GalleryApi from './js/api';
import LoadMoreBtn from './js/load-more-btn';

const form = document.querySelector('.search-form');
const galleryWrapper = document.querySelector('.gallery');

const galleryApi = new GalleryApi();
const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  isHidden: true,
});

const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
});

form.addEventListener('submit', onSubmit);
loadMoreBtn.button.addEventListener('click', fetchImages);

function onSubmit(e) {
  e.preventDefault();
  galleryApi.query = e.currentTarget.elements.searchQuery.value.trim();
  galleryApi.resetPage();
  if (galleryApi.query === '') {
    Notiflix.Notify.failure("Sorry, the search string can't be empty. Please try again.");
    loadMoreBtn.hide();
    clearImagesMarkup();
    return;
  }
  loadMoreBtn.show();
  clearImagesMarkup();
  fetchImages().finally(() => form.reset());
}

async function fetchImages() {
  try {
    loadMoreBtn.disable();
    const markup = await getImagesMarkup();
    updateImagesMarkup(markup);
    lightbox.refresh();
    loadMoreBtn.enable();
  } catch (err) {
    onError(err);
  }
}

async function getImagesMarkup() {
  try {
    const { hits, totalHits } = await galleryApi.getImages();
    if (hits.length === 0) {
      Notiflix.Notify.failure("Sorry, the search string can't be empty. Please try again.");
      loadMoreBtn.hide();
      return;
    } else if (totalHits / galleryApi.per_page <= galleryApi.page) {
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
      loadMoreBtn.hide();
    } else if (galleryApi.page === 2) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }
    return hits.reduce((markup, hit) => markup + createMarkup(hit), '');
  } catch (err) {
    onError(err);
  }
}

function createMarkup({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) {
  return `<div class="photo-card">
  <a class="gallery__item" href=${largeImageURL}>
  <img class="photo" src=${webformatURL} alt=${tags} loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${downloads}
    </p>
  </div>
</div>`;
}

function updateImagesMarkup(markup) {
  if (markup !== undefined) galleryWrapper.insertAdjacentHTML('beforeend', markup);
}

function clearImagesMarkup() {
  galleryWrapper.innerHTML = '';
}

function onError(err) {
  console.error(err);
  loadMoreBtn.hide();
  clearImagesMarkup();
}
