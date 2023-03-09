#!/usr/bin/env node

/* IMPORT */

import {bin} from 'specialist';
import execute from '~/interactive';

/* MAIN */

bin ( 'monex', 'Execute one or multiple scripts, interactively' )
  .autoExit ( false )
  /* DEFAULT COMMAND */
  .option ( '-d, --delay <number>', 'Minimum delay between restarts' )
  .option ( '-n, --name <names...>', 'Name(s) used for debugging purposes', { eager: true } )
  .option ( '-r, --restart <name>', 'Name of the script to restart when restarting manually' )
  .option ( '-w, --watch <paths...>', 'Watch the provided paths recursively', { eager: true } )
  .option ( '-i, --ignore <globs...>', 'Ignore the paths matching any of these globs', { eager: true } )
  .option ( '-x, --exec <scripts...>', 'Script(s) to execute', { eager: true, required: true } )
  .action ( execute )
  /* RUN */
  .run ();
