
/* IMPORT */

import type {ChildProcessByStdio} from 'node:child_process';
import type {Readable} from 'node:stream';

/* MAIN */

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
  restart?: string,
  watch?: string[],
  ignore?: string[],
  exec: string[]
};

type OptionsSingle = {
  color?: Color,
  name?: string,
  prefix?: boolean,
  stdin?: boolean,
  watch?: string[],
  ignore?: string[],
  exec: string
};

type Process = ChildProcessByStdio<null, Readable, Readable> & {
  pids?: number[]
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

export type {Callback, Color, Disposer, Event, IController, OptionsConfig, OptionsMultiple, OptionsSingle, Process, Stat, Usage};
