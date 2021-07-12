
/* TYPES */

type Callback = () => void;

type Color = 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan';

type Disposer = Callback;

type Event = 'restart';

type IController = {
  restart: () => void,
  start: () => void,
  stat: () => Promise<Stat | Stat[]>,
  stop: () => void
};

type OptionsConfig = OptionsSingle[];

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
  pid: number,
  name: string,
  online: boolean,
  restarts: number,
  timestamp: number,
  cpu: number,
  memory: number,
  stdout: string,
  stderr: string
};

type Usage = {
  cpu: number,
  memory: number,
  timestamp: number
};

/* EXPORT */

export {Callback, Color, Disposer, Event, IController, OptionsConfig, OptionsMultiple, OptionsSingle, Stat, Usage};
