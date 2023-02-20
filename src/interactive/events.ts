
/* IMPORT */

import type {Callback, Disposer} from '~/types';

/* MAIN */

class Events<Event extends string> {

  /* VARIABLES */

  private listeners: Partial<Record<Event, Callback[]>> = {};

  /* API */

  emit = ( event: Event ): void => {

    const listeners = this.get ( event );

    for ( let i = 0, l = listeners.length; i < l; i++ ) {

      listeners[i]();

    }

  }

  get = ( event: Event ): Callback[] => {

    return this.listeners[event] || ( this.listeners[event] = [] );

  }

  on = ( event: Event, listener: Callback ): Disposer => {

    const listeners = this.get ( event );

    if ( listeners.includes ( listener ) ) return () => {};

    listeners.push ( listener );

    return () => {

      listeners.splice ( listeners.indexOf ( listener ), 1 );

    };

  }

}

/* EXPORT */

export default Events;
