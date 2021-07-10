
/* IMPORT */

import {Callback, Disposer} from './types';

/* MAIN */

class Events<Event extends string> {

  /* VARIABLES */

  private listeners: Partial<Record<Event, Callback[]>> = {};

  /* API */

  emit = ( event: Event ): void => {

    const listeners = this.listeners[event];

    if ( !listeners?.length ) return;

    for ( let i = 0, l = listeners.length; i < l; i++ ) {

      listeners[i]();

    }

  }

  on = ( event: Event, listener: Callback ): Disposer => {

    const listeners = ( this.listeners[event] || ( this.listeners[event] = [] ) ) as Callback[]; //TSC

    if ( listeners.includes ( listener ) ) return () => {};

    listeners.push ( listener );

    return () => {

      listeners.splice ( listeners.indexOf ( listener ), 1 );

    };

  }

}

/* EXPORT */

export default Events;
