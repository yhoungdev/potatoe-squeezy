import browser from "webextension-polyfill";

console.log("Potatoe 🍟 background script initialized (Supabase removed).");

browser.runtime.onInstalled.addListener(() => {
  console.log("Potatoe extension installed.");
});
