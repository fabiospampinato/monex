#!/usr/bin/env node

/* IMPORT */

import {color, program, updater} from 'specialist';
import {name, version, description} from '../../package.json';
import Daemon from '../daemon';
import Formatter from '../interactive/formatter';

/* MAIN */

updater ({ name, version });

program
  .name ( `${name}-daemon` )
  .version ( version )
  .description ( description );

program
  .command ( 'log' )
  .description ( 'Dump logs from the processes' )
  .option ( '-n, --lines <number>', 'The number of lines to output per stdout/stderr section' )
  .action ( async options => {
    const log = await Daemon.log ( options.lines );
    console.log ( log );
    process.exit ( 0 );
  });

program
  .command ( 'ping' )
  .description ( 'Ping the daemon' )
  .action ( async () => {
    const isOnline = await Daemon.ping ();
    const message = isOnline ? color.green ( 'Online' ) : color.red ( 'Offline' );
    const code = isOnline ? 0 : 1;
    console.log ( message );
    process.exit ( code );
  });

program
  .command ( 'start' )
  .description ( 'Start the daemon' )
  .option ( '-c, --config <path>', 'Path to the configuration to load' )
  .action ( async options => {
    const isSuccess = await Daemon.start ( options.config );
    const message = isSuccess ? color.green ( 'Success' ) : color.red ( 'Failure' );
    const code = isSuccess ? 0 : 1;
    console.log ( message );
    process.exit ( code );
  });

program
  .command ( 'stat' )
  .description ( 'Dump stats about the processes' )
  .option ( '-p, --pretty', 'Output in a more human-readable format' )
  .action ( async options => {
    const stats = await Daemon.stat ();
    const statsFormatted = Formatter.format ( stats, !!options.pretty );
    console.log ( statsFormatted );
    process.exit ( 0 );
  });

program
  .command ( 'stop' )
  .description ( 'Stop the daemon' )
  .action ( async () => {
    await Daemon.stop ();
    process.exit ( 0 );
  });

program.parse ();
