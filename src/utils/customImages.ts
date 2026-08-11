export function getCustomImage(key: string, defaultSrc: string): string {
  try {
    const saved = localStorage.getItem(`custom_img_${key}`);
    if (saved && saved.trim() !== "") {
      return saved;
    }
  } catch (e) {
    console.error("Failed to read custom image:", e);
  }
  return defaultSrc;
}

export function saveAssetImageToServer(key: string, base64Url: string) {
  if (!base64Url || !base64Url.startsWith("data:image")) return;
  fetch("/api/save-asset-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, base64: base64Url })
  })
    .then(res => res.json())
    .then(data => {
      console.log(`Synced image '${key}' to assets folder:`, data);
    })
    .catch(err => {
      console.error(`Failed to save image '${key}' to server assets:`, err);
    });
}

export function setCustomImage(key: string, base64Url: string): void {
  try {
    localStorage.setItem(`custom_img_${key}`, base64Url);
    window.dispatchEvent(new Event("custom_images_updated"));
    saveAssetImageToServer(key, base64Url);
  } catch (e) {
    console.error("Failed to set custom image:", e);
  }
}

export function removeCustomImage(key: string): void {
  try {
    localStorage.removeItem(`custom_img_${key}`);
    window.dispatchEvent(new Event("custom_images_updated"));
  } catch (e) {
    console.error("Failed to remove custom image:", e);
  }
}

export function syncAllCustomImagesToAssets(): void {
  try {
    const keys = [
      "logo",
      "hero_bg",
      "fleet_Economy",
      "fleet_Luxury",
      "fleet_Family",
      "transfer_airport",
      "transfer_port",
      "transfer_station",
      "transfer_city",
      "transfer_business"
    ];

    for (const key of keys) {
      const saved = localStorage.getItem(`custom_img_${key}`);
      if (saved && saved.startsWith("data:image")) {
        saveAssetImageToServer(key, saved);
      }
    }
  } catch (e) {}
}

if (typeof window !== "undefined") {
  setTimeout(() => {
    syncAllCustomImagesToAssets();
  }, 300);
}

