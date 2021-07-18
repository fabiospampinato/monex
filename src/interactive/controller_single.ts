
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
  private restarting: boolean;
  private restarts: number;
  private stdout: string;
  private stderr: string;
  private process?: ChildProcess;
  private watcher?: Watcher.type;

  /* CONSTRUCTOR */

  constructor ( options: OptionsSingle ) {

    this.options = options;
    this.name = options.name || '';
    this.restarting = false;
    this.restarts = -1;
    this.stdout = '';
    this.stderr = '';

    onExit ( this.stop );

  }

  /* HELPERS */

  private _processKill = async (): Promise<void> => {

    const {process} = this;

    if ( !process ) return;

    this.process = undefined;

    await PID.tree.kill ( process.pid, process['pids'] || [process.pid] );

  }

  private _watcherKill = async (): Promise<void> => {

    const {watcher} = this;

    if ( !watcher ) return;

    this.watcher = undefined;

    watcher.close ();

  }

  /* API */

  restart = async (): Promise<void> => {

    if ( this.restarting ) return;

    this.restarting = true;

    await this._processKill ();

    await this.start ();

    this.restarting = false;

  }

  start = async (): Promise<void> => {

    if ( this.process ) return;

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
      stdinDisposer ();
      clearInterval ( pidsInterval );
      PID.tree.kill ( proc.pid, proc['pids'] || [proc.pid] );
    };

    const restart = debounce ( (): void => {
      if ( this.process !== proc ) return kill ();
      this.restart ();
    }, 500 );

    const stdinDisposer = Stdin.onRestart ( restart );

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
      this.stdout = this.stdout.slice ( -128_000 );
      log ( data );
    };

    const onStderr = ( data: Buffer | string ) => {
      this.stderr += data.toString ();
      this.stderr = this.stderr.slice ( -128_000 );
      log ( data );
    };

    proc.stdout.on ( 'data', onStdout );
    proc.stderr.on ( 'data', onStderr );

    this.watch ();

  }

  stat = async (): Promise<Stat> => {

    const pid = this.process?.pid;
    const usage = await PID.tree.usage ( pid, [pid] );

    return {
      pid: pid || -1,
      name: this.options.name || '',
      online: !!pid,
      restarts: this.restarts,
      birthtime: usage?.birthtime || 0,
      uptime: usage?.uptime || 0,
      cpu: ( usage?.cpu || 0 ) / 100,
      memory: usage?.memory || 0,
      stdout: this.stdout,
      stderr: this.stderr
    };

  }

  stop = async (): Promise<void> => {

    await this._processKill ();
    await this._watcherKill ();

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
