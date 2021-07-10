
/* TYPES */

type IController = {
  restart: () => void,
  start: () => void,
  stop: () => void
};

type Options = {
  name?: string,
  watch?: string[],
  ignore?: string[],
  exec: string
};

/* EXPORT */

export {IController, Options};
