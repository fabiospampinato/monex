
/* IMPORT */

import {OptionsMultiple, Stat} from '../types';
import Color from './color';
import ControllerSingle from './controller_single';

/* MAIN */

class ControllerMultiple {

  /* VARIABLES */

  private controllers: ControllerSingle[];
  private options: OptionsMultiple;

  /* CONSTRUCTOR */

  constructor ( options: OptionsMultiple ) {

    this.options = options;

    this.controllers = this.options.exec.map ( ( _, index ) => {

      const prefix = true;
      const name = this.options.name?.[index] || String ( index );
      const stdin = !this.options.restart || ( this.options.restart === name );
      const color = Color.inferColor ( index );
      const exec = this.options.exec[index];
      const ignore = this.options.ignore;
      const watch = this.options.watch

      return new ControllerSingle ({ prefix, name, stdin, color, exec, ignore, watch });

    });

  }

  /* API */

  restart = async (): Promise<void> => {

    await Promise.all ( this.controllers.map ( controller => controller.restart () ) );

  }

  start = async (): Promise<void> => {

    await Promise.all ( this.controllers.map ( controller => controller.start () ) );

  }

  stat = async (): Promise<Stat[]> => {

    return await Promise.all ( this.controllers.map ( controller => controller.stat () ) );

  }

  stop = async (): Promise<void> => {

    await Promise.all ( this.controllers.map ( controller => controller.stop () ) );

  }

}

/* EXPORT */

export default ControllerMultiple;
