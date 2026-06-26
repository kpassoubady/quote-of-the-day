/**
 * Client-Side Controller - Inspiria Application
 */

// Application Constants
const ROTATION_TIME = 300000; // 300000 milliseconds (5 minutes)
const PROGRESS_INTERVAL = 1000; // Progress bar draw tick delay slows down for longer period

// Unsplash Background Category Keys to rotate
const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1280', // Forest/nature
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1280', // Beautiful lights
  'https://images.unsplash.com/photo-1472214222541-d510753a4907?q=80&w=1280', // Sun over meadows
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1280', // Ocean beach
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1280', // Hills/sky
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1280', // Trees path
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1280'  // Epic mountains
];

// App State
let quotesList = [];
let currentIndex = -1;
let rotationTimer = null;
let progressTimer = null;
let currentProgress = 0;
let isPaused = false;
let favorites = [];
const favoritesFilters = {
  search: '',
  author: 'all',
  length: 'all'
};

// DOM Elements
const homeView = document.getElementById('home-view');
const favoritesView = document.getElementById('favorites-view');
const navHome = document.getElementById('nav-home');
const navFavorites = document.getElementById('nav-favorites');
const favBadge = document.getElementById('fav-badge');

const quoteWrapper = document.getElementById('quote-wrapper');
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');
const spinner = document.getElementById('loading-spinner');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');

const togglePauseBtn = document.getElementById('toggle-pause-btn');
const pauseIcon = document.getElementById('pause-icon');
const autoCycleBadge = document.getElementById('auto-cycle-badge');
const progressFill = document.getElementById('rotation-progress');
const nextBtn = document.getElementById('next-btn');
const favoriteBtn = document.getElementById('favorite-btn');
const heartIcon = document.getElementById('heart-icon');
const retryBtn = document.getElementById('retry-btn');

// Share Buttons
const shareTwitter = document.getElementById('share-twitter');
const shareLinkedin = document.getElementById('share-linkedin');
const shareFacebook = document.getElementById('share-facebook');
const copyClipboard = document.getElementById('copy-clipboard');

// Favorite panels list elements
const favoritesContainer = document.getElementById('favorites-container');
const favoritesEmptyState = document.getElementById('favorites-empty-state');
const clearAllFavs = document.getElementById('clear-all-favs');
const backToHomeBtn = document.getElementById('back-to-home-btn');
const backToCurrentBtn = document.getElementById('back-to-current-btn');
const favoritesSearchInput = document.getElementById('favorites-search');
const favoritesAuthorFilter = document.getElementById('favorites-author-filter');
const favoritesLengthFilter = document.getElementById('favorites-length-filter');
const favoritesResultsSummary = document.getElementById('favorites-results-summary');
const quoteAnnouncer = document.getElementById('quote-announcer');

// Footer status indicators
const healthSourceBadge = document.getElementById('health-source-badge');

// Toast Feedback Bootstrap Class Instance wrapper
const toastEl = document.getElementById('feedback-toast');
const toastMessage = document.getElementById('toast-message');
const toastIcon = document.getElementById('toast-icon');
let bootstrapToast = null;

if (toastEl) {
  bootstrapToast = new bootstrap.Toast(toastEl, { delay: 2500 });
}

// -------------------------------------------------------------
// EVENT LISTENERS & DELEGATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Load favorite collections from LocalStorage on mount
  loadFavorites();
  
  // Fetch from Node/Express API Endpoint
  fetchQuotes();

  // Navigation Click Actions
  navHome.addEventListener('click', showMainView);
  navFavorites.addEventListener('click', showFavoritesView);
  backToHomeBtn.addEventListener('click', showMainView);
  backToCurrentBtn.addEventListener('click', returnToCurrentQuote);

  // Manual actions
  nextBtn.addEventListener('click', () => {
    slideNextQuote();
    resetProgressTrack();
  });
  
  favoriteBtn.addEventListener('click', toggleCurrentFavorite);
  
  togglePauseBtn.addEventListener('click', toggleCycleState);
  retryBtn.addEventListener('click', fetchQuotes);
  clearAllFavs.addEventListener('click', clearAllFavorites);
  favoritesSearchInput.addEventListener('input', handleFavoritesSearch);
  favoritesAuthorFilter.addEventListener('change', handleFavoritesFilterChange);
  favoritesLengthFilter.addEventListener('change', handleFavoritesFilterChange);

  // Social Share bindings
  shareTwitter.addEventListener('click', shareOnTwitter);
  shareLinkedin.addEventListener('click', shareOnLinkedIn);
  shareFacebook.addEventListener('click', shareOnFacebook);
  copyClipboard.addEventListener('click', copyQuoteToClipboard);

  document.addEventListener('keydown', handleGlobalShortcuts);
});

// -------------------------------------------------------------
// CONTROLLERS & DATA RETRIEVAL
// -------------------------------------------------------------
function showMainView() {
  homeView.classList.remove('d-none');
  favoritesView.classList.add('d-none');
  navHome.classList.add('active');
  navFavorites.classList.remove('active');
  // Resume timers if they were active
  if (!isPaused && quotesList.length > 0) {
    startRotationTimer();
    startProgressTrack();
  }
}

function showFavoritesView() {
  homeView.classList.add('d-none');
  favoritesView.classList.remove('d-none');
  navHome.classList.remove('active');
  navFavorites.classList.add('active');
  // Suspend auto cycle checks temporarily while viewing favorites list to optimize
  stopRotationTimer();
  stopProgressTrack();
  syncFavoritesFilterOptions();
  renderFavoritesList();
  favoritesSearchInput.focus();
}

function returnToCurrentQuote() {
  showMainView();
  quoteWrapper.focus();
}

async function fetchQuotes() {
  showSpinner();
  stopRotationTimer();
  stopProgressTrack();

  try {
    const response = await fetch('/api/quotes');
    if (!response.ok) {
      throw new Error(`Technical Failure: Response returned status code ${response.status}`);
    }
    const result = await response.json();
    
    if (result.success && result.quotes && result.quotes.length > 0) {
      quotesList = result.quotes;
      
      // Highlight Feed cache hit metadata status matching response headers
      const cacheHeader = response.headers.get('X-Cache');
      if (cacheHeader === 'HIT') {
        healthSourceBadge.innerHTML = 'API Feed: Cached Online';
        healthSourceBadge.className = 'badge bg-success opacity-75';
      } else {
        healthSourceBadge.innerHTML = 'API Feed: Live Database';
        healthSourceBadge.className = 'badge bg-info text-dark opacity-75';
      }

      hideError();
      slideNextQuote();
      
      // Start global countdown
      isPaused = false;
      updatePauseButtonUI();
      resetProgressTrack();
    } else {
      throw new Error("No Quotes retrieved from server database.");
    }
  } catch (error) {
    console.error("Fetch request error: ", error);
    showError(error.message || "An exception occurred while connecting to backend system server endpoints.");
    healthSourceBadge.innerHTML = 'API Feed: Offline';
    healthSourceBadge.className = 'badge bg-danger opacity-75';
  }
}

function slideNextQuote() {
  if (quotesList.length === 0) return;

  // Visual Fade Out current quote frame
  quoteWrapper.classList.add('opacity-0');
  
  setTimeout(() => {
    // Increment index
    currentIndex = (currentIndex + 1) % quotesList.length;
    const item = quotesList[currentIndex];

    // Render text with outer stylized semantic quotation symbols
    quoteText.textContent = item.text;
    quoteAuthor.textContent = item.author ? `- ${item.author}` : '- Anonymous';

    // Update Favorite Heart Icon Indicator to match status of current index
    const isSaved = favorites.some(fav => fav.id === item.id);
    if (isSaved) {
      heartIcon.className = 'fa-solid fa-heart text-danger';
    } else {
      heartIcon.className = 'fa-regular fa-heart text-white';
    }
    favoriteBtn.setAttribute('aria-pressed', String(isSaved));
    favoriteBtn.setAttribute('aria-label', isSaved ? 'Remove current quote from favorites' : 'Save current quote to favorites');

    // Modern Unsplash backgrounds transition based on random select index values
    changeVisualCardBackground();
    announceCurrentQuote(item);

    // Visual Fade In trigger
    hideSpinner();
    quoteWrapper.classList.remove('d-none');
    setTimeout(() => {
      quoteWrapper.classList.remove('opacity-0');
    }, 50);

  }, 400);
}

function changeVisualCardBackground() {
  const cardElement = document.querySelector('.status-card');
  if (cardElement) {
    const randomIndex = Math.floor(Math.random() * BACKGROUNDS.length);
    cardElement.style.backgroundImage = `url('${BACKGROUNDS[randomIndex]}')`;
  }
}

// -------------------------------------------------------------
// TIMER CYCLES & LOOPS (Requirements 1 & 11 & 14)
// -------------------------------------------------------------
function startRotationTimer() {
  stopRotationTimer();
  rotationTimer = setInterval(() => {
    slideNextQuote();
    resetProgressTrack();
  }, ROTATION_TIME);
}

function stopRotationTimer() {
  if (rotationTimer) {
    clearInterval(rotationTimer);
    rotationTimer = null;
  }
}

function startProgressTrack() {
  stopProgressTrack();
  const ticks = ROTATION_TIME / PROGRESS_INTERVAL;
  const percentDelta = 100 / ticks;

  progressTimer = setInterval(() => {
    currentProgress += percentDelta;
    if (currentProgress < 100) {
      progressFill.style.width = `${currentProgress}%`;
    } else {
      progressFill.style.width = '100%';
    }
  }, PROGRESS_INTERVAL);
}

function stopProgressTrack() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

function resetProgressTrack() {
  stopProgressTrack();
  currentProgress = 0;
  progressFill.style.width = '0%';
  if (!isPaused && !homeView.classList.contains('d-none')) {
    startRotationTimer();
    startProgressTrack();
  }
}

function toggleCycleState() {
  isPaused = !isPaused;
  updatePauseButtonUI();
  
  if (isPaused) {
    stopRotationTimer();
    stopProgressTrack();
    showToast("Rotation Paused", "fa-circle-info text-info");
  } else {
    slideNextQuote();
    resetProgressTrack();
    showToast("Rotation Resumed (5m)", "fa-play text-warning");
  }
}

function updatePauseButtonUI() {
  if (isPaused) {
    pauseIcon.className = 'fa-solid fa-play';
    togglePauseBtn.title = 'Resume Auto-Cycle';
    autoCycleBadge.className = 'badge bg-secondary text-uppercase px-3 py-2 letter-spacing fw-bold';
    autoCycleBadge.innerHTML = '<i class="fa-solid fa-pause me-1"></i> Paused';
  } else {
    pauseIcon.className = 'fa-solid fa-pause';
    togglePauseBtn.title = 'Pause Auto-Cycle';
    autoCycleBadge.className = 'badge bg-danger text-uppercase px-3 py-2 letter-spacing fw-bold';
    autoCycleBadge.innerHTML = '<i class="fa-solid fa-sync fa-spin me-1"></i> Auto-Cycling (5m)';
  }
}

// -------------------------------------------------------------
// FAVORITES OPERATIONS (Requirement 4)
// -------------------------------------------------------------
function loadFavorites() {
  try {
    const raw = localStorage.getItem('inspiria_favorites');
    if (raw) {
      favorites = JSON.parse(raw);
    } else {
      favorites = [];
    }
  } catch (error) {
    console.error("Localstorage retrieval failure: ", error);
    favorites = [];
  }
  updateFavoritesBadge();
}

function saveFavorites() {
  try {
    localStorage.setItem('inspiria_favorites', JSON.stringify(favorites));
  } catch (error) {
    console.error("Localstorage saving failure: ", error);
  }
  updateFavoritesBadge();
}

function toggleCurrentFavorite() {
  if (quotesList.length === 0 || currentIndex === -1) return;
  const currentQuote = quotesList[currentIndex];
  
  const existingIndex = favorites.findIndex(fav => fav.id === currentQuote.id);
  if (existingIndex > -1) {
    // Remove
    favorites.splice(existingIndex, 1);
    heartIcon.className = 'fa-regular fa-heart text-white';
    favoriteBtn.setAttribute('aria-pressed', 'false');
    favoriteBtn.setAttribute('aria-label', 'Save current quote to favorites');
    showToast("Quote removed from favorites.", "fa-heart-broken text-warning");
  } else {
    // Add
    favorites.push(currentQuote);
    heartIcon.className = 'fa-solid fa-heart text-danger';
    favoriteBtn.setAttribute('aria-pressed', 'true');
    favoriteBtn.setAttribute('aria-label', 'Remove current quote from favorites');
    showToast("Saved quote to local collection!", "fa-heart text-danger");
  }
  saveFavorites();
  syncFavoritesFilterOptions();

  if (!favoritesView.classList.contains('d-none')) {
    renderFavoritesList();
  }
}

function removeFavoriteById(id) {
  favorites = favorites.filter(fav => fav.id !== id);
  saveFavorites();
  syncFavoritesFilterOptions();
  renderFavoritesList();
  
  // Synchronize icon highlight if we deleted active index item
  if (quotesList.length > 0 && currentIndex !== -1 && quotesList[currentIndex].id === id) {
    heartIcon.className = 'fa-regular fa-heart text-white';
    favoriteBtn.setAttribute('aria-pressed', 'false');
    favoriteBtn.setAttribute('aria-label', 'Save current quote to favorites');
  }
  showToast("Quote removed.", "fa-circle-minus text-secondary");
}

function clearAllFavorites() {
  if (confirm("Are you sure you want to parse out and delete all favorite quotes from your browser space?")) {
    favorites = [];
    saveFavorites();
    syncFavoritesFilterOptions();
    renderFavoritesList();
    if (quotesList.length > 0) {
      heartIcon.className = 'fa-regular fa-heart text-white';
      favoriteBtn.setAttribute('aria-pressed', 'false');
      favoriteBtn.setAttribute('aria-label', 'Save current quote to favorites');
    }
    showToast("Cleared favorites directory list.", "fa-dumpster text-danger");
  }
}

function updateFavoritesBadge() {
  if (favBadge) {
    const count = favorites.length;
    favBadge.textContent = count;
    if (count > 0) {
      favBadge.classList.remove('d-none');
    } else {
      favBadge.classList.add('d-none');
    }
  }
}

function renderFavoritesList() {
  favoritesContainer.innerHTML = '';
  const filteredFavorites = getFilteredFavorites();
  
  if (favorites.length === 0) {
    favoritesEmptyState.classList.remove('d-none');
    favoritesResultsSummary.classList.add('d-none');
    return;
  }
  
  favoritesEmptyState.classList.add('d-none');
  updateFavoritesResultsSummary(filteredFavorites.length);

  if (filteredFavorites.length === 0) {
    const emptyFilterState = document.createElement('div');
    emptyFilterState.className = 'text-center py-5 text-muted';
    emptyFilterState.innerHTML = `
      <i class="fa-solid fa-filter-circle-xmark fs-1 mb-3 d-block"></i>
      <h5 class="fw-normal">No favorites match these filters.</h5>
      <p class="small mb-0">Try a different search term, author, or quote length.</p>
    `;
    favoritesContainer.appendChild(emptyFilterState);
    return;
  }
  
  filteredFavorites.forEach(fav => {
    const itemEl = document.createElement('div');
    itemEl.className = 'list-group-item d-flex justify-content-between align-items-center py-3 px-2 fav-item rounded-3 mb-2';
    if (quotesList.length > 0 && currentIndex !== -1 && quotesList[currentIndex].id === fav.id) {
      itemEl.classList.add('is-current');
    }

    const body = document.createElement('div');
    body.className = 'me-3 text-start';

    const quote = document.createElement('p');
    quote.className = 'mb-1 font-serif text-dark fs-5';
    quote.textContent = `"${fav.text}"`;

    const author = document.createElement('span');
    author.className = 'text-muted small italic';
    author.textContent = `- ${fav.author || 'Anonymous'}`;

    const actions = document.createElement('div');
    const removeButton = document.createElement('button');
    removeButton.className = 'btn btn-outline-danger btn-sm border-0 btn-remove-fav px-2';
    removeButton.type = 'button';
    removeButton.title = 'Delete Saved Quote';
    removeButton.setAttribute('aria-label', `Remove favorite quote by ${fav.author || 'Anonymous'}`);
    removeButton.innerHTML = '<i class="fa-solid fa-circle-xmark fs-5"></i>';

    body.appendChild(quote);
    body.appendChild(author);
    actions.appendChild(removeButton);
    itemEl.appendChild(body);
    itemEl.appendChild(actions);

    removeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFavoriteById(fav.id);
    });
    
    favoritesContainer.appendChild(itemEl);
  });
}

function handleFavoritesSearch(event) {
  favoritesFilters.search = event.target.value.trim().toLowerCase();
  renderFavoritesList();
}

function handleFavoritesFilterChange() {
  favoritesFilters.author = favoritesAuthorFilter.value;
  favoritesFilters.length = favoritesLengthFilter.value;
  renderFavoritesList();
}

function syncFavoritesFilterOptions() {
  const authors = Array.from(new Set(favorites.map((fav) => fav.author || 'Anonymous'))).sort((left, right) => left.localeCompare(right));
  favoritesAuthorFilter.innerHTML = '<option value="all">All authors</option>';

  authors.forEach((author) => {
    const option = document.createElement('option');
    option.value = author;
    option.textContent = author;
    favoritesAuthorFilter.appendChild(option);
  });

  if (!authors.includes(favoritesFilters.author)) {
    favoritesFilters.author = 'all';
  }

  favoritesAuthorFilter.value = favoritesFilters.author;
  favoritesLengthFilter.value = favoritesFilters.length;
}

function getFilteredFavorites() {
  return favorites.filter((favorite) => {
    const matchesSearch = favoritesFilters.search === '' || favorite.text.toLowerCase().includes(favoritesFilters.search);
    const authorName = favorite.author || 'Anonymous';
    const matchesAuthor = favoritesFilters.author === 'all' || authorName === favoritesFilters.author;
    const matchesLength = matchesQuoteLength(favorite.text, favoritesFilters.length);

    return matchesSearch && matchesAuthor && matchesLength;
  });
}

function matchesQuoteLength(text, lengthFilter) {
  if (lengthFilter === 'all') {
    return true;
  }

  const wordCount = text.trim().split(/\s+/).length;

  if (lengthFilter === 'short') {
    return wordCount <= 8;
  }

  if (lengthFilter === 'medium') {
    return wordCount >= 9 && wordCount <= 16;
  }

  return wordCount >= 17;
}

function updateFavoritesResultsSummary(matchCount) {
  favoritesResultsSummary.classList.remove('d-none');
  favoritesResultsSummary.textContent = `Showing ${matchCount} of ${favorites.length} favorite quote${favorites.length === 1 ? '' : 's'}.`;
}

// -------------------------------------------------------------
// SOCIAL MEDIA SHARE OPERATIONS (Requirements 3 & 13)
// -------------------------------------------------------------
function getShareText() {
  if (quotesList.length === 0 || currentIndex === -1) return '';
  const currentQuote = quotesList[currentIndex];
  return `"${currentQuote.text}" - ${currentQuote.author || 'Anonymous'} via Inspiria`;
}

function shareOnTwitter() {
  const text = getShareText();
  if (!text) return;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function shareOnLinkedIn() {
  const text = getShareText();
  if (!text) return;
  const siteUrl = window.location.origin;
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}&summary=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function shareOnFacebook() {
  const siteUrl = window.location.origin;
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function copyQuoteToClipboard() {
  const text = getShareText();
  if (!text) return;
  
  navigator.clipboard.writeText(text).then(() => {
    showToast("Inspirational Quote copied to Clipboard!", "fa-copy text-success");
  }).catch((err) => {
    console.error("Clipboard operational interface failure:", err);
    showToast("Copy failed, please highlight manually.", "fa-circle-xmark text-danger");
  });
}

function handleGlobalShortcuts(event) {
  if (shouldIgnoreShortcut(event)) {
    return;
  }

  const key = event.key.toLowerCase();

  if (key === 'n') {
    event.preventDefault();
    if (!homeView.classList.contains('d-none')) {
      slideNextQuote();
      resetProgressTrack();
    }
    return;
  }

  if (key === 'f') {
    event.preventDefault();
    if (!homeView.classList.contains('d-none')) {
      toggleCurrentFavorite();
    }
    return;
  }

  if (event.code === 'Space') {
    event.preventDefault();
    if (!homeView.classList.contains('d-none')) {
      toggleCycleState();
    }
  }
}

function shouldIgnoreShortcut(event) {
  const target = event.target;

  if (!target) {
    return false;
  }

  if (event.metaKey || event.ctrlKey || event.altKey) {
    return true;
  }

  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

function announceCurrentQuote(quote) {
  if (!quoteAnnouncer) {
    return;
  }

  quoteAnnouncer.textContent = `Now showing quote by ${quote.author || 'Anonymous'}: ${quote.text}`;
}

// -------------------------------------------------------------
// UTILITIES & VISUAL ELEMENT TOGGLES (Requirements 12 & 14)
// -------------------------------------------------------------
function showSpinner() {
  spinner.classList.remove('d-none');
  quoteWrapper.classList.add('d-none');
}

function hideSpinner() {
  spinner.classList.add('d-none');
}

function showError(msg) {
  hideSpinner();
  quoteWrapper.classList.add('d-none');
  errorContainer.classList.remove('d-none');
  errorMessage.textContent = msg;
}

function hideError() {
  errorContainer.classList.add('d-none');
}

function showToast(message, iconClass) {
  if (!bootstrapToast) return;
  toastMessage.textContent = message;
  toastIcon.className = `fa-solid ${iconClass}`;
  bootstrapToast.show();
}
