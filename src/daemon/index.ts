
/* IMPORT */

import findUp from 'find-up-json';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {color} from 'specialist';
import dirname from 'tiny-dirname';
import JSONC from 'tiny-jsonc';
import client from '~/daemon/client';
import type {OptionsSingle, Stat} from '~/types';

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

      const stdoutLines = stat.stdout.split ( /\r?\n|\r/g ).splice ( -linesNr );
      const stderrLines = stat.stderr.split ( /\r?\n|\r/g ).splice ( -linesNr );

      lines.push ( `[${color.cyan.bold ( stat.name )}:${color.bold ( 'stdout' )}]` );
      lines.push ( ...stdoutLines );
      lines.push ( `[${color.cyan.bold ( stat.name )}:${color.bold ( 'stderr' )}]` );
      lines.push ( ...stderrLines );

    }

    return lines.join ( '\n' );

  },

  ping: async (): Promise<boolean> => {

    try {

      await client.ping ();

      return true;

    } catch {

      return false;

    }

  },

  spawn: async (): Promise<void> => {

    await Daemon.stop ();

    const folderPath = dirname ( import.meta.url );
    const serverPath = path.join ( folderPath, 'server.js' );

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

      config = findUp ( 'monex.json' )?.content;

    }

    if ( !Array.isArray ( config ) ) {

      throw new Error ( 'You need to provide a configuration, either via the "--config" option or by having a "monex.json" file higher up' );

    }

    await Daemon.spawn ();

    try {

      const result = await client.start ( config );

      return !!result;

    } catch {

      return false;

    }

  },

  stat: async (): Promise<Stat[]> => {

    try {

      const result = await client.stat ();

      return result;

    } catch {

      return [];

    }

  },

  stop: async (): Promise<void> => {

    if ( !await Daemon.ping () ) return;

    try {

      await client.stop ();

    } catch {

      return Daemon.stop ();

    }

  }

};

/* EXPORT */

export default Daemon;
