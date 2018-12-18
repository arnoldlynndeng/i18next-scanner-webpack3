## i18next-scanner-webpack-plugin

This is a simple i18n-scanner webpack-plugin.
Based on this package: [i18next-scanner](https://github.com/i18next/i18next-scanner).

**Example webpack.config.js**

```javascript
const path = require('path');
const i18nextWebpackPlugin = require('i18next-scanner-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    new i18nextWebpackPlugin({
      // See options at https://github.com/i18next/i18next-scanner#options
      // src defaults to ./src
      // dist defaults to ./locales
      options: {
        func: {
          // default ['i18next.t', 'i18n.t']
          list: ['t', '$t', 'i18next.t', 'i18n.t'],
          // default ['js', 'jsx', 'vue']
          extensions: ['js', 'jsx']
        },
        lngs: ['en', 'de'],
        // both defaults to {{lng}}/{{ns}}.json
        resource: {
          loadPath: '{{lng}}/{{ns}}.json',
          savePath: '{{lng}}/{{ns}}.json'
        }
      }
    })
  ]
};
```
