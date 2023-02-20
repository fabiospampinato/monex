
/* IMPORT */

import process from 'node:process';
import Events from '~/interactive/events';
import type {Buffer} from 'node:buffer';
import type {Callback, Disposer, Event} from '~/types';

/* MAIN */

class Stdin {

  /* VARIABLES */

  private events: Events<Event>;
  private isListening: boolean;

  /* CONSTRUCTOR */

  constructor () {

    this.events = new Events ();
    this.isListening = false;

  }

  /* LIFECYCLE */

  init = (): void => {

    process.stdin.on ( 'data', this.onData );

  }

  destroy = (): void => {

    process.stdin.off ( 'data', this.onData );

  }

  refresh = (): void => {

    const isListeningNext = !!this.events.get ( 'restart' ).length;

    if ( this.isListening === isListeningNext ) return;

    this.isListening = isListeningNext;

    if ( this.isListening ) {

      this.init ();

    } else {

      this.destroy ();

    }

  }

  /* API */

  onData = ( data: Buffer ): void => {

    if ( data.toString ().trim ().toLowerCase () !== 'rs' ) return;

    this.events.emit ( 'restart' );

  }

  onRestart = ( listener: Callback ): Disposer => {

    const disposer = this.events.on ( 'restart', listener );

    this.refresh ();

    return () => {

      disposer ();

      this.refresh ();

    };

  }

}

/* EXPORT */

export default new Stdin ();
