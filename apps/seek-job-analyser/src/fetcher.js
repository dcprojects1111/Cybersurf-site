// fetcher.js — HTTP layer for SEEK job pages.
//
// Single responsibility: given a SEEK URL, return the raw HTML string.
// Sets a real User-Agent, follows redirects, gives clear errors on failure.

import axios from "axios";

const DEFAULT_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const SEEK_HOST = "seek.com.au";

export function isSeekUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname.endsWith(SEEK_HOST);
  } catch {
    return false;
  }
}

export async function fetchJobPage(url, { timeoutMs = 15000 } = {}) {
  if (!isSeekUrl(url)) {
    throw new Error(`Not a SEEK URL: ${url}`);
  }

  try {
    const res = await axios.get(url, {
      timeout: timeoutMs,
      maxRedirects: 5,
      headers: {
        "User-Agent": DEFAULT_UA,
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-AU,en;q=0.9",
      },
      validateStatus: (s) => s >= 200 && s < 400,
    });

    if (typeof res.data !== "string" || res.data.length < 500) {
      throw new Error("SEEK returned an unexpectedly small page body.");
    }

    return {
      url,
      finalUrl: res.request?.res?.responseUrl || url,
      status: res.status,
      html: res.data,
    };
  } catch (err) {
    if (err.response) {
      throw new Error(
        `SEEK request failed: HTTP ${err.response.status} for ${url}`
      );
    }
    if (err.code === "ECONNABORTED") {
      throw new Error(`SEEK request timed out after ${timeoutMs}ms`);
    }
    throw new Error(`SEEK request failed: ${err.message}`);
  }
}
