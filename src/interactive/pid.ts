
/* IMPORT */

import process from 'node:process';
import pidtree from 'pidtree';
import pidusage from 'pidusage';
import type {Usage} from '~/types';

/* MAIN */

const PID = {

  /* TREE API */

  tree: {

    get: async ( pid: number | undefined ): Promise<number[] | undefined> => {

      try {

        if ( !pid ) return [];

        return await pidtree ( pid, { root: true } );

      } catch {

        return;

      }

    },

    kill: async ( pid: number | undefined, treeFallback: (number | undefined)[] = [pid] ): Promise<void> => {

      if ( !pid ) return;

      const pids = await PID.tree.get ( pid ) || treeFallback;

      await Promise.all ( pids.map ( PID.kill ) );

    },

    usage: async ( pid: number | undefined, treeFallback: (number | undefined)[] = [pid] ): Promise<Usage | undefined> => {

      if ( !pid ) return;

      const pids = await PID.tree.get ( pid ) || treeFallback;
      const usages = ( await Promise.all ( pids.map ( PID.usage ) ) ).filter ( usage => usage ) as Usage[]; //TSC

      if ( !usages.length ) return;

      return usages.reduce ( ( acc, usage ) => ({
        cpu: acc.cpu + usage.cpu,
        memory: acc.memory + usage.memory,
        birthtime: acc.birthtime,
        uptime: acc.uptime
      }), usages[0] );

    }

  },

  /* API */

  exists: ( pid: number ): boolean => {

    try {

      return process.kill ( pid, 0 );

    } catch ( error: unknown ) {

      return ( error instanceof Error ) && ( 'code' in error ) && ( error.code === 'EPERM' );

    }

  },

  kill: async ( pid?: number ): Promise<void> => {

    if ( !pid ) return;

    return new Promise ( async resolve => {

      PID.signal ( pid, 'SIGTERM' ); // Some patience

      const timeoutId = setTimeout ( () => { // No patience

        PID.signal ( pid, 'SIGKILL' );
        PID.signal ( pid, 'SIGKILL' );
        PID.signal ( pid, 'SIGKILL' );

      }, 3000 );

      const intervalId = setInterval ( async () => {

        if ( PID.exists ( pid ) ) return;

        clearTimeout ( timeoutId );
        clearInterval ( intervalId );

        resolve ();

      }, 50 );

    });

  },

  signal: ( pid: number, signal: NodeJS.Signals ): boolean => {

    try {

      return process.kill ( pid, signal );

    } catch {

      return false;

    }

  },

  usage: async ( pid?: number ): Promise<Usage | undefined> => {

    if ( !pid ) return;

    try {

      const {cpu, memory, elapsed: uptime} = await pidusage ( pid );
      const birthtime = Date.now () - uptime;

      return {cpu, memory, birthtime, uptime};

    } catch {

      return;

    }

  }

};

/* EXPORT */

export default PID;
