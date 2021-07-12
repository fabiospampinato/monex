
/* IMPORT */

import jayson from 'jayson/promise';
import {IController, OptionsSingle, Stat} from '../types';
import execute from '../interactive';

/* HELPERS */

const controllers: IController[] = [];

/* MAIN */

const server = new jayson.Server ({

  /* API */

  start: async ( config: OptionsSingle[] ): Promise<boolean> => {

    try {

      for ( const options of config ) {

        const controller = execute ( options );

        controllers.push ( controller );

      }

      return true;

    } catch {

      return false;

    }

  },

  stat: async (): Promise<Stat[]> => {

    try {

      return controllers.flatMap ( controller => controller.stat () );

    } catch {

      return [];

    }

  },

  stop: (): void => {

    try {

      controllers.forEach ( controller => controller.stop () );

    } catch {}

    process.exit ( 0 );

  }

});

server.tcp ().listen ( 8163 );

/* EXPORT */

export default server;
