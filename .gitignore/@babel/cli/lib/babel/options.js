"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseArgv;
function _fs() {
  const data = require("fs");
  _fs = function () {
    return data;
  };
  return data;
}
function commander() {
  const data = _interopRequireWildcard(require("commander"), true);
  commander = function () {
    return data;
  };
  return data;
}
function _core() {
  const data = require("@babel/core");
  _core = function () {
    return data;
  };
  return data;
}
function glob() {
  const data = _interopRequireWildcard(require("glob"), true);
  glob = function () {
    return data;
  };
  return data;
}
var _util = require("./util.js");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const program = commander().default.program;
program.option("-f, --filename [filename]", "The filename to use when reading from stdin. This will be used in source-maps, errors etc.");
program.option("--presets [list]", "A comma-separated list of preset names.", collect);
program.option("--plugins [list]", "A comma-separated list of plugin names.", collect);
program.option("--config-file [path]", "Path to a .babelrc file to use.");
program.option("--env-name [name]", "The name of the 'env' to use when loading configs and plugins. " + "Defaults to the value of BABEL_ENV, or else NODE_ENV, or else 'development'.");
program.option("--root-mode [mode]", "The project-root resolution mode. " + "One of 'root' (the default), 'upward', or 'upward-optional'.");
program.option("--source-type [script|module]", "");
program.option("--no-babelrc", "Whether or not to look up .babelrc and .babelignore files.");
program.option("--ignore [list]", "List of glob paths to **not** compile.", collect);
program.option("--only [list]", "List of glob paths to **only** compile.", collect);
program.option("--no-highlight-code", "Enable or disable ANSI syntax highlighting of code frames. (on by default)");
program.option("--no-comments", "Write comments to generated output. (true by default)");
program.option("--retain-lines", "Retain line numbers. This will result in really ugly code.");
program.option("--compact [true|false|auto]", "Do not include superfluous whitespace characters and line terminators.", booleanify);
program.option("--minified", "Save as many bytes when printing. (false by default)");
program.option("--auxiliary-comment-before [string]", "Print a comment before any injected non-user code.");
program.option("--auxiliary-comment-after [string]", "Print a comment after any injected non-user code.");
program.option("-s, --source-maps [true|false|inline|both]", "", booleanify, undefined);
program.option("--source-map-target [string]", "Set `file` on returned source map.");
program.option("--source-file-name [string]", "Set `sources[0]` on returned source map.");
program.option("--source-root [filename]", "The root from which all sources are relative.");
{
  program.option("--module-root [filename]", "Optional prefix for the AMD module formatter that will be prepended to the filename on module definitions.");
  program.option("-M, --module-ids", "Insert an explicit id for modules.");
  program.option("--module-id [string]", "Specify a custom name for module ids.");
}
program.option("-x, --extensions [extensions]", "List of extensions to compile when a directory has been the input. [" + _core().DEFAULT_EXTENSIONS.join() + "]", collect);
program.option("--keep-file-extension", "Preserve the file extensions of the input files.");
program.option("-w, --watch", "Recompile files on changes.");
program.option("--skip-initial-build", "Do not compile files before watching.");
program.option("-o, --out-file [out]", "Compile all input files into a single file.");
program.option("-d, --out-dir [out]", "Compile an input directory of modules into an output directory.");
program.option("--relative", "Compile into an output directory relative to input directory or file. Requires --out-dir [out]");
program.option("-D, --copy-files", "When compiling a directory copy over non-compilable files.");
program.option("--include-dotfiles", "Include dotfiles when compiling and copying non-compilable files.");
program.option("--no-copy-ignored", "Exclude ignored files when copying non-compilable files.");
program.option("--verbose", "Log everything. This option conflicts with --quiet");
program.option("--quiet", "Don't log anything. This option conflicts with --verbose");
program.option("--delete-dir-on-start", "Delete the out directory before compilation.");
program.option("--out-file-extension [string]", "Use a specific extension for the output files");
program.version("7.25.6" + " (@babel/core " + _core().version + ")");
program.usage("[options] <files ...>");
program.action(() => {});
function parseArgv(args) {
  program.parse(args);
  const opts = program.opts();
  const errors = [];
  let filenames = program.args.reduce(function (globbed, input) {
    let files = glob().sync(input);
    if (!files.length) files = [input];
    globbed.push(...files);
    return globbed;
  }, []);
  filenames = Array.from(new Set(filenames));
  filenames.forEach(function (filename) {
    if (!_fs().existsSync(filename)) {
      errors.push(filename + " does not exist");
    }
  });
  if (opts.outDir && !filenames.length) {
    errors.push("--out-dir requires filenames");
  }
  if (opts.outFile && opts.outDir) {
    errors.push("--out-file and --out-dir cannot be used together");
  }
  if (opts.relative && !opts.outDir) {
    errors.push("--relative requires --out-dir usage");
  }
  if (opts.watch) {
    if (!opts.outFile && !opts.outDir) {
      errors.push("--watch requires --out-file or --out-dir");
    }
    if (!filenames.length) {
      errors.push("--watch requires filenames");
    }
  }
  if (opts.skipInitialBuild && !opts.watch) {
    errors.push("--skip-initial-build requires --watch");
  }
  if (opts.deleteDirOnStart && !opts.outDir) {
    errors.push("--delete-dir-on-start requires --out-dir");
  }
  if (opts.verbose && opts.quiet) {
    errors.push("--verbose and --quiet cannot be used together");
  }
  if (!opts.outDir && filenames.length === 0 && typeof opts.filename !== "string" && opts.babelrc !== false) {
    errors.push("stdin compilation requires either -f/--filename [filename] or --no-babelrc");
  }
  if (opts.keepFileExtension && opts.outFileExtension) {
    errors.push("--out-file-extension cannot be used with --keep-file-extension");
  }
  if (errors.length) {
    console.error("babel:");
    errors.forEach(function (e) {
      console.error("  " + e);
    });
    return null;
  }
  const babelOptions = {
    presets: opts.presets,
    plugins: opts.plugins,
    rootMode: opts.rootMode,
    configFile: opts.configFile,
    envName: opts.envName,
    sourceType: opts.sourceType,
    ignore: opts.ignore,
    only: opts.only,
    retainLines: opts.retainLines,
    compact: opts.compact,
    minified: opts.minified,
    auxiliaryCommentBefore: opts.auxiliaryCommentBefore,
    auxiliaryCommentAfter: opts.auxiliaryCommentAfter,
    sourceMaps: opts.sourceMaps,
    sourceFileName: opts.sourceFileName,
    sourceRoot: opts.sourceRoot,
    babelrc: opts.babelrc === true ? undefined : opts.babelrc,
    highlightCode: opts.highlightCode === true ? undefined : opts.highlightCode,
    comments: opts.comments === true ? undefined : opts.comments
  };
  {
    Object.assign(babelOptions, {
      moduleRoot: opts.moduleRoot,
      moduleIds: opts.moduleIds,
      moduleId: opts.moduleId
    });
  }
  for (const key of Object.keys(babelOptions)) {
    if (babelOptions[key] === undefined) {
      delete babelOptions[key];
    }
  }
  return {
    babelOptions,
    cliOptions: {
      filename: opts.filename,
      filenames,
      extensions: opts.extensions,
      keepFileExtension: opts.keepFileExtension,
      outFileExtension: opts.outFileExtension,
      watch: opts.watch,
      skipInitialBuild: opts.skipInitialBuild,
      outFile: opts.outFile,
      outDir: opts.outDir,
      relative: opts.relative,
      copyFiles: opts.copyFiles,
      copyIgnored: opts.copyFiles && opts.copyIgnored,
      includeDotfiles: opts.includeDotfiles,
      verbose: opts.verbose,
      quiet: opts.quiet,
      deleteDirOnStart: opts.deleteDirOnStart,
      sourceMapTarget: opts.sourceMapTarget
    }
  };
}
function booleanify(val) {
  if (val === "true" || val === "1") {
    return true;
  }
  if (val === "false" || val === "0" || val === "") {
    return false;
  }
  return val;
}
function collect(value, previousValue) {
  if (typeof value !== "string") return previousValue;
  const values = value.split(",");
  if (previousValue) {
    previousValue.push(...values);
    return previousValue;
  }
  return values;
}

//# sourceMappingURL=options.js.map