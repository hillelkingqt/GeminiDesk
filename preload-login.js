// This script runs before the Google login page loads.
// Its purpose is to hide signs of automation from the page's JavaScript environment.

// 1. Hide the 'webdriver' flag from the navigator
// Google scripts often check for this flag to detect automated browsers.
Object.defineProperty(navigator, 'webdriver', {
  get: () => undefined,
});

// 2. Pretend to be a real Chrome browser in other ways
// Some fingerprinting scripts check these properties.
if (navigator.brave) {
    Object.defineProperty(navigator, 'brave', {
        get: () => undefined,
        set: () => {}
    });
}
