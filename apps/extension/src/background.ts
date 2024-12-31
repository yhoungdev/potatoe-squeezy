import browser from "webextension-polyfill";
import { supabaseObject } from "../libs/supabase";

console.log("Extension background script initialized.");

// Listen for tab updates
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const redirectURL = browser.identity.getRedirectURL();
  if (changeInfo.url?.startsWith(redirectURL)) {
    console.log("OAuth redirect detected:", changeInfo.url);
    finishUserOAuth(changeInfo.url, tabId);
  }
});

async function finishUserOAuth(url: string, tabId: number) {
  try {
    console.log("Handling user OAuth callback...");
    const supabase = supabaseObject;

    const hashMap = parseUrlHash(url);
    const access_token = hashMap.get("access_token");
    const refresh_token = hashMap.get("refresh_token");

    if (!access_token || !refresh_token) {
      throw new Error("No Supabase tokens found in URL hash");
    }

    // Set the session in Supabase
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) throw new Error(`Error setting session: ${error.message}`);

    // Store auth state in extension's storage
    await browser.storage.local.set({
      authState: {
        access_token,
        refresh_token,
        session: data.session,
        timestamp: Date.now(),
      },
    });

    // Broadcast auth success message
    await browser.runtime.sendMessage({
      type: "AUTH_SUCCESS",
      data: data.session,
    });

    // Close the auth tab and update popup
    await browser.tabs.remove(tabId);

    // Refresh extension popup
    const views = browser.extension.getViews({ type: "popup" });
    for (const view of views) {
      view.location.reload();
    }
  } catch (error) {
    console.error("Error in finishUserOAuth:", error);
    // broadcast auth failure with proper error typing
    await browser.runtime.sendMessage({
      type: "AUTH_FAILURE",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

function parseUrlHash(url: string): Map<string, string> {
  try {
    const hashParts = new URL(url).hash.slice(1).split("&");
    return new Map(
      hashParts.map((part) => {
        const [name, value] = part.split("=");
        return [decodeURIComponent(name), decodeURIComponent(value)];
      }),
    );
  } catch (error) {
    console.error("Error parsing URL hash:", error);
    return new Map();
  }
}
