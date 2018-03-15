# Stubber

Chrome extension for stubbing endpoints in-browser.

## Getting Started

### Installation

```sh
$ git clone https://github.nwie.nete/Nationwide/Stubber.git
$ cd Stubber
$ npm install
```

## Development

There are two ways in which you can build and run the web app:

* Build for ***Production*** (Minifies, mangles, builds crx):
  * `$ npm run build`
  * Drop .crx file into Chrome

* Build for ***Development*** (Source maps, keeps expanded):
  * `$ npm start`
  * `chrome://extensions/` > Load unpacked extension > `Stubber/build` (or use reload link if already loaded)

## Testing

**(TBD)**

Ain't got no tests yet, but:

```sh
$ npm run test
```

To run unit tests continuously during development (watch tests), use:

```sh
$ npm run test:watch
```

## FAQ

### What's this for?

Simplify development and testing by using in-browser stubs to get the data exactly as you need it for your current scenario. Does not require modifying your project to point to a stub server or setting up a local server solely for the purpose of serving stubs. No hassle about only hitting a stubbing server for a particular URL you may need vs. pointing your entire project toward a stubbed local server.

## TODO

- [ ] Watch `src/assets/extensions` for changes
- [ ] Maybe write some tests
- [ ] Any more ideas?
