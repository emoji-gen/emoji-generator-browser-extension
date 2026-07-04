## Browser Extension for Emoji Generator

[![test](https://github.com/emoji-gen/browser-extension/actions/workflows/test.yml/badge.svg)](https://github.com/emoji-gen/browser-extension/actions/workflows/test.yml)
[![License](https://img.shields.io/static/v1?label=License&message=MIT&color=green)](https://opensource.org/licenses/MIT)

:tada: Ultimate Browser Extension

<br><img src="pr/ss1.png" width="320" height="200" alt="">&nbsp;<img src="pr/ss2.png" width="320" height="200" alt="">

## Requirements

- Node `$(cat .node-version)`

## Tech Stack

- [TypeScript](https://www.typescriptlang.org/)
- [Rsbuild](https://rsbuild.dev/), [Rspack](https://rspack.dev/)
- [Rstest](https://rstest.rs/), [happy-dom](https://github.com/capricorn86/happy-dom)
- [Prettier](https://prettier.io/)

## Getting Started

```bash
$ npm install
$ npm start     # for development
$ npm run build # for production
```

Next, please load `dist/pkg` directory as browser extension on Chrome or Firefox.

## Supported Browsers

- [Google Chrome](https://chrome.google.com/webstore/detail/emoji-generator/ghbhakkknnmocmiilhneahbkiaegdnmf) (Manifest V3)
- [Firefox](https://addons.mozilla.org/ja/firefox/addon/emoji-generator/) (Manifest V3)

## License

MIT &copy; [Emoji Generator](https://emoji-gen.ninja/)
