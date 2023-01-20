
/* IMPORT */

import {spawn} from 'child_process';
import findUpJson from 'find-up-json';
import fs from 'fs';
import path from 'path';
import {color} from 'specialist';
import JSONC from 'tiny-jsonc';
import {OptionsSingle, Stat} from '../types';
import client from './client';

/* MAIN */

const Daemon = {

  /* API */

  idle: async (): Promise<void> => {

    if ( await Daemon.ping () ) return;

    return Daemon.idle ();

  },

  log: async ( linesNr: number = 100 ): Promise<string> => {

    const stats = await Daemon.stat ();
    const lines: string[] = [];

    for ( const stat of stats ) {

      const stdoutLines = stat.stdout.split ( /\r?\n/g ).splice ( -linesNr );
      const stderrLines = stat.stderr.split ( /\r?\n/g ).splice ( -linesNr );

      lines.push ( `[${color.cyan ( color.bold ( stat.name ) )}:${color.bold ( 'stdout' )}]` );
      lines.push ( ...stdoutLines );
      lines.push ( `[${color.cyan ( color.bold ( stat.name ) )}:${color.bold ( 'stderr' )}]` );
      lines.push ( ...stderrLines );

    }

    return lines.join ( '\n' );

  },

  ping: async (): Promise<boolean> => {

    try {

      await client.request ( 'ping', [] );

      return true;

    } catch {

      return false;

    }

  },

  spawn: async (): Promise<void> => {

    await Daemon.stop ();

    const serverPath = path.join ( __dirname, 'server.js' );

    const proc = spawn ( process.execPath, [serverPath], {
      stdio: 'ignore',
      env: process.env,
      cwd: process.cwd (),
      detached: true
    });

    proc.unref ();

    await Daemon.idle ();

  },

  start: async ( config?: OptionsSingle[] | string ): Promise<boolean> => {

    if ( typeof config === 'string' ) {

      config = JSONC.parse ( fs.readFileSync ( config, 'utf8' ) );

    }

    if ( typeof config === 'undefined' ) {

      config = findUpJson ( 'monex.json' )?.content;

    }

    if ( !Array.isArray ( config ) ) {

      throw new Error ( 'You need to provide a configuration, either via the "--config" option or by having a "monex.json" file higher up' );

    }

    await Daemon.spawn ();

    try {

      const {result} = await client.request ( 'start', config );

      return !!result;

    } catch {

      return false;

    }

  },

  stat: async (): Promise<Stat[]> => {

    try {

      const {result} = await client.request ( 'stat', [] );

      return result;

    } catch {

      return [];

    }

  },

  stop: async (): Promise<void> => {

    if ( !await Daemon.ping () ) return;

    try {

      await client.request ( 'stop', [] );

    } catch {

      return Daemon.stop ();

    }

  }

};

/* EXPORT */

export default Daemon;
