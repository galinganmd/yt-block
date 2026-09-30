// Inject custom CSS to immediately hide both desktop and mobile ad containers
const style = document.createElement('style');
style.textContent = `
  /* Desktop & Mobile Ad Selectors */
  .video-ads,
  .ytp-ad-module,
  .ytp-ad-overlay-container,
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
  #player-ads,
  #masthead-ad,
  .ad-container,
  .ad-interrupting {
    display: none !important;
  }
`;
(document.head || document.documentElement).appendChild(style);

// Inject script directly into the page context
const script = document.createElement('script');
script.src = browser.runtime.getURL('inject.js');
script.onload = () => script.remove();
(document.head || document.documentElement).appendChild(script);
