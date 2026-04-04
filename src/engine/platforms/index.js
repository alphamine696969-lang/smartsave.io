// ═══════════════════════════════════════════════════════════
// SmartSave.io — Platform Registry
//
// Central registry mapping platformId → PlatformConfig + handler factory.
// Adding a new platform requires ONLY:
//   1. Create src/engine/platforms/myplatform.js
//   2. Import it here
//   3. Call registry.register(MyPlatform)
//
// Zero changes to DownloaderEngine, download.js, router.js, or main.js.
// ═══════════════════════════════════════════════════════════

import * as YouTube   from './youtube.js';
import * as Instagram from './instagram.js';
import * as Twitter   from './twitter.js';
import * as Pinterest from './pinterest.js';
import * as TikTok    from './tiktok.js';
import * as Facebook  from './facebook.js';

/**
 * Platform Registry — maps platformId → adapter module.
 * Adapter modules expose { PlatformConfig, usePlatformHandler }.
 */
class PlatformRegistry {
  constructor() {
    /** @type {Map<string, { PlatformConfig: object, usePlatformHandler: function }>} */
    this._map = new Map();
  }

  /**
   * Register a platform adapter module.
   * @param {{ PlatformConfig: object, usePlatformHandler: function }} adapterModule
   */
  register(adapterModule) {
    const { PlatformConfig } = adapterModule;
    if (!PlatformConfig?.id) {
      throw new Error('[PlatformRegistry] Adapter module must export a PlatformConfig with an id.');
    }
    this._map.set(PlatformConfig.id, adapterModule);
  }

  /**
   * Look up a platform by its ID (as returned by urlParser).
   * @param {string} platformId
   * @returns {{ PlatformConfig: object, usePlatformHandler: function } | null}
   */
  get(platformId) {
    return this._map.get(platformId) ?? null;
  }

  /**
   * Returns all registered PlatformConfig objects (useful for rendering
   * "Supported Platforms" grids without hardcoding the list).
   * @returns {object[]}
   */
  getAllConfigs() {
    return [...this._map.values()].map(m => m.PlatformConfig);
  }

  /** Number of registered platforms */
  get size() {
    return this._map.size;
  }
}

// Singleton registry — import this anywhere in the app
export const registry = new PlatformRegistry();

// ── Register all supported platforms ──────────────────────
registry.register(YouTube);
registry.register(Instagram);
registry.register(Twitter);
registry.register(Pinterest);
registry.register(TikTok);
registry.register(Facebook);
