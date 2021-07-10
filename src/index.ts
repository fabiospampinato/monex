
/* IMPORT */

import {IController, Options} from './types';
import Controller from './controller';

/* MAIN */

const execute = ( options: Options ): IController => {

  return new Controller ( options ).start ();

};

/* EXPORT */

export default execute;
