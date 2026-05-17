// popup.js — wires the popup UI to chrome.storage.local.

(function () {
  const $green = document.getElementById("n-green");
  const $orange = document.getElementById("n-orange");
  const $red = document.getElementById("n-red");
  const $meta = document.getElementById("last-meta");
  const $hideRed = document.getElementById("hide-red");

  // Load stats + settings
  chrome.storage.local.get(
    ["lastStats", "lastUrl", "lastUpdatedAt", "settings"],
    (result) => {
      const s = result.lastStats || { green: 0, orange: 0, red: 0 };
      $green.textContent = s.green;
      $orange.textContent = s.orange;
      $red.textContent = s.red;

      if (result.lastUpdatedAt) {
        const when = new Date(result.lastUpdatedAt);
        const ago = formatAgo(Date.now() - when.getTime());
        const url = result.lastUrl ? new URL(result.lastUrl).pathname : "unknown";
        $meta.textContent = `Scanned ${ago} on ${url}`;
      }

      const settings = result.settings || {};
      $hideRed.checked = !!settings.hideRed;
    }
  );

  // Persist toggle changes
  $hideRed.addEventListener("change", () => {
    chrome.storage.local.get(["settings"], (result) => {
      const next = Object.assign({}, result.settings || {}, {
        hideRed: $hideRed.checked
      });
      chrome.storage.local.set({ settings: next });
    });
  });

  function formatAgo(ms) {
    const sec = Math.round(ms / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.round(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return `${Math.round(hr / 24)}d ago`;
  }
})();
