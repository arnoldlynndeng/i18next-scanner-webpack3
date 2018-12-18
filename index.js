const scanner = require('i18next-scanner');
const vfs = require('vinyl-fs');
const path = require('path');

const isModule = filePath => !filePath.startsWith('/') && !filePath.startsWith('./');
const removeDuplicatedFromArray = arr => Array.from(new Set(arr).values());
class i18nextWebpackPlugin3 {
  constructor(config) {
    this.extensions = ['.js', '.jsx', '.vue'];
    this.i18nConfig = config;

    if (this.i18nConfig.options.func) {
      if (!this.i18nConfig.options.func.list) {
        this.i18nConfig.options.func.list = ['i18next.t', 'i18n.t'];
      }

      // Prevent "Unable to parse Trans component with the content" error
      if (!this.i18nConfig.options.trans) {
        this.i18nConfig.options.trans = {
          component: 'Trans',
          i18nKey: 'i18nKey',
          defaultsKey: 'defaults',
          extensions: ['.jsx'],
          fallbackKey: false
        };
      }

      if (this.i18nConfig.options.func.extensions) {
        this.extensions = this.i18nConfig.options.func.extensions;
      } else {
        this.i18nConfig.options.func.extensions = this.extensions;
      }

      // Remove leading dot
      this.extensions = this.extensions.map(ext => ext.replace(/^\./, ''));
    }

    if (!this.i18nConfig.options.resource) {
      this.i18nConfig.options.resource = {
        loadPath: '{{lng}}/{{ns}}.json',
        savePath: '{{lng}}/{{ns}}.json'
      };
    }
  }
  apply(compiler) {
    // entry
    const entry = compiler.options.entry;

    // check source directory
    if (!this.i18nConfig.src) {
      const entry = compiler.options.entry;

      if (typeof entry === 'string') {
        this.i18nConfig.src = [entry.substring(0, entry.lastIndexOf('/'))];
      } else if (typeof entry === 'object') {
        // filter relative paths

        let entries = [];
        Object.keys(entry).forEach(e => {
          const currentEntry = entry[e];
          let paths = [];

          if (Array.isArray(currentEntry)) {
            paths = currentEntry.filter(e => !isModule(e)).map(e => e.substring(0, e.lastIndexOf('/')));
          } else {
            if (!isModule(currentEntry)) {
              paths.push(currentEntry.substring(0, currentEntry.lastIndexOf('/')));
            }
          }

          entries = entries.concat(paths);
        });

        this.i18nConfig.src = removeDuplicatedFromArray(entries);
      }
    }
    // check dest directory
    if (!this.i18nConfig.dest) {
      this.i18nConfig.dest = path.join(__dirname.split('node_modules')[0], 'locales');
    }
    compiler.plugin('emit', (compilation, callback) => {
      if (!this.i18nConfig) {
        console.error('i18next-scanner:', 'i18n object is missing');
        return;
      }
      if (!this.i18nConfig.src) {
        console.error('i18next-scanner:', 'src path is missing');
        return;
      }
      if (!this.i18nConfig.dest) {
        console.error('i18next-scanner:', 'dest path is missing');
        return;
      }
      const commaSeperatedExtensions = this.extensions.map(ext => ext.replace(/^\./, '')).join(',');

      vfs
        .src(
          this.i18nConfig.src.map(e =>
            path.join(
              e,
              `**/*.${this.extensions.length === 1 ? commaSeperatedExtensions : `{${commaSeperatedExtensions}}`}`
            )
          )
        )
        .pipe(scanner(this.i18nConfig.options, this.i18nConfig.transform, this.i18nConfig.flush))
        .pipe(vfs.dest(this.i18nConfig.dest))
        .on('end', () => callback());
    })
  }
}

module.exports = i18nextWebpackPlugin3;
