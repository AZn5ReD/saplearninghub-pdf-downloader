const puppeteer = require('puppeteer')
const fs = require('fs')
const minimist = require('minimist')
const argv = minimist(process.argv.slice(2), { boolean: ['debug', 'child'] })
// import { login } from "./navigation";
// import { targetDirCheck } from "./file";
// import config from "./config";
// import constant from "./constants.json";

const SUCCESS_FACTOR_URL = 'https://performancemanager.successfactors.eu/sf/learning?company=learninghub'

const launchConfig = {
  args: ["--disable-features=site-per-process"],
  ignoreDefaultArgs: ['--disable-extensions'],
  headless: false,
  executablePath: argv.chrome // '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'
}
puppeteer.launch(launchConfig).then(async browser => {
  const wsEPAddress = browser.wsEndpoint()
  const w_data = new Buffer(wsEPAddress)
  fs.writeFile('./wsa.txt', w_data, { flag: 'w+' }, function (err) {
    if (err) {
      console.error(err)
    } else {
      console.log('写入成功')
    }
  })
  const page = await browser.newPage()
  await page.goto(SUCCESS_FACTOR_URL, { followRedirect: true })
  // if (!targetDirCheck() || !(await login(page))) {
  //     throw new Error("Login err");
  // }
}).catch((err) => {
  console.error(err)
})
