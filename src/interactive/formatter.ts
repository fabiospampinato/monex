
/* IMPORT */

import Table from 'cli-table';
import prettyBytes from 'pretty-bytes';
import prettyMs from 'pretty-ms';
import {color} from 'specialist';
import type {Stat} from '~/types';

/* MAIN */

const Formatter = {

  /* FORMATTERS API */

  formatters: {

    toPercentage: ( value: number | string ): string => {

      if ( !value ) return '0%';

      return `${String ( Number ( Number ( value ).toFixed ( 2 ) ) )}%`;

    },

    toSize: ( bytes: number | string ): string => {

      return prettyBytes ( Number ( bytes ) ).replace ( /\s/g, '' );

    },

    toStatus: ( isOK: boolean ): string => {

      if ( isOK ) return color.green ( 'OK' );

      return color.red ( 'OFFLINE' );

    },

    toTime: ( ms: number | string ): string => {

      return prettyMs ( Number ( ms ), { colonNotation: true, secondsDecimalDigits: 0 } );

    }

  },

  /* API */

  formatJSON: ( stats: Stat[] ): string => {

    return JSON.stringify ( stats );

  },

  formatTable: ( stats: Stat[] ): string => {

    const {toPercentage, toSize, toStatus, toTime} = Formatter.formatters;

    const table = new Table ({
      head: ['PID', 'Name', 'Status', 'Restarts', 'Uptime', 'CPU', 'MEM'].map ( head => color.black.bold ( head ) ),
      colAligns: ['middle', 'left', 'middle', 'middle', 'right', 'right', 'right']
    });

    stats.forEach ( stat => {
      table.push ([
        String ( stat.pid ),
        stat.name,
        toStatus ( stat.online ),
        String ( stat.restarts ),
        toTime ( stat.uptime ),
        toPercentage ( stat.cpu ),
        toSize ( stat.memory )
      ]);
    });

    return table.toString ();

  },

  format: ( stats: Stat[], pretty?: boolean ): string => {

    if ( pretty ) return Formatter.formatTable ( stats );

    return Formatter.formatJSON ( stats );

  }

};

/* EXPORT */

export default Formatter;
