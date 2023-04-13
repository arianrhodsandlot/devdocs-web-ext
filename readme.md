<p align="center">
  <img src="./docs/images/brandings/logo.png" alt="logo">
</p>

<h1 align="center">DevDocs Web Ext</h1>

<p align="center">
  <a href="https://chrome.google.com/webstore/detail/devdocs-web-ext/kdjoccdpjblcefijcfhnjoljodddedpj">
    <img src="https://img.shields.io/chrome-web-store/v/kdjoccdpjblcefijcfhnjoljodddedpj.svg" alt="Chrome Web Store">
  </a>
  <a href="https://microsoftedge.microsoft.com/addons/detail/devdocs-web-ext/dglcbgdedngbiaaohopncfonhdngodmo">
    <img src="https://img.shields.io/badge/dynamic/json?label=edge%20add-on&prefix=v&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fdglcbgdedngbiaaohopncfonhdngodmo" alt="Microsoft Edge Add-ons">
  </a>
  <br>
  <a href="https://chrome.google.com/webstore/detail/devdocs-web-ext/kdjoccdpjblcefijcfhnjoljodddedpj">
    <img src="https://img.shields.io/chrome-web-store/users/kdjoccdpjblcefijcfhnjoljodddedpj.svg" alt="users">
  </a>
  <a href="https://chrome.google.com/webstore/detail/devdocs-web-ext/kdjoccdpjblcefijcfhnjoljodddedpj">
    <img src="https://img.shields.io/chrome-web-store/stars/kdjoccdpjblcefijcfhnjoljodddedpj.svg" alt="rating">
  </a>
</p>

## Overview
DevDocs Web Ext is a browser extension that allows you to quickly search and browse online documentations from [DevDocs](https://devdocs.io).

![popup search scope](./docs/images/screenshots/popup-doc.png)

## Features
+ Quick access to documentation for over 200 development libraries provided by [DevDocs](https://devdocs.io).
+ Search in a certain library or a certain version of the library.
+ Dark theme is supported.

## Install
### Google Chrome / Chromium based browsers (Vivaldi, Brave, etc.)
Visit [Chrome Web Store](https://chrome.google.com/webstore/detail/quick-devdocs/kdjoccdpjblcefijcfhnjoljodddedpj) to install it.

[![Chrome Web Store](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/UV4C4ybeBTsZt43U4xis.png)](https://chrome.google.com/webstore/detail/quick-devdocs/kdjoccdpjblcefijcfhnjoljodddedpj)

### Microsoft Edge
Visit [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/devdocs-web-ext/dglcbgdedngbiaaohopncfonhdngodmo) to install it.

[![Microsoft Edge Add-ons](https://user-images.githubusercontent.com/72879799/229780441-610f727a-edb4-41e0-a1fb-6593af3d4485.svg)](https://microsoftedge.microsoft.com/addons/detail/devdocs-web-ext/dglcbgdedngbiaaohopncfonhdngodmo)

## Usage
To use DevDocs Web Ext, simply click on the extension icon in your browser's toolbar to open the popup window. From there, you can search for the library you need and browse through its documentation. There is also a default shortcut for opening the popup window: <kbd>ALT<kbd> + <kbd>S<kbd>.

You can also click open the options page to customize the extension's behavior, including changing your appearance and theme.

## Screenshots
Screenshots are captured using Google Chrome.
| Description | Screenshot |
|---|---|
| Open the extension | <img src="./docs/images/screenshots/popup.png" width="320" height="200"> |
| Dark mode | <img src="./docs/images/screenshots/popup-dark.png" width="320" height="200"> |
| Search | <img src="./docs/images/screenshots/popup-search.png" width="320" height="200"> |
| Press <kbd>Tab</kbd> to select a certain documentation, <br> then search in this documentation | <img src="./docs/images/screenshots/popup-search-scope.png" width="320" height="200"> |
| Select a new documentation in [devdocs.io](https://devdocs.io) | <img src="./docs/images/screenshots/popup-new-scope.png" width="320" height="200"> |
| Read an article from the documentation | <img src="./docs/images/screenshots/popup-doc.png" width="320" height="200"> |
| Read an article in dark mode | <img src="./docs/images/screenshots/popup-doc-dark.png" width="320" height="200"> |

## Contributing
DevDocs Web Ext is an open-source project, and contributions are always welcome! If you have an idea for a new feature, find a bug, or just want to help out, feel free to submit a pull request or open an issue on our GitHub page.

## Development

Here is a simple overview about how to set up development environment.
```sh
# initialize the development environment
git clone https://github.com/arianrhodsandlot/devdocs-web-ext.git
cd devdocs-web-ext
pnpm i

# start a fresh browser using Playwright with the develop version extension installed
pnpm dev

# run test cases locally
pnpm t

# debug test cases
# see https://playwright.dev/docs/debug#run-in-debug-mode-1 for more information about Playwright
pnpm playwright test -c tests --debug
# or debug using Playwright's Browser Developer Tools
# see https://playwright.dev/docs/debug#browser-developer-tools
PWDEBUG=console p playwright test -c tests
```

## Credits
DevDocs Web Ext is built on top of [DevDocs](https://devdocs.io), an amazing website for developers. Thanks to [all the contributors](https://github.com/freeCodeCamp/devdocs/graphs/contributors) who make [DevDocs](https://devdocs.io) possible!

## License

[MIT](license)
