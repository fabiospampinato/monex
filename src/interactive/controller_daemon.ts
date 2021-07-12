
/* IMPORT */

import {IController, OptionsConfig, Stat} from '../types';
import execute from '.';

/* MAIN */

class ControllerDaemon {

  /* VARIABLES */

  private controllers: IController[] = [];

  /* API */

  kill = (): void => {

    this.stop ();

    process.exit ( 0 );

  }

  start = async ( config: OptionsConfig ): Promise<boolean> => {

    this.stop ();

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

  stop = (): void => {

    try {

      this.controllers.forEach ( controller => controller.stop () );

    } catch {}

    this.controllers = [];

  }

};

/* EXPORT */

export default ControllerDaemon;
