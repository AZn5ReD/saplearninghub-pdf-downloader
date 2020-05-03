import puppeteer from "puppeteer";
import constant from "./constants.json";
import config from "../config.json"; // TODO Use CLI args ?

async function initPuppeteer() {
  try {
    console.info("Starting script...");
    const browser = await puppeteer.launch({
      args: ["--disable-features=site-per-process"],
      headless: false,
    });
    const page = await browser.newPage();
    return { browser, page };
  } catch (error) {
    console.error("Error during puppeteer initialisation:", error);
  }
}

async function redirection(page) {
  await page.waitForNavigation();
  console.info("Redirected to:", page.url());
}

async function login(page) {
  try {
    console.info("Going to:", constant.LEARNINGHUB_URL);
    await page.goto(constant.LEARNINGHUB_URL, { followRedirect: true });
    await page.waitForSelector(constant.LOGIN_SELECTOR, {
      visible: true,
    });

    console.info("Entering login:", config.LOGIN);
    await page.type(constant.LOGIN_SELECTOR, config.LOGIN);
    await page.click(constant.SUBMIT_SELECTOR);

    console.info("Entering password: ***");
    await page.type(constant.PASSWORD_SELECTOR, config.PASSWORD);
    await page.click(constant.SUBMIT_SELECTOR);

    console.log("Submiting...");
    await redirection(page);
    await redirection(page);

    if (page.url() === constant.URL_CONNECTED) {
      console.info("Connected :)");
      return true;
    } else {
      console.error("Can't connect :(");
      return false;
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
}

async function cookiePopup(page) {
  try {
    const frame = await page
      .mainFrame()
      .childFrames()
      .find((f) => {
        return f.name().startsWith("pop-frame") ? f : null;
      });
    if (!frame) {
      console.info("No cookie consent");
      return;
    }
    await frame.waitForSelector("a[class='call']");
    await frame.click("a[class='call']");
    console.info("Cookie consent accepted");
    await page.waitForNavigation();
  } catch (error) {
    console.error("Error during cookie consent:", error);
  }
}

async function navToSF(page) {
  const links = await page.$x("//a[contains(text(), 'Browse Content')]");
  if (links.length <= 0) {
    console.error("Can't find SuccessFactor Link");
    return;
  }
  await page.evaluateHandle((el) => {
    el.target = "_self";
  }, links[0]);
  await links[0].click();
  await redirection(page);
}

async function main() {
  const { browser, page } = await initPuppeteer();
  const connected = await login(page);
  if (!connected) {
    return;
  }
  await cookiePopup(page);
  await navToSF(page);

  await page.goto(constant.test, { followRedirect: true });
}

main();
