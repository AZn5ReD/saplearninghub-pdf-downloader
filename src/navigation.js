import constant from "./constants.json";
import config from "./config";

async function redirection(page) {
  await page.waitForNavigation();
  console.info("Redirected to:", page.url());
}

export async function login(page) {
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

    console.info("Submiting...");
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
    console.info("Cookie accepted");
    await page.waitForNavigation();
  } catch (error) {
    console.error("Error during cookie consent:", error);
  }
}

async function navToSF(page) {
  console.info(`Navigating to ${constant.SUCCESS_FACTOR_LINK_TEXT}`);
  const links = await page.$x(
    `//a[contains(text(), ${constant.SUCCESS_FACTOR_LINK_TEXT})]`
  );
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

export async function getAuthorization(page) {
  await cookiePopup(page);
  await navToSF(page);
}
