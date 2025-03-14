import browser from "webextension-polyfill";
import { supabaseObject } from "../libs/supabase";

console.log("Potatoe 🍟  background script initialized.");

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const param = parseUrlParams(changeInfo.url);
    const getToken = param?.get("access_token");

    console.log("Extracted access_token:", getToken);

    if (getToken) {
      browser.storage.local
        .set({ access_token: getToken })
        .then(() => console.log("Token saved to storage"))
        .catch((err) => console.error("Error saving token to storage:", err));
    }

    browser.storage.local
      .get(["access_token"])
      .then((result) => {
        console.log("Stored access_token:", result.access_token);
      })
      .catch((err) => console.error("Error fetching token from storage:", err));

    const redirectURL = browser.identity.getRedirectURL();
    if (changeInfo.url.startsWith(redirectURL)) {
      console.log("OAuth redirect detected:", changeInfo.url);
      finishUserOAuth(changeInfo.url, tabId);
    } else {
      console.log("No matching redirect URL.");
    }
  }
});

async function finishUserOAuth(url: string, tabId: number | null) {
  try {
    console.log("Handling user OAuth callback...");
    const supabase = supabaseObject;

    const params = parseUrlParams(url);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) {
      console.error("Missing tokens:", { access_token, refresh_token });
      throw new Error("No Supabase tokens found in URL.");
    }

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error || !data?.session) {
      console.error("Failed to set session:", error || "No session returned");
      throw new Error("Supabase session setup failed");
    }

    console.log("Supabase session set:", data.session);

    await browser.storage.local.set({ session: data.session });
    console.log("Session saved to local storage.");

    if (tabId) {
      await browser.tabs.update(tabId, { url: "https://potatoesqueezy.xyz/" });
      console.log("Redirected to post-login page.");
    }
  } catch (error) {
    console.error("Error in finishUserOAuth:", error);
  }
}

function parseUrlParams(url: string): Map<string, string> {
  try {
    const urlObj = new URL(url);
    const params = new Map();

    urlObj.searchParams.forEach((value, key) => {
      params.set(key, value);
    });

    if (urlObj.hash) {
      const hashParts = urlObj.hash.slice(1).split("&");
      hashParts.forEach((part) => {
        const [key, value] = part.split("=");
        params.set(decodeURIComponent(key), decodeURIComponent(value));
      });
    }

    return params;
  } catch (error) {
    console.error("Error parsing URL params:", error);
    return new Map();
  }
}

async function initiateGitHubOAuth() {
  const supabase = supabaseObject;
  const redirectURL = browser.identity.getRedirectURL();

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: redirectURL,
        scopes: ["read:user"],
      },
    });

    if (error) {
      console.error("Error initiating GitHub OAuth:", error);
      throw error;
    }

    console.log("GitHub OAuth initiated:", data);
  } catch (error) {
    console.error("Error initiating GitHub OAuth:", error);
  }
}

initiateGitHubOAuth();
