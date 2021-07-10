
/* IMPORT */

import {OptionsMultiple} from './types';
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
        name: options.name?.[index],
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

  stop = (): this => {

    this.controllers.forEach ( controller => controller.stop () );

    return this;

  }

}

/* EXPORT */

export default ControllerMultiple;
