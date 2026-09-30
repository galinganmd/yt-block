(function () {
  'use strict';

  // 1. Intercept ytInitialPlayerResponse to remove ad payloads before load
  let rawPlayerResponse = window.ytInitialPlayerResponse;
  Object.defineProperty(window, 'ytInitialPlayerResponse', {
    get() {
      return rawPlayerResponse;
    },
    set(value) {
      if (value && typeof value === 'object') {
        if (value.adPlacements) delete value.adPlacements;
        if (value.playerAds) delete value.playerAds;
        if (value.adSlots) delete value.adSlots;
      }
      rawPlayerResponse = value;
    },
    configurable: true
  });

  // 2. Fast-forward and skip any active video ads (Desktop + Mobile)
  function handleVideoAds() {
    const video = document.querySelector('video');
    const adContainer = document.querySelector('.ad-showing, .ad-interrupting, .video-ads');
    
    if (adContainer && video) {
      video.muted = true;
      if (!isNaN(video.duration) && isFinite(video.duration)) {
        video.currentTime = video.duration;
      }
      video.playbackRate = 16.0;
    }

    // Automatically click skip buttons if present (Desktop & Mobile class names)
    const skipButton = document.querySelector(
      '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-slot, .ytm-ad-module'
    );
    if (skipButton) {
      skipButton.click();
    }
  }

  // Observe page changes to catch dynamically loaded video ads
  const observer = new MutationObserver(handleVideoAds);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  setInterval(handleVideoAds, 250);
})();
