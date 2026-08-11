/**
 * Client-side Analytics Helpers
 */

export function trackClick(buttonId: string) {
  fetch("/api/stats/click", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ buttonId })
  }).catch(err => {
    console.error("Failed to log analytics click:", err);
  });
}

export function trackVisit() {
  fetch("/api/stats/visit", {
    method: "POST"
  }).catch(err => {
    console.error("Failed to log analytics visit:", err);
  });
}
