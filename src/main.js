import puppeteer from "puppeteer";
import config from "./config";
import { login, getAuthorization } from "./navigation";
import { downloadFile, targetDirCheck } from "./file";

async function initPuppeteer() {
  try {
    console.info("Starting script...");
    const browser = await puppeteer.launch({
      args: ["--disable-features=site-per-process"],
      headless: !config.DEBUG,
      executablePath: config.CHROME_EXE,
    });
    const page = await browser.newPage();
    page.on("dialog", async (dialog) => {
      console.info("Skipping dialog:", dialog.message());
      await dialog.dismiss();
    });
    return { browser, page };
  } catch (error) {
    console.error("Error during puppeteer initialisation:", error);
  }
}

export default async function main() {
  const { browser, page } = await initPuppeteer();
  if (!targetDirCheck() || !(await login(page))) {
    throw new Error("Error during init");
  }
  await getAuthorization(page);
  await downloadFile(page);

  process.on("exit", (code) => {
    console.log(`Exiting with code ${code}`);
  });
}
