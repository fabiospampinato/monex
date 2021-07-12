# Monex

Execute one or multiple scripts, interactively or in daemon mode, and restart them whenever they crash or a watched file changes.

## Features

This is basically a lightweight all-in-one alternative to [`nodemon`](https://github.com/remy/nodemon), [`concurrently`](https://github.com/kimmobrunfeldt/concurrently) and to some extent even [`pm2`](https://github.com/Unitech/pm2).

- **Much simpler**: Compared to those libraries Monex is much much simpler, both in terms of implementation and API surface, while for a lot of use cases being just as powerful as they are.
- **Much smaller**: Compared to those libraries Monex requires ~30MB fewer code to be installed for it to work, which from a security perspective is a nice feature if you need to install this on a sensitive machine, like your personal machine or a server.
- **Better watching**: This library uses [`watcher`](https://github.com/fabiospampinato/watcher) for watching the filesystem instead of [`chokidar`](https://github.com/paulmillr/chokidar), meaning it handles more filesystem issues that may potentially arise and it can natively watch paths recursively under Windows.

## Install

```sh
npm install --save-dev monex
```

## Usage

You can use Monex either from the command line or programmatically, in interactive mode or in daemon mode.

### Usage - Interactive

Interactive mode means that scripts don't run in the background and won't survive terminating the current process.

#### Command Line

You would usually run the `monex` command from a `package.json` script, but you can also call `npx monex` manually.

The command has the following interface:

```sh
monex --name foo --watch pathToWatch --ignore globToIgnore --exec 'script to execute'
```

- `-n`, `--name`:
  - It's optional.
  - It provides a name to use for debugging purposes.
  - You can provide multiple names if you are executing multiple scripts, one for each script, by writing multiple names after `--name` or by using the option multiple times.
- `-w`, `--watch`:
  - It's optional.
  - It supports either relative or absolute paths.
  - You can watch multiple paths by writing multiple paths after `--watch` or by using the option multiple times.
  - Remember to quote paths containing whitespaces or they will be interpreted as multiple paths, e.g. `'./path/to/my nice script.js'`.
- `-i`, `--ignore`:
  - It's optional.
  - Globs are matched against absolute paths pointing to watched files and folders.
  - Globs interally are parsed using [`picomatch`](https://github.com/micromatch/picomatch).
  - You can use multiple ignore globs by writing multiple globs after `--ignore` or by using the option multiple times.
  - Remember to quote globs otherwise they might get expanded by your shell, e.g. `'**/node_modules/**'`.
- `-x`, `--exec`:
  - It's required.
  - You pass it a full-blown shell script to execute, with no magic behind it, just write the full script you want to execute.
  - You can execute multiple scripts by writing multiple scripts after `--exec` or by using the option multiple times.
  - A shorthand notation for running NPM scripts is supported, e.g. `npm:foo` gets expanded automatically to `npm run foo`.
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
controller.stat (); // Retrieve an object containing some useful monitoring stats
```

### Usage - Daemon

Daemon mode means that scripts run in the background and will survive terminating the current process.

#### Command Line

You would usually run the `monex-daemon` command, or `monexd` for short, from a `package.json` script, but you can also call `npx monex-daemon` manually.

##### Configuration

First of all a JSON configuration file containing an array with the following interface is needed:

```ts
type Config = [ // Array of script options to execute
  { // Options for a script to execute
    color?: 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan',
    name?: string,
    watch?: string[],
    ignore?: string[],
    exec: string
  },
  { // Options for another script to execute
    // ...
  }
  // ...
]
```

- `color`:
  - It's an optional color assigned to the script, if not provided one will be selected automatically.
- `name`:
  - It's an optional name assigned to the script, if not provided one will be inferred automatically.
- `watch`:
  - It works just like the `watch` option in the interactive API.
- `ignore`:
  - It works just like the `ignore` option in the interactive API.
- `exec`:
  - It works just like the `exec` option in the interactive API.

##### Commands

Various sub-commands are provided by the `context-daemon` command for managing the daemon.

###### `start`

The start command starts a deamon with the provided configuration.

If an existing daemon is found that's terminated automatically before starting the new one.

```
monex-daemon start --config path/to/config.json
monex-daemon start
```

- `-c`, `--config`:
  - It's optional.
  - It's a path to the JSON file containing the configuration to load.
  - If it's not present Monex will try to find a file named `monex.json` automatically, walking up the filesystem starting from the current directory.

###### `stop`

The stop command terminates the daemon.

```
monex-daemon stop
```

###### `ping`

The ping command just tells you if the daemon is currently alive or not.

```
monex-daemon ping
```

###### `log`

The log command outputs the stdout and stderr buffers for each script.

```
monex-daemon log --lines 50
```

- `-n`, `--lines`:
  - It's optional.
  - It sets the maximum number of lines to output for each buffer, older lines won't be outputted.

###### `stat`

The stat command outputs a JSON array containing monitoring stats for all the scripts.

```
monex-daemon stat --pretty
```

- `-p`, `--pretty`:
  - It's optional.
  - It ouputs stats in a more human-friendly way not meant for post processing.

#### Programmatic API

You can also control the daemon programmatically, the API is essentially the same as the one exposed by the CLI.

```ts
import monex from 'monex/daemon';

// Provided APIs for manually controlling the daemon
monex.start (); // Starts the daemon
monex.stop (); // Stops the daemon
monex.ping (); // Returns either "true" or "false"
monex.log (); // Returns the output of the "log" command as a string
monex.stat (); // Returns the JSON object containing monitoring stats
```

## License

MIT © Fabio Spampinato
