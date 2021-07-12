
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
      return new ControllerSingle ({
        prefix: true,
        color: Color.inferColor ( index ),
        name: this.options.name?.[index] || String ( index ),
        exec: this.options.exec[index],
        ignore: this.options.ignore,
        watch: this.options.watch
      });
    });

  }

  /* API */

  restart = (): this => {

    this.controllers.forEach ( controller => controller.restart () );

    return this;

  }

  start = (): this => {

    this.controllers.forEach ( controller => controller.start () );

    return this;

  }

  stat = async (): Promise<Stat[]> => {

    return await Promise.all ( this.controllers.map ( controller => controller.stat () ) );

  }

  stop = (): this => {

    this.controllers.forEach ( controller => controller.stop () );

    return this;

  }

}

/* EXPORT */

export default ControllerMultiple;
