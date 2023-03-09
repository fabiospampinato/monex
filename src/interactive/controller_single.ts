
/* IMPORT */

import {debounce} from 'dettle';
import {spawn} from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import {color} from 'specialist';
import Watcher from 'watcher';
import whenExit from 'when-exit';
import zeptomatch from 'zeptomatch';
import Logger from '~/interactive/logger';
import PID from '~/interactive/pid';
import Stdin from '~/interactive/stdin';
import type {Buffer} from 'node:buffer';
import type {OptionsSingle, Process, Stat} from '~/types';

/* MAIN */

class ControllerSingle {

  /* VARIABLES */

  private options: OptionsSingle;
  private name: string;
  private restarting: boolean;
  private restarts: number;
  private stdout: string;
  private stderr: string;
  private process?: Process;
  private watcher?: Watcher;

  /* CONSTRUCTOR */

  constructor ( options: OptionsSingle ) {

    this.options = options;
    this.name = options.name || '';
    this.restarting = false;
    this.restarts = -1;
    this.stdout = '';
    this.stderr = '';

    whenExit ( this.stop );

  }

  /* HELPERS */

  private _processKill = async (): Promise<void> => {

    const {process} = this;

    if ( !process ) return;

    this.process = undefined;

    await PID.tree.kill ( process.pid, process.pids || [process.pid] );

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

    const proc: Process = this.process = spawn ( exec, {
      stdio: ['ignore', null, null],
      shell: true
    });

    const updatePids = async (): Promise<void> => {
      if ( this.process !== proc ) return;
      const pids = await PID.tree.get ( proc.pid );
      proc.pids = pids || proc.pids;
    };

    const kill = (): void => {
      stdinDisposer ();
      clearInterval ( pidsInterval );
      PID.tree.kill ( proc.pid, proc.pids || [proc.pid] );
    };

    const closed = ( code: number | null ): void => {
      kill ();
      if ( code === 0 && this.options.watch ) return;
      restart ();
    };

    const restart = debounce ( (): void => {
      if ( this.process !== proc ) return kill ();
      this.restart ();
    }, 500 );

    const stdinDisposer = ( this.options.stdin !== false ) ? Stdin.onRestart ( restart ) : () => {};

    const pidsInterval = setInterval ( updatePids, 1000 );

    updatePids ();

    proc.on ( 'close', closed );
    proc.on ( 'error', restart );
    proc.on ( 'exit', closed );

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

    const ignoreGlobs = this.options.ignore || [];
    const ignore = ( targetPath: string ): boolean => !!ignoreGlobs.length && zeptomatch ( ignoreGlobs, targetPath );

    const delay = this.options.delay ?? 1000;
    const halfDelay = Math.floor ( delay / 2 );

    const restart = debounce ( this.restart, halfDelay );

    const options = {
      native: true,
      recursive: true,
      ignoreInitial: true,
      debounce: delay,
      ignore
    };

    this.watcher = new Watcher ( targetPaths, options, restart );

    return this;

  }

}

/* EXPORT */

export default ControllerSingle;
