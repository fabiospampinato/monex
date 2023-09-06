
/* IMPORT */

import cluster from 'node:cluster';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import {color} from 'specialist';
import type {Worker} from 'node:cluster';
import type {OptionsCluster} from '../types';

/* MAIN */

// The cluster controller should be spawned with the right options, and then it will spawn and respawn its workers

if ( cluster.isPrimary ) { // Controller, just to be sure

  const options: OptionsCluster = JSON.parse ( process.argv[2] );
  const name = options.name;
  const delay = options.delay || 1000;
  const workersSize = Math.max ( 2, options.size || os.cpus ().length );
  const workers = new Set<Worker> ();
  let exiting = false;

  const setup = (): void => {

    cluster.setupPrimary ({
      exec: path.resolve ( process.cwd (), options.exec ),
      args: options.args,
      windowsHide: true
    });

  };

  const init = (): void => {

    for ( let i = 0; i < workersSize; i++ ) {

      fork ();

    }

  };

  const fork = (): void => {

    if ( exiting ) return;
    if ( workers.size >= workersSize ) return;

    console.log ( `[monex] ${name ? `${color.bold ( name )} - ` : ''}Starting cluster worker...` );

    const worker = cluster.fork ();

    workers.add ( worker );

  };

  const onExit = (): void => {

    exiting = true;

    for ( const worker of workers ) {

      if ( worker.isDead () ) continue;

      worker.kill ( 'SIGTERM' );

    }

  };

  const onWorkerExit = ( worker: Worker ): void => {

    workers.delete ( worker );

    setTimeout ( fork, delay ); // Restarting it

  };

  cluster.on ( 'exit', onWorkerExit );
  process.on ( 'SIGTERM', onExit );

  setup ();
  init ();

}
