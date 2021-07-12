
/* IMPORT */

import {OptionsMultiple, Stat} from '../types';
import Color from './color';
import ControllerSingle from './controller_single';

/* MAIN */

class ControllerMultiple {

  /* VARIABLES */

  controllers: ControllerSingle[];
  options: OptionsMultiple;

  /* CONSTRUCTOR */

  constructor ( options: OptionsMultiple ) {

    this.controllers = options.exec.map ( ( _, index ) => {
      return new ControllerSingle ({
        prefix: true,
        color: Color.inferColor ( index ),
        name: options.name?.[index] || String ( index ),
        exec: options.exec[index],
        ignore: options.ignore,
        watch: options.watch
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

  stat = (): Stat[] => {

    return this.controllers.map ( controller => controller.stat () );

  }

  stop = (): this => {

    this.controllers.forEach ( controller => controller.stop () );

    return this;

  }

}

/* EXPORT */

export default ControllerMultiple;
