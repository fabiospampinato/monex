
/* IMPORT */

import pidtree from 'pidtree';

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

  }

};

/* EXPORT */

export default PID;
