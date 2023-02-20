
/* IMPORT */

import ControllerDaemon from '~/interactive/controller_daemon';

/* HELPERS */

const controller = new ControllerDaemon ();

/* MAIN */

const Procedures = {
  ping: controller.ping,
  start: controller.start,
  stat: controller.stat,
  stop: controller.kill
};

/* EXPORT */

export default Procedures;
