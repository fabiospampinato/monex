
/* IMPORT */

import {spawn, ChildProcess} from 'child_process';
import path from 'path';
import picomatch from 'picomatch';
import onExit from 'signal-exit';
import {color} from 'specialist';
import Watcher from 'watcher';
import {Options} from './types';
import PID from './pid';

/* MAIN */

class Controller {

  /* VARIABLES */

  options: Options;
  name: string;
  process?: ChildProcess;
  watcher?: Watcher.type;

  /* CONSTRUCTOR */

  constructor ( options: Options ) {

    this.options = options;
    this.name = options.name || '';

    onExit ( this.stop );

  }

  /* HELPERS */

  private _processKill = (): void => {

    const {process} = this;

    if ( !process ) return;

    this.process = undefined;

    PID.tree.kill ( process.pid, process['pids'] || [process.pid] );

  }

  private _watcherKill = (): void => {

    const {watcher} = this;

    if ( !watcher ) return;

    this.watcher = undefined;

    watcher.close ();

  }

  /* API */

  restart = (): this => {

    this._processKill ();

    this.start ();

    return this;

  }

  start = (): this => {

    if ( this.process ) return this;

    console.log ( `[monex] ${this.name ? `${color.bold ( this.name )} - ` : ''}Starting...` );

    const proc = this.process = spawn ( this.options.exec, {
      stdio: ['pipe', 'inherit', 'inherit'],
      shell: true
    });

    const updatePids = async (): Promise<void> => {
      if ( this.process !== proc ) return;
      const pids = await PID.tree.get ( proc.pid );
      proc['pids'] = pids || proc['pids'];
    };

    const kill = (): void => {
      clearInterval ( pidsInterval );
      PID.tree.kill ( proc.pid, proc['pids'] || [proc.pid] );
    };

    const restart = (): void => {
      if ( this.process !== proc ) return kill ();
      this.restart ();
    };

    const pidsInterval = setInterval ( updatePids, 1000 );

    updatePids ();

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
