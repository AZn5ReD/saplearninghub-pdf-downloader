const puppeteer=require('puppeteer');
const fs=require('fs');
const launchConfig={
    // args: ["--disable-features=site-per-process"],
    headless: false,
    executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome' 
};
puppeteer.launch(launchConfig).then(browser=>{
    const wsEPAddress=browser.wsEndpoint();
    const w_data=new Buffer(wsEPAddress);
    fs.writeFile(__dirname + '/wsa.txt', w_data, {flag: 'w+'}, function (err) {
        if(err) {
            console.error(err);
        } else {
            console.log('写入成功');
        }
    });
});