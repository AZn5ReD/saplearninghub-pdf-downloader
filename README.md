# saplearninghub-pdf-downloader

Download eBook as PDF from SAP Learning Hub.

## Getting Started

## Prerequisite

- NodeJS
- Google Chrome

You should put the path of chrome.exe in the [config.json](config.json) file in the attribute : `CHROME_EXE`. These are the default paths depending on your os :

- Windows : `C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe`
- Linux : `/usr/bin/google-chrome`

## Installation

```bash
npm install
```

## Usage

There are 4 modes :

- CLI
- Config file
- Node child process
- GUI

They can be mixed. For example you can set the user/password in the config file and set the URL in the CLI. The values from the CLI will override the values from the file.

The download URL of the eBook URL is on the learning hub :

![SAP Learning Hub](images/readme_SAP_LearningHub.png)

### Config File

Change the file [config.json](config.json) according to your needs.
For windows, the `TARGET_DIR` must have double backslash for the path (for example : `C:\\Users\\myuser\\Downloads`)

```bash
npm run build
npm run start
```

### CLI

Here is an example of the possible arguments

```bash
npm run build
npm run start --  --chrome="/usr/bin/google-chrome" --debug="false" --url="https://exmaple.com" --login="SUSER" --password="SUSER_PASSWORD" --target="./target_dir"
```

### Node child process

Here is an example of how to use it as a library. The script will pipe the PDF stream out on the `third` file descriptor.

```js
const child = child_process.fork(
  "../saplearninghub-pdf-downloader/dist/index.js",
  [
    `--url=${downloadURL}`,
    `--login=${login}`,
    `--password=${passord}`,
    `--chrome=${chromeExePath}`,
    `--stream=true`,
  ],
  {
    stdio: ["pipe", "pipe", "pipe", "pipe", "ipc"],
  }
);

child.stdio[3].pipe(stream);
```

### GUI

For the GUI version, check the GUI repo : [saplearninghub-pdf-downloader-gui](https://github.com/AZn5ReD/saplearninghub-pdf-downloader-gui)

## Test

Copy the [config.json](config.json) file into the root of the project with the name `config_test.json`. This file will be use by the test command. It also is gitignored so that no credentials will be committed.

```bash
npm run dev
```

## Build With

- [puppeteer](https://github.com/puppeteer/puppeteer) - Headless Chrome Node.js API
- [pdfkit](https://github.com/foliojs/pdfkit) - A JavaScript PDF generation library for Node and the browser
- [babel](https://github.com/babel/babel) - Babel is a compiler for writing next generation JavaScript.
- [minimist](https://github.com/substack/minimist) - parse argument options
- [webpack](https://github.com/webpack/webpack) - A bundler for javascript and friends.
- [nodemon](https://github.com/remy/nodemon) - Monitor for any changes in your node.js application and automatically restart the server - perfect for development

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
If you like the project, you can buy me a [coffee](https://paypal.me/azn5red).

## License

[MIT](https://choosealicense.com/licenses/mit/)
