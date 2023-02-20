
/* IMPORT */

import ControllerMultiple from '~/interactive/controller_multiple';
import ControllerSingle from '~/interactive/controller_single';
import type {IController, OptionsMultiple, OptionsSingle} from '~/types';

/* MAIN */

const execute = ( options: Partial<OptionsMultiple | OptionsSingle> ): IController => {

  const {exec, ignore, name, watch} = options;
  const names = Array.isArray ( name ) ? name : ( name ? [name] : [] );
  const restart = ( 'restart' in options ) ? options.restart : undefined;
  const execs = Array.isArray ( exec ) ? exec : ( exec ? [exec] : [] );

  if ( !execs.length ) throw new Error ( 'No scripts to execute provided' );

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
