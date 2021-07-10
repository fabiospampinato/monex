
/* IMPORT */

import {Callback, Disposer, Event} from './types';
import Events from './events';

/* MAIN */

class Stdin {

  /* VARIABLES */

  private events: Events<Event>;

  /* CONSTRUCTOR */

  constructor () {

    this.events = new Events ();

    process.stdin.on ( 'data', data => {
      if ( data.toString ().trim ().toLowerCase () !== 'rs' ) return;
      this.events.emit ( 'restart' );
    });

  }

  /* API */

  onRestart = ( listener: Callback ): Disposer => {

    return this.events.on ( 'restart', listener );

  }

}

/* EXPORT */

export default new Stdin ();
