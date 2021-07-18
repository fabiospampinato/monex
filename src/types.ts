
/* TYPES */

type Callback = () => void;

type Color = 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan';

type Disposer = Callback;

type Event = 'restart';

type IController = {
  restart: () => Promise<void>,
  start: () => Promise<void>,
  stat: () => Promise<Stat | Stat[]>,
  stop: () => Promise<void>
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
  birthtime: number,
  uptime: number,
  cpu: number,
  memory: number,
  stdout: string,
  stderr: string
};

type Usage = {
  cpu: number,
  memory: number,
  birthtime: number,
  uptime: number
};

/* EXPORT */

export {Callback, Color, Disposer, Event, IController, OptionsConfig, OptionsMultiple, OptionsSingle, Stat, Usage};
