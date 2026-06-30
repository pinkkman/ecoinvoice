import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export async function launchBrowser() {
  const isLocal = process.env.NODE_ENV === "development";

  const executablePath = isLocal
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" // adjust for your OS
    : await chromium.executablePath();

  return puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });
}