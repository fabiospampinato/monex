
/* IMPORT */

import {spawn, ChildProcess} from 'child_process';
import debounce from 'debounce';
import path from 'path';
import picomatch from 'picomatch';
import onExit from 'signal-exit';
import {color} from 'specialist';
import Watcher from 'watcher';
import {OptionsSingle} from './types';
import PID from './pid';
import Stdin from './stdin';

/* MAIN */

class ControllerSingle {

  /* VARIABLES */

  options: OptionsSingle;
  name: string;
  process?: ChildProcess;
  watcher?: Watcher.type;

  /* CONSTRUCTOR */

  constructor ( options: OptionsSingle ) {

    this.options = options;
    this.name = options.name || '';

    onExit ( this.stop );

    Stdin.onRestart ( this.restart );

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

    const restart = debounce ( (): void => {
      if ( this.process !== proc ) return kill ();
      this.restart ();
    }, 500 );

    const pidsInterval = setInterval ( updatePids, 1000 );

    updatePids ();

    proc.on ( 'close', restart );
    proc.on ( 'error', restart );
    proc.on ( 'exit', restart );

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

    const restart = debounce ( this.restart, 500 );

    const options = {
      native: true,
      recursive: true,
      ignoreInitial: true,
      debounce: 1000,
      ignore
    };

    this.watcher = new Watcher ( targetPaths, options, restart );

    return this;

  }

}

/* EXPORT */

export default ControllerSingle;
