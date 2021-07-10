
/* TYPES */

type Callback = () => void;

type Disposer = Callback;

type Event = 'restart';

type IController = {
  restart: () => void,
  start: () => void,
  stop: () => void
};

type OptionsMultiple = {
  name?: string[],
  watch?: string[],
  ignore?: string[],
  exec: string[]
};

type OptionsSingle = {
  name?: string,
  watch?: string[],
  ignore?: string[],
  exec: string
};

/* EXPORT */

export {Callback, Disposer, Event, IController, OptionsMultiple, OptionsSingle};
