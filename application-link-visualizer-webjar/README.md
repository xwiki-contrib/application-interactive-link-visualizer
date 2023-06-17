# Webjar for Link Visualizer Application

## Build for production

```bash
mvn clean install
```

## Build steps

- maven copy `src/main/resources` to `target/webjar`
- `npm ci` is run on `target/webjar` (installing the dependencies by following `package-lock.json` only, i.e., withotu trying to upgrade ranged versions)
- `npm run build` is run on `target/webjar`, producing the artifacts of `target/webjar/dist`
- the content of `target/webjar/dist` is copied to the relevant directory to be included in the webjar packaging

## Development

The content of `src/main/resources` should be considered as a npm project with TypeScript content by most modern IDE.

### Version upgrade

To upgrade the version of a dependecy, edit `src/main/resources/package.json`
Run `npm install` on `src/main/resources` to update `src/main/resources/package-lock.json`. Without  this step, the updated version is not taken into account during the maven build.

### Using the bundle inside XWiki

Create a  `XWiki.JavaScriptExtension` XObject, with the following content, and `Parse content=Yes`.

```javascript
require.config({
  paths: {
    'bundle': '$services.webjars.url('org.xwiki.contrib:webpack-demo', 'bundle.js')'
  }
});

require(['bundle'], function (bundle) {
  console.log('loaded');
  bundle.test();
});
```