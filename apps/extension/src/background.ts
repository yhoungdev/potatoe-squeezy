import browser from "webextension-polyfill";

const defaultUrl = 'http://localhost:4321/';

console.log("Potatoe from the background!");

browser.runtime.onInstalled.addListener((details) => {
    console.log("Extension installed:", details);

    getCookiesForDomain(defaultUrl);
});

async function getCookiesForDomain(domain) {
    try {
        const cookieStores = await browser.cookies.getAllCookieStores();
        const token = await  browser.cookies.getAll({domain});
        console.log("Cookies:", token , "=====");
        for (let store of cookieStores) {
            if (store.domain === domain) {
                const cookies = await browser.cookies.getAll({ domain });

                if (cookies.length > 0) {
                    console.log(`Cookies for domain ${domain}:`, cookies);
                    cookies.forEach(cookie => {
                        console.log(`Cookie name: ${cookie.name}, Cookie value: ${cookie.value}`);
                    });
                } else {
                    console.log(`No cookies found for domain ${domain}`);
                }
                return;
            }
        }

        console.log(`No matching cookie store found for domain ${domain}`);
    } catch (error) {
        console.error("Error fetching cookies:", error);
    }
}
