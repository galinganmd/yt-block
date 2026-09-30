// Inject custom CSS to immediately hide ad elements without breaking the video canvas pipeline
const style = document.createElement('style');
style.textContent = `
  /* Banner, Sidebar, and App Promo Ads (Safe to completely destroy) */
  ytm-promoted-sparkles-web-renderer,
  ytm-display-ad-renderer,
  ytm-companion-ad-renderer,
  ytm-ad-slot-renderer,
  ytm-promoted-item-renderer,
  ytd-promoted-sparkles-web-renderer,
  ytd-display-ad-renderer,
  ytd-statement-banner-renderer,
  ytd-banner-promo-renderer,
  ytd-ad-slot-renderer,
  #masthead-ad,
  #player-ads {
    display: none !important;
  }

  /* Overlay text/image ads inside the video player timeline */
  .ytp-ad-overlay-container,
  .ytp-ad-overlay-image,
  .ytp-ad-image-overlay {
    display: none !important;
  }

  /* 
    CRITICAL FIX: 
    Do NOT hide '.video-ads', '.ad-containers', or '.ad-interrupting' with display: none.
    Instead, minimize overlay UI components or make them invisible without breaking 
    the active video canvas rendering engine context.
  */
  .ytp-ad-player-overlay, 
  .ytp-ad-player-overlay-flyout-container {
    opacity: 0 !important;
    pointer-events: none !important;
  }
`;
(document.head || document.documentElement).appendChild(style);

// Inject script directly into the page context
const script = document.createElement('script');
script.src = browser.runtime.getURL('inject.js');
script.onload = () => script.remove();
(document.head || document.documentElement).appendChild(script);
