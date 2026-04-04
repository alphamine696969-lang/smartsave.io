// ═══════════════════════════════════════════════════════════
// SmartSave.io — DownloaderEngine State Machine
// Pure function: (currentState, event) → nextState
// No DOM, no side effects. Fully testable in isolation.
// ═══════════════════════════════════════════════════════════

/**
 * All valid states in the downloader state machine.
 * The UI renders exclusively based on this enum — no ad-hoc flags.
 */
export const States = Object.freeze({
  IDLE:        'idle',        // Awaiting URL input
  PARSING:     'parsing',     // URL being validated & platform detected
  INVALID:     'invalid',     // URL invalid or platform unsupported
  FETCHING:    'fetching',    // Calling /api/info to get media metadata
  READY:       'ready',       // Media info fetched; formats available
  DOWNLOADING: 'downloading', // Background download job is running
  SUCCESS:     'success',     // File downloaded to browser
  ERROR:       'error',       // Any unrecoverable error
});

/**
 * Events dispatched by the orchestrator to drive transitions.
 */
export const Events = Object.freeze({
  SUBMIT:          'SUBMIT',          // User submitted a URL
  PARSE_OK:        'PARSE_OK',        // URL parsed → platform detected
  PARSE_FAIL:      'PARSE_FAIL',      // URL malformed or platform unsupported
  FETCH_START:     'FETCH_START',     // API call initiated
  FETCH_OK:        'FETCH_OK',        // API responded with media info
  FETCH_FAIL:      'FETCH_FAIL',      // API call failed
  DOWNLOAD_START:  'DOWNLOAD_START',  // User selected a format, job started
  DOWNLOAD_OK:     'DOWNLOAD_OK',     // Job complete, file delivered
  DOWNLOAD_FAIL:   'DOWNLOAD_FAIL',   // Job failed during processing
  RESET:           'RESET',           // User wants to start over
});

/**
 * Transition table — explicit mapping of (state × event) → next state.
 * Any transition NOT listed here is a no-op (returns current state).
 * This makes illegal transitions impossible by design.
 */
const TRANSITIONS = {
  [States.IDLE]: {
    [Events.SUBMIT]: States.PARSING,
  },
  [States.PARSING]: {
    [Events.PARSE_OK]:   States.FETCHING,
    [Events.PARSE_FAIL]: States.INVALID,
  },
  [States.INVALID]: {
    [Events.SUBMIT]: States.PARSING,  // Allow retry after fixing URL
    [Events.RESET]:  States.IDLE,
  },
  [States.FETCHING]: {
    [Events.FETCH_OK]:   States.READY,
    [Events.FETCH_FAIL]: States.ERROR,
  },
  [States.READY]: {
    [Events.DOWNLOAD_START]: States.DOWNLOADING,
    [Events.RESET]:          States.IDLE,
    [Events.SUBMIT]:         States.PARSING, // Allow user to paste a new URL
  },
  [States.DOWNLOADING]: {
    [Events.DOWNLOAD_OK]:   States.SUCCESS,
    [Events.DOWNLOAD_FAIL]: States.ERROR,
  },
  [States.SUCCESS]: {
    [Events.RESET]:  States.IDLE,
    [Events.SUBMIT]: States.PARSING, // Download again with different URL
  },
  [States.ERROR]: {
    [Events.RESET]:  States.IDLE,
    [Events.SUBMIT]: States.PARSING,
  },
};

/**
 * Pure transition function.
 * @param {string} currentState - one of States
 * @param {string} event - one of Events
 * @returns {string} - the next state (or currentState if transition not defined)
 */
export function transition(currentState, event) {
  const nextState = TRANSITIONS[currentState]?.[event];
  if (!nextState) {
    // Log in dev only — illegal transitions are silently ignored in prod
    if (import.meta.env?.DEV) {
      console.warn(`[StateMachine] No transition: ${currentState} × ${event}`);
    }
    return currentState;
  }
  return nextState;
}

/**
 * Helper: is this state one of the "loading" states?
 * Used to show spinners without coupling UI to specific state names.
 */
export function isLoadingState(state) {
  return state === States.PARSING || state === States.FETCHING || state === States.DOWNLOADING;
}

/**
 * Helper: can the user interact with the URL input in this state?
 */
export function isInputEnabled(state) {
  return state !== States.FETCHING && state !== States.DOWNLOADING;
}
