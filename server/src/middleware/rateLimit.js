const stores = new Map();

export function rateLimit({ windowMs = 60_000, max = 60, message = 'Too many requests' } = {}) {
  const store = new Map();
  stores.set(store, setInterval(() => store.clear(), windowMs));

  return (req, res, next) => {
    const key = req.userId || req.ip;
    const hits = (store.get(key) || 0) + 1;
    store.set(key, hits);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(max - hits, 0));

    if (hits > max) {
      return res.status(429).json({ error: message });
    }
    next();
  };
}
