// Waits until a page has finished streaming: no element still marked aria-busy (loading skeletons) and a
// document title (Next.js streams the metadata after the shell). The audits must judge the page a visitor reads,
// not its loading skeleton. Returns false when the page is still loading after `timeoutMs`: that is a finding.
export async function waitForSettledPage(page, timeoutMs = 15000) {
  try {
    await page.waitForFunction(
      () => document.title.trim().length > 0 && document.querySelector('[aria-busy="true"]') === null,
      undefined,
      { timeout: timeoutMs, polling: 250 },
    );
    return true;
  } catch {
    return false;
  }
}
