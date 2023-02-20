
/* IMPORT */

import type {Color as IColor} from '~/types';

/* MAIN */

const Color = {

  /* API */

  inferColor: ( nr: number ): IColor => {

    const colors: IColor[] = ['blue', 'magenta', 'yellow', 'cyan', 'red', 'green'];
    const index = Math.abs ( nr ) % colors.length;

    return colors[index];

  }

};

/* EXPORT */

export default Color;
