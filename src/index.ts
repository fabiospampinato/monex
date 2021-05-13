
/* IMPORT */

import {Options} from './types';
import Controller from './controller';

/* MAIN */

const execute = ( options: Options ): Controller => {

  return new Controller ( options ).start ();

};

/* EXPORT */

export default execute;
