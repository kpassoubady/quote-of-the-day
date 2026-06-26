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

  // Manual actions
  nextBtn.addEventListener('click', () => {
    slideNextQuote();
    resetProgressTrack();
  });
  
  favoriteBtn.addEventListener('click', toggleCurrentFavorite);
  
  togglePauseBtn.addEventListener('click', toggleCycleState);
  retryBtn.addEventListener('click', fetchQuotes);
  clearAllFavs.addEventListener('click', clearAllFavorites);

  // Social Share bindings
  shareTwitter.addEventListener('click', shareOnTwitter);
  shareLinkedin.addEventListener('click', shareOnLinkedIn);
  shareFacebook.addEventListener('click', shareOnFacebook);
  copyClipboard.addEventListener('click', copyQuoteToClipboard);
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
  renderFavoritesList();
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

    // Modern Unsplash backgrounds transition based on random select index values
    changeVisualCardBackground();

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
    showToast("Quote removed from favorites.", "fa-heart-broken text-warning");
  } else {
    // Add
    favorites.push(currentQuote);
    heartIcon.className = 'fa-solid fa-heart text-danger';
    showToast("Saved quote to local collection!", "fa-heart text-danger");
  }
  saveFavorites();
}

function removeFavoriteById(id) {
  favorites = favorites.filter(fav => fav.id !== id);
  saveFavorites();
  renderFavoritesList();
  
  // Synchronize icon highlight if we deleted active index item
  if (quotesList.length > 0 && currentIndex !== -1 && quotesList[currentIndex].id === id) {
    heartIcon.className = 'fa-regular fa-heart text-white';
  }
  showToast("Quote removed.", "fa-circle-minus text-secondary");
}

function clearAllFavorites() {
  if (confirm("Are you sure you want to parse out and delete all favorite quotes from your browser space?")) {
    favorites = [];
    saveFavorites();
    renderFavoritesList();
    if (quotesList.length > 0) {
      heartIcon.className = 'fa-regular fa-heart text-white';
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
  
  if (favorites.length === 0) {
    favoritesEmptyState.classList.remove('d-none');
    return;
  }
  
  favoritesEmptyState.classList.add('d-none');
  
  favorites.forEach(fav => {
    const itemEl = document.createElement('div');
    itemEl.className = 'list-group-item d-flex justify-content-between align-items-center py-3 px-2 fav-item rounded-3 mb-2';
    
    // Escalate item contents safely and construct inner HTML layout structure
    itemEl.innerHTML = `
      <div class="me-3 text-start">
        <p class="mb-1 font-serif text-dark fs-5">"${fav.text}"</p>
        <span class="text-muted small italic">- ${fav.author || 'Anonymous'}</span>
      </div>
      <div>
        <button class="btn btn-outline-danger btn-sm border-0 btn-remove-fav px-2" title="Delete Saved Quote">
          <i class="fa-solid fa-circle-xmark fs-5"></i>
        </button>
      </div>
    `;
    
    // Bind internal handler action to the element item trash button directly
    itemEl.querySelector('.btn-remove-fav').addEventListener('click', (e) => {
      e.stopPropagation();
      removeFavoriteById(fav.id);
    });
    
    favoritesContainer.appendChild(itemEl);
  });
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
