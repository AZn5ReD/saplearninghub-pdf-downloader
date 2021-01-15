import constant from "./constants.json";
import config from "./config";
import processSend from "./process";

async function redirection(page) {
  console.info("Redirected to:", page.url());
  await page.waitForNavigation({
    waitUntil: "networkidle0",
  });
}

export async function login(page) {
  try {
    console.info("Going to:", constant.SUCCESS_FACTOR_URL);
    processSend({ log: "Connecting..." });
    await page.goto(constant.SUCCESS_FACTOR_URL, { followRedirect: true });
    await page.waitForSelector(constant.LOGIN_SELECTOR, {
      visible: true,
    });

    console.info("Entering login:", config.LOGIN);
    await page.type(constant.LOGIN_SELECTOR, config.LOGIN);
    await page.click(constant.SUBMIT_SELECTOR);

    console.info("Entering password: ***");
    const password_input = await Promise.race([
      page.waitForSelector(constant.PASSWORD_SELECTOR, {
        visible: true,
      }),
      page.waitForSelector(constant.UNIVERSAL_ID_PASSWORD_SELECTOR, {
        visible: true,
      }),
    ]);
    await password_input.type(config.PASSWORD);

    console.info("Submiting...");
    const submit_button = await Promise.race([
      page.waitForSelector(constant.SUBMIT_SELECTOR, {
        visible: true,
      }),
      page.waitForSelector(constant.UNIVERSAL_ID_SUBMIT_SELECTOR, {
        visible: true,
      }),
    ]);
    await submit_button.click();
    await redirection(page);

    if (page.url().startsWith(constant.URL_CONNECTED)) {
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
