
/* IMPORT */

import {Color} from './types';

/* MAIN */

const Color = {

  /* API */

  inferColor: ( index: number ): Color => {

    const colors: Color[] = ['blue', 'magenta', 'yellow', 'cyan', 'red', 'green'];

    return colors[Math.abs ( index ) % colors.length];

  }

};

/* EXPORT */

export default Color;
