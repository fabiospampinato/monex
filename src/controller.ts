
/* IMPORT */

import {spawn, ChildProcess} from 'child_process';
import debounce from 'debounce';
import path from 'path';
import picomatch from 'picomatch';
import onExit from 'signal-exit';
import {color} from 'specialist';
import Watcher from 'watcher';
import {Options} from './types';

/* MAIN */

class Controller {

  /* VARIABLES */

  options: Options;
  process?: ChildProcess;
  watcher?: Watcher.type;

  /* CONSTRUCTOR */

  constructor ( options: Options ) {

    this.options = options;

    onExit ( this.stop );

  }

  /* API */

  restart = (): this => {

    this.process?.kill ();
    this.process = undefined;

    this.start ();

    return this;

  }

  start = (): this => {

    console.log ( color.yellow ( `[Monex] Starting...` ) );

    const proc = this.process = spawn ( this.options.exec, {
      stdio: ['pipe', 'inherit', 'inherit'],
      shell: true
    });

    const restart = debounce ( (): void => {
      if ( this.process !== proc ) return;
      this.restart ();
    }, 500 );

    proc.on ( 'close', restart );
    proc.on ( 'error', restart );
    proc.on ( 'exit', restart );

    process.stdin.on ( 'data', data => {
      if ( data.toString ().trim ().toLowerCase () !== 'rs' ) return;
      restart ();
    });

    this.watch ();

    return this;

  }

  stop = (): this => {

    this.process?.kill ();
    this.process = undefined;

    this.watcher?.close ();
    this.watcher = undefined;

    return this;

  }

  watch = (): this => {

    if ( this.watcher ) return this;

    if ( !this.options.watch ) return this;

    const targetPaths = this.options.watch.map ( targetPath => path.resolve ( process.cwd (), targetPath ) );

    const matchers = this.options.ignore?.map ( glob => picomatch ( glob ) ) || [];

    const ignore = ( targetPath: string ): boolean => matchers.some ( matcher => matcher ( targetPath ) );

    const restart = debounce ( this.restart, 500, false );

    const options = {
      native: true,
      recursive: true,
      ignoreInitial: true,
      ignore
    };

    this.watcher = new Watcher ( targetPaths, options, restart );

    return this;

  }

}

/* EXPORT */

export default Controller;
