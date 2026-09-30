(function () {
  'use strict';

  // 1. Helper function to safely neutralize ad payload arrays
  function purgeAdPlacements(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    try {
      // Overwrite arrays with empty sets instead of using 'delete' 
      // This satisfies YouTube's structural property checks (.length, .map)
      if (obj.adPlacements) obj.adPlacements = [];
      if (obj.playerAds) obj.playerAds = [];
      if (obj.adSlots) obj.adSlots = [];
    } catch (e) {
      // Fail silently to ensure the native player loop doesn't freeze
    }
    return obj;
  }

  // 2. Intercept the initial bootstrap player data payload
  let rawPlayerResponse = window.ytInitialPlayerResponse;
  Object.defineProperty(window, 'ytInitialPlayerResponse', {
    get() { return rawPlayerResponse; },
    set(value) { rawPlayerResponse = purgeAdPlacements(value); },
    configurable: true
  });

  // 3. Intercept dynamic video updates (Crucial for Single Page Application routing transitions)
  window.addEventListener('yt-page-data-fetched', function (event) {
    try {
      let response = event.detail?.pageData?.playerResponse;
      if (response) {
        event.detail.pageData.playerResponse = purgeAdPlacements(response);
      }
    } catch (e) {}
  });

  // Track the user's intended playback rate and mute state to restore after an ad clears
  let userPlaybackRate = 1.0;
  let wasMutedByUser = false;

  // 4. Safe speedup engine and automated skip button interaction
  function handleActiveVideoAds() {
    const video = document.querySelector('video');
    
    // YouTube appends these classes/elements to the active player element during an ad sequence
    const adActive = document.querySelector('.ad-showing, .ad-interrupting, .ytp-ad-player-overlay, .ytm-ad-module');
    
    if (video) {
      if (adActive) {
        // Cache user preferences before tampering
        if (video.playbackRate < 16.0) {
          userPlaybackRate = video.playbackRate;
          wasMutedByUser = video.muted;
        }
        
        // Burn through the ad at 16x speed completely muted
        video.muted = true;
        video.playbackRate = 16.0;
      } else {
        // Restore previous user audio/speed states safely once the ad sequence clears
        if (video.playbackRate === 16.0) {
          video.playbackRate = userPlaybackRate;
          video.muted = wasMutedByUser;
        }
      }
    }

    // Comprehensive desktop + mobile skip button element mapping
    const skipElements = document.querySelectorAll([
      '.ytp-ad-skip-button',
      '.ytp-ad-skip-button-modern',
      '.ytp-skip-ad-button',
      '.ytp-ad-skip-button-slot',
      '[class*="skip-ad"]',
      '.button-renderer-skip-ad-instream'
    ].join(','));

    skipElements.forEach(btn => {
      if (btn && typeof btn.click === 'function') {
        btn.click();
      }
    });
  }

  // 5. Dual-trigger activation layer for execution insurance
  const observer = new MutationObserver(handleActiveVideoAds);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  
  // Backup polling fallback to protect against silent asynchronous changes
  setInterval(handleActiveVideoAds, 250);
})();
