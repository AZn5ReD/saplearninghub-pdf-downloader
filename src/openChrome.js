const puppeteer=require('puppeteer');
const fs=require('fs');
// import minimist from "minimist";
import { login } from "./navigation";
import { targetDirCheck } from "./file";
import config from "./config";

// const argv = minimist(process.argv.slice(2), { boolean: ["debug", "child"] });

const launchConfig={
    // args: ["--disable-features=site-per-process"],
    headless: false,
    executablePath: config.CHROME_EXE || '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome' 
};
puppeteer.launch(launchConfig).then(async browser=>{
   
    const wsEPAddress=browser.wsEndpoint();
    const w_data=new Buffer(wsEPAddress);
    fs.writeFile(config.BASE_PATH + '/wsa.txt', w_data, {flag: 'w+'}, function (err) {
        if(err) {
            console.error(err);
        } else {
            console.log('写入成功');
        }
    });
    const page = await browser.newPage();

    // if (!targetDirCheck() || !(await login(page))) {
    //     throw new Error("Login err");
    // }
}).catch((err) => {
    console.error(err)
});
