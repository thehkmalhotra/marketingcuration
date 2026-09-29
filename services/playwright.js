import "server-only";

import { chromium } from "playwright";

let browser = null;

export async function getBrowser() {

  if (browser && browser.isConnected()) {
    return browser;
  }

  browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  });

  return browser;
}

export async function createContext(cookies = []) {

  const browser = await getBrowser();

  const context = await browser.newContext();

  if (cookies.length > 0) {
    await context.addCookies(cookies);
  }

  return context;
}

export async function createPage(cookies = []) {

  const context = await createContext(cookies);

  const page = await context.newPage();

  return {
    page,
    context
  };
}