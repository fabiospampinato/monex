
/* IMPORT */

import {spawn, ChildProcess} from 'child_process';
import debounce from 'debounce';
import path from 'path';
import picomatch from 'picomatch';
import onExit from 'signal-exit';
import {color} from 'specialist';
import Watcher from 'watcher';
import {OptionsSingle, Stat} from '../types';
import Logger from './logger';
import PID from './pid';
import Stdin from './stdin';

/* MAIN */

class ControllerSingle {

  /* VARIABLES */

  private options: OptionsSingle;
  private name: string;
  private restarts: number;
  private stdout: string;
  private stderr: string;
  private process?: ChildProcess;
  private watcher?: Watcher.type;

  /* CONSTRUCTOR */

  constructor ( options: OptionsSingle ) {

    this.options = options;
    this.name = options.name || '';
    this.restarts = -1;
    this.stdout = '';
    this.stderr = '';

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

    this.restarts += 1;

    console.log ( `[monex] ${this.name ? `${color.bold ( this.name )} - ` : ''}Starting...` );

    const exec = this.options.exec.replace ( /^npm:/, 'npm run ' );

    const proc = this.process = spawn ( exec, {
      stdio: ['ignore', null, null],
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

    const log = ( data: Buffer | string ) => {
      if ( this.options.prefix ) {
        Logger.log ( data, this.options.name, this.options.color );
      } else {
        Logger.log ( data );
      }
    };

    const onStdout = ( data: Buffer | string ) => {
      this.stdout += data.toString ();
      this.stdout = this.stdout.slice ( -100_000 );
      log ( data );
    };

    const onStderr = ( data: Buffer | string ) => {
      this.stderr += data.toString ();
      this.stderr = this.stderr.slice ( -100_000 );
      log ( data );
    };

    proc.stdout.on ( 'data', onStdout );
    proc.stderr.on ( 'data', onStderr );

    this.watch ();

    return this;

  }

  stat = async (): Promise<Stat> => {

    try {

      if ( !this.process?.pid ) throw new Error ();

      const {pid} = this.process;
      const usage = await PID.tree.usage ( pid, [pid] );

      return {
        pid,
        name: this.options.name || '',
        online: true,
        restarts: this.restarts,
        timestamp: usage?.timestamp || -1,
        cpu: ( usage?.cpu || 0 ) / 100,
        memory: usage?.memory || 0,
        stdout: this.stdout,
        stderr: this.stderr
      };

    } catch {

      return {
        pid: -1,
        name: this.options.name || '',
        online: false,
        restarts: this.restarts,
        timestamp: -1,
        cpu: 0,
        memory: 0,
        stdout: this.stdout,
        stderr: this.stderr
      };

    }

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
