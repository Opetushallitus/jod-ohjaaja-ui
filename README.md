# JOD Ohjaaja UI

This repository is the UI for JOD Ohjaaja. JOD Ohjaaja is part of the Digital Service Ecosystem for Continuous Learning (JOD) project.

The UI app is built using React, Vite, and TypeScript. React is a popular JavaScript library for building user interfaces, while Vite is a build tool that provides fast and efficient development experience. TypeScript is a superset of JavaScript that adds static type checking and other features to the language.

Together, these technologies provide a robust and efficient development environment for building modern web applications with a focus on user experience. The app is designed to be responsive and accessible.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

1. First, ensure that you have [NVM](https://github.com/nvm-sh/nvm) installed on your machine.
2. Clone this repository to your local machine.
3. Open a terminal window and navigate to the root directory of the project.
4. Run the following command to install Node.js & NPM and the dependencies:

```shell
nvm install
nvm use
npm install
```

5. Take the steps in JOD Design System repository to get components of the design system work in hot reload mode.
6. Create a `.env.local` file and put the required environment variables there in order to get the connection to the CMS working. The required variable names are in `.env` file. See the following wiki page for further instructions: https://wiki.eduuni.fi/pages/viewpage.action?pageId=539867888
7. Once the installation is complete, run the following command to start the development server:

```shell
npm run dev
```

7. The app should now be running on http://localhost:8180/.

## Download third-party UI assets

Third-party assets such as images, fonts, and icons are stored in a S3 bucket. Guide to download assets is available in the infrastructure repository.

## Updating JOD Design System

Run the following command to update the JOD Design System to the latest version:

```shell
npm update @jod/design-system
```

## Accessibility testing

### Axe

Axe is used automatically when run in development mode.
When starting the development server you can see findings of Axe, if any, on the console for e.g when missing `<main>-tag`:

```
New axe issues
moderate: Document should have one main landmark https://dequeuniversity.com/rules/axe/4.8/landmark-one-main?application=axeAPI
moderate: All page content should be contained by landmarks https://dequeuniversity.com/rules/axe/4.8/region?application=axeAPI
```

### Axe DevTools

Useful browser extension to use

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/)
- [Chromium](https://chromewebstore.google.com/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/axe-devtools-web-access/kcenlimkmjjkdfcaleembgmldmnnlfkn)

### WAVE Browser Extensions

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/wave-accessibility-tool/)
- [Chromium](https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/wave-evaluation-tool/khapceneeednkiopkkbgkibbdoajpkoj)

### Google Lighthouse

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/google-lighthouse/)
- [Chromium](https://chromewebstore.google.com/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk)
