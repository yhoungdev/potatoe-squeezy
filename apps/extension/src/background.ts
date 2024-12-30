import browser from "webextension-polyfill";
import { supabaseObject } from "../libs/supabase";

console.log("Extension background script initialized.");

// Listen for tab updates to detect Supabase OAuth redirect
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const redirectURL = browser.identity.getRedirectURL();
    if (changeInfo.url?.startsWith(redirectURL)) {
        console.log("OAuth redirect detected:", changeInfo.url);
        finishUserOAuth(changeInfo.url, tabId);
    }
});

// Handle Supabase OAuth callback
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

        // Set the session using Supabase
        const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
        });

        if (error) throw new Error(`Error setting session: ${error.message}`);

        // Save session to local storage
        await browser.storage.local.set({ session: data.session });
        console.log("Session saved to local storage:", data.session);

        // Redirect the tab to a post-login page
        await browser.tabs.update(tabId, { url: "https://potatoesqueezy.xyz/" });
        console.log("Redirected to post-login page.");
    } catch (error) {
        console.error("Error in finishUserOAuth:", error);
    }
}

// Parse URL hash to extract tokens
function parseUrlHash(url: string): Map<string, string> {
    try {
        const hashParts = new URL(url).hash.slice(1).split("&");
        return new Map(
            hashParts.map((part) => {
                const [name, value] = part.split("=");
                return [decodeURIComponent(name), decodeURIComponent(value)];
            })
        );
    } catch (error) {
        console.error("Error parsing URL hash:", error);
        return new Map();
    }
}
