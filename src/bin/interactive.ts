#!/usr/bin/env node

/* IMPORT */

import {program, updater} from 'specialist';
import {name, version, description} from '../../package.json';
import execute from '../interactive';

/* MAIN */

updater ({ name, version });

program
  .name ( name )
  .version ( version )
  .description ( description )
  .option ( '-n, --name <names...>', 'Name(s) used for debugging purposes' )
  .option ( '-w, --watch <paths...>', 'Watch the provided paths recursively' )
  .option ( '-i, --ignore <globs...>', 'Ignore the paths matching any of these globs' )
  .requiredOption ( '-x, --exec <scripts...>', 'Script(s) to execute' )
  .action ( options => {
    execute ( options );
  });

program.parse ();
