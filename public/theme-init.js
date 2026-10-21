// Apply the stored preference before the application and its styles load.
;(() => {
  let preference = 'system'
  try {
    const stored = window.localStorage.getItem('devflow-theme')
    if (stored === 'light' || stored === 'dark') preference = stored
  } catch {
    // Storage can be unavailable; the system preference still works.
  }
  const theme =
    preference === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : preference
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#111b15' : '#f6f8f6')
})()
