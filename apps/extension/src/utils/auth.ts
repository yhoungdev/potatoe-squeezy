import browser from "webextension-polyfill";
import { supabaseObject } from "../../libs/supabase";

export async function getAuthState() {
  const { authState } = await browser.storage.local.get("authState");
  return authState;
}

export async function checkSession() {
  try {
    const authState = await getAuthState();

    if (!authState?.access_token) {
      return null;
    }

    const {
      data: { session },
      error,
    } = await supabaseObject.auth.getSession();

    if (error || !session) {
      await browser.storage.local.remove("authState");
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error checking session:", error);
    return null;
  }
}
