#!/usr/bin/env node

/* IMPORT */

import process from 'node:process';
import {bin, color} from 'specialist';
import Daemon from '~/daemon';
import Formatter from '~/interactive/formatter';

/* MAIN */

//TODO: Add support for restarting clusters with zero downtime

bin ( 'monexd', 'Execute one or multiple scripts, in daemon mode' )
  /* LOG */
  .command ( 'log', 'Dump logs from the processes' )
  .option ( '-n, --lines <number>', 'The number of lines to output per stdout/stderr section' )
  .action ( async options => {
    const lines = Number ( options['lines'] ) || 100;
    const log = await Daemon.log ( lines );
    console.log ( log );
  })
  /* PING */
  .command ( 'ping', 'Ping the daemon' )
  .action ( async () => {
    const isOnline = await Daemon.ping ();
    const message = isOnline ? color.green ( 'Online' ) : color.red ( 'Offline' );
    const code = isOnline ? 0 : 1;
    console.log ( message );
    process.exit ( code );
  })
  /* START */
  .command ( 'start', 'Start the daemon' )
  .option ( '-c, --config <path>', 'Path to the configuration to load' )
  .action ( async options => {
    const config = options['config'];
    const isSuccess = await Daemon.start ( config );
    const message = isSuccess ? color.green ( 'Success' ) : color.red ( 'Failure' );
    const code = isSuccess ? 0 : 1;
    console.log ( message );
    process.exit ( code );
  })
  /* STAT */
  .command ( 'stat', 'Dump stats about the processes' )
  .option ( '-p, --pretty', 'Output in a more human-readable format' )
  .action ( async options => {
    const pretty = !!options['pretty'];
    const stats = await Daemon.stat ();
    const statsFormatted = Formatter.format ( stats, pretty );
    console.log ( statsFormatted );
  })
  /* STOP */
  .command ( 'stop', 'Stop the daemon' )
  .action ( Daemon.stop )
  /* RUN */
  .run ();
