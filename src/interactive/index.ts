
/* IMPORT */

import {IController, OptionsMultiple, OptionsSingle} from '../types';
import ControllerMultiple from './controller_multiple';
import ControllerSingle from './controller_single';

/* MAIN */

const execute = ( options: OptionsMultiple | OptionsSingle ): IController => {

  const {exec, ignore, name, watch} = options;
  const names = Array.isArray ( name ) ? name : ( name ? [name] : [] );
  const restart = ( 'restart' in options ) ? options.restart : undefined;
  const execs = Array.isArray ( exec ) ? exec : [exec];

  if ( names.length && names.length !== execs.length ) throw new Error ( 'Mismatching number of names and scripts provided' );

  if ( execs.length > 1 ) {

    const controller = new ControllerMultiple ({
      name: names,
      restart,
      exec: execs,
      ignore,
      watch
    });

    controller.start ();

    return controller;

  } else {

    const controller = new ControllerSingle ({
      name: names[0],
      exec: execs[0],
      ignore,
      watch
    });

    controller.start ();

    return controller;

  }

};

/* EXPORT */

export default execute;
