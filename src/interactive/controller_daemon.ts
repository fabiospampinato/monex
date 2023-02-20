
/* IMPORT */

import process from 'node:process';
import execute from '~/interactive';
import type {IController, OptionsConfig, Stat} from '~/types';

/* MAIN */

class ControllerDaemon {

  /* VARIABLES */

  private controllers: IController[] = [];

  /* API */

  kill = async (): Promise<void> => {

    await this.stop ();

    process.exit ( 0 );

  }

  ping = async (): Promise<void> => {

    return;

  }

  start = async ( config: OptionsConfig ): Promise<boolean> => {

    await this.stop ();

    try {

      config.forEach ( options => {

        const controller = execute ( options );

        this.controllers.push ( controller );

      });

      return true;

    } catch {

      return false;

    }

  }

  stat = async (): Promise<Stat[]> => {

    try {

      return ( await Promise.all ( this.controllers.map ( controller => controller.stat () ) ) ).flat ();

    } catch {

      return [];

    }

  }

  stop = async (): Promise<void> => {

    try {

      await Promise.all ( this.controllers.map ( controller => controller.stop () ) );

    } catch {}

    this.controllers = [];

  }

};

/* EXPORT */

export default ControllerDaemon;
