import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security and middleware
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "https://cdn.jsdelivr.net"],
      "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      "font-src": ["'self'", "https://cdnjs.cloudflare.com"],
      "img-src": ["'self'", "data:", "https://images.unsplash.com"]
    }
  }
}));
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Simulated Data Store (Quotes Database)
const quotes = [
  { id: 1, text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { id: 2, text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { id: 3, text: "Do not watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { id: 4, text: "Keep your face always toward the sunshine - and shadows will fall behind you.", author: "Walt Whitman" },
  { id: 5, text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { id: 6, text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { id: 7, text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa" },
  { id: 8, text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { id: 9, text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { id: 10, text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { id: 11, text: "The best way to predict your future is to create it.", author: "Abraham Lincoln" },
  { id: 12, text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { id: 13, text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
  { id: 14, text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { id: 15, text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" }
];

// Simple server-side in-memory cache
let cachedQuotes = null;
let lastCacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

/**
 * GET /api/quotes - Retrieve all quotes with caching
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with quotes array and cache status
 */
app.get('/api/quotes', (req, res) => {
  try {
    const currentTime = Date.now();
    
    // Simple caching mechanism
    if (cachedQuotes && (currentTime - lastCacheTime < CACHE_TTL)) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({
        success: true,
        source: 'cache',
        count: cachedQuotes.length,
        quotes: cachedQuotes
      });
    }

    // Cache miss - retrieve and serve
    cachedQuotes = quotes;
    lastCacheTime = currentTime;

    res.setHeader('X-Cache', 'MISS');
    res.json({
      success: true,
      source: 'database',
      count: quotes.length,
      quotes: quotes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Unable to retrieve quotes at this time."
    });
  }
});

/**
 * GET /api/quotes/random - Retrieve a single random quote
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with a randomly selected quote
 */
app.get('/api/quotes/random', (req, res) => {
  try {
    if (!quotes || quotes.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "No quotes available."
      });
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const selectedQuote = quotes[randomIndex];
    
    res.json({
      success: true,
      quote: selectedQuote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "An unexpected error occurred."
    });
  }
});

/**
 * GET /health - Lightweight server health check
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response describing basic server health
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Fallback for SPA static routing or 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'), { fail: () => res.status(404).send('Page not found') });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running in production mode on http://localhost:${PORT}`);
});
