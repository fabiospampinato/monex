
/* TYPES */

type Callback = () => void;

type Color = 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan';

type Disposer = Callback;

type Event = 'restart';

type IController = {
  restart: () => void,
  start: () => void,
  stat: () => Stat | Stat[],
  stop: () => void
};

type OptionsMultiple = {
  name?: string[],
  watch?: string[],
  ignore?: string[],
  exec: string[]
};

type OptionsSingle = {
  color?: Color,
  name?: string,
  prefix?: boolean,
  watch?: string[],
  ignore?: string[],
  exec: string
};

type Stat = {
  id: number,
  pid: number,
  name: string,
  online: boolean,
  restarts: number,
  starttime: number,
  cpu: number,
  memory: number,
  stdout: string,
  stderr: string
};

/* EXPORT */

export {Callback, Color, Disposer, Event, IController, OptionsMultiple, OptionsSingle, Stat};
