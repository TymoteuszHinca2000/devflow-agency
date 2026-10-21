export function updatePageTitle(pathname: string) {
  const heading = document.querySelector('main h1')?.textContent?.trim()
  document.title =
    pathname === '/'
      ? 'DevFlow Agency — Twoja agencja. Jeden flow.'
      : `${heading ?? 'DevFlow Agency'} — DevFlow Agency`
}
