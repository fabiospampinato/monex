
/* IMPORT */

import {spawn, ChildProcess} from 'child_process';
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

  /* HELPERS */

  private _processKill () {

    const {process} = this;

    this.process = undefined;

    process?.kill ( 'SIGTERM' );

    setTimeout ( () => {

      process?.kill ( 'SIGKILL' );
      process?.kill ( 'SIGKILL' );

    }, 3000 );

  }

  private _watcherKill () {

    const {watcher} = this;

    this.watcher = undefined;

    watcher?.close ();

  }

  /* API */

  restart = (): this => {

    this._processKill ();

    this.start ();

    return this;

  }

  start = (): this => {

    if ( this.process ) return this;

    console.log ( color.yellow ( `[Monex] Starting...` ) );

    const proc = this.process = spawn ( this.options.exec, {
      stdio: ['pipe', 'inherit', 'inherit'],
      shell: true
    });

    const restart = (): void => {
      if ( this.process !== proc ) return void proc.kill ( 'SIGKILL' );
      this.restart ();
    };

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

    this._watcherKill ();
    this._processKill ();

    return this;

  }

  watch = (): this => {

    if ( this.watcher ) return this;

    if ( !this.options.watch ) return this;

    const targetPaths = this.options.watch.map ( targetPath => path.resolve ( process.cwd (), targetPath ) );

    const matchers = this.options.ignore?.map ( glob => picomatch ( glob ) ) || [];

    const ignore = ( targetPath: string ): boolean => matchers.some ( matcher => matcher ( targetPath ) );

    const options = {
      native: true,
      recursive: true,
      ignoreInitial: true,
      debounce: 1000,
      ignore
    };

    this.watcher = new Watcher ( targetPaths, options, this.restart );

    return this;

  }

}

/* EXPORT */

export default Controller;
