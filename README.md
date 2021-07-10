# Monex

Execute one or multiple scripts and restart them whenever they crash or a watched file changes.

## Features

This is basically a lightweight alternative to [nodemon](https://github.com/remy/nodemon) and [concurrently](https://github.com/kimmobrunfeldt/concurrently).

- **Much simpler**: Compared to `nodemon` this library is much simpler, both in terms of APIs and implementation, while remaining for pretty much all use cases just as powerful. It can also execute multiple scripts just like `concurrently`.
- **Much smaller**: Compared to `nodemon` this library has ~7x fewer dependencies (~100 fewer), and ~half of them, including the filesystem watcher, I maintain myself, and the other half are really good small dependencies I personally trust.
- **Better watching**: Compared to `nodemon` this library uses [`watcher`](https://github.com/fabiospampinato/watcher) for watching the filesystem instead of [`chokidar`](https://github.com/paulmillr/chokidar), which among other things means this library doesn't rely on any native node modules _and_ can watch recursively under Windows natively.

## Install

```sh
npm install --save-dev monex
```

## Usage

You can use Monex either from the the command line or programmatically.

#### Command Line

You would usually run the `monex` command from a `package.json` script, but you can also call `npx monex` manually.

The provided interface is the following:

```sh
monex --name foo --watch pathToWatch --ignore globToIgnore --exec 'script to execute'
```

- `--name`:
  - It's optional.
  - It provides a name to use for debugging purposes.
  - You can provide multiple names if you are executing multiple scripts, one for each script, by writing multiple names after `--name` or by using the option multiple times.
- `--watch`:
  - It's optional.
  - It supports either relative or absolute paths.
  - You can watch multiple paths by writing multiple paths after `--watch` or by using the option multiple times.
  - Remember to quote paths containing whitespaces or they will be interpreted as multiple paths, e.g. `'./path/to/my nice script.js'`.
- `--ignore`:
  - It's optional.
  - Globs are matched against absolute paths pointing to watched files and folders.
  - Globs interally are parsed using [`picomatch`](https://github.com/micromatch/picomatch).
  - You can use multiple ignore globs by writing multiple globs after `--ignore` or by using the option multiple times.
  - Remember to quote globs otherwise they might get expanded by your shell, e.g. `'**/node_modules/**'`.
- `--exec`:
  - It's required.
  - You pass it a full-blown shell script to execute, with no magic whatsoever behind it, just write the full script you want to execute.
  - You can execute multiple scripts by writing multiple scripts after `--exec` or by using the option multiple times.
  - Remember to write the full script, e.g. `node path/to/script.js`.
  - Remember to quote the full script if it contains any whitespaces, e.g. `--exec 'node path/to/script.js'`.

If you want to restart the script(s) manually just send `rs` in the terminal.

That's it, super simple, there's very little to remember.

#### Programmatic API

You can also instantiate Monex programmatically, the API is essentially the same as the one exposed by the CLI.

```ts
import monex from 'monex';

const controller = monex ({
  name: ['foo'],
  watch: ['dist'],
  ignore: ['**/.git/**'],
  script: ['node path/to/script.js']
});

// Provided APIs for manually controlling the script
controller.start (); // Start the script (started by default)
controller.stop (); // Stop the script
controller.restart (); // Restart the script
```

Additional APIs for enabling better monitoring and finer control could be exposed, feel free to open an issue about this if you need more APIs.

## License

MIT © Fabio Spampinato
