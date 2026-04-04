// ═══════════════════════════════════════════════════════════
// SmartSave.io — Downloader Store
// Lightweight pub-sub store for cross-component state.
// Does NOT replace the engine's internal ctx — supplements it.
// ═══════════════════════════════════════════════════════════

const _store = {
  currentPlatform:  null,   // platformId of the active dedicated page (null = generic)
  inputUrl:         '',
  detectedPlatform: null,   // platformId parsed from the last URL input
  status:           'idle', // 'idle' | 'loading' | 'success' | 'error'
  errorMessage:     null,
  _subscribers:     new Set(),

  /** Merge patch into store and notify all subscribers */
  set(patch) {
    Object.assign(this, patch);
    this._subscribers.forEach(fn => fn(this.snapshot()));
  },

  /** Subscribe to store changes. Returns an unsubscribe function. */
  subscribe(fn) {
    this._subscribers.add(fn);
    return () => this._subscribers.delete(fn);
  },

  /** Return a clean snapshot (no internals) */
  snapshot() {
    return {
      currentPlatform:  this.currentPlatform,
      inputUrl:         this.inputUrl,
      detectedPlatform: this.detectedPlatform,
      status:           this.status,
      errorMessage:     this.errorMessage,
    };
  },
};

export { _store as downloaderStore };
