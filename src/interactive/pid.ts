
/* IMPORT */

import pidtree from 'pidtree';
import pidusage from 'pidusage';
import {Usage} from '../types';

/* MAIN */

const PID = {

  /* TREE API */

  tree: {

    get: async ( pid: number | undefined ): Promise<number[] | undefined> => {

      try {

        if ( !pid ) return [];

        return await pidtree ( pid, { root: true } );

      } catch {}

    },

    kill: async ( pid: number | undefined, treeFallback: (number | undefined)[] = [pid] ): Promise<void> => {

      if ( !pid ) return;

      const pids = await PID.tree.get ( pid ) || treeFallback;

      pids.forEach ( PID.kill );

    },

    usage: async ( pid: number | undefined, treeFallback: (number | undefined)[] = [pid] ): Promise<Usage | undefined> => {

      if ( !pid ) return;

      const pids = await PID.tree.get ( pid ) || treeFallback;
      const usages = ( await Promise.all ( pids.map ( PID.usage ) ) ).filter ( usage => usage ) as Usage[]; //TSC

      if ( !usages.length ) return;

      return usages.reduce ( ( acc, usage ) => ({
        cpu: acc.cpu + usage.cpu,
        memory: acc.memory + usage.memory,
        timestamp: acc.timestamp
      }), usages[0] );

    }

  },

  /* API */

  kill: ( pid: number ): void => {

    PID.signal ( pid, 'SIGTERM' ); // Very patient

    setTimeout ( () => {

      PID.signal ( pid, 'SIGINT' ); // Somewhat patient

      setTimeout ( () => {

        PID.signal ( pid, 'SIGKILL' ); // No patience
        PID.signal ( pid, 'SIGKILL' ); // No patience
        PID.signal ( pid, 'SIGKILL' ); // No patience

      }, 2000 );

    }, 3000 );

  },

  signal: ( pid: number, signal: NodeJS.Signals ): boolean => {

    try {

      return process.kill ( pid, signal );

    } catch {

      return false;

    }

  },

  usage: ( pid: number ): Promise<Usage | undefined> => {

    return pidusage ( pid );

  }

};

/* EXPORT */

export default PID;
