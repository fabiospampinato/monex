
/* IMPORT */

import {Color} from '../types';

/* MAIN */

const Color = {

  /* API */

  inferColor: ( nr: number ): Color => {

    const colors: Color[] = ['blue', 'magenta', 'yellow', 'cyan', 'red', 'green'];
    const index = Math.abs ( nr ) % colors.length;

    return colors[index];

  }

};

/* EXPORT */

export default Color;
