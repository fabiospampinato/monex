
/* TYPES */

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

export {IController, OptionsMultiple, OptionsSingle};
