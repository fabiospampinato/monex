
/* IMPORT */

import process from 'node:process';
import {color} from 'specialist';
import type {Buffer} from 'node:buffer';
import type {Color} from '~/types';

/* MAIN */

const Logger = {

  /* API */

  log: ( data: Buffer | string, prefixName?: string, prefixColor?: Color ): void => {

    if ( !prefixName ) return void process.stdout.write ( data );

    const prefix = prefixColor ? color.bold ( color[prefixColor]( prefixName ) ) : color.bold ( prefixName );

    const lines = data.toString ().replace ( /^\r?\n|\r?\n$/, '' ).split ( /\r?\n|\r/g );

    lines.forEach ( line => {

      process.stdout.write ( `[${prefix}] ${line}\n`);

    });

  }

};

/* EXPORT */

export default Logger;
