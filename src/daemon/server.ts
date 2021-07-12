
/* IMPORT */

import jayson from 'jayson/promise';
import ControllerDaemon from '../interactive/controller_daemon';

/* HELPERS */

const controller = new ControllerDaemon ();

/* MAIN */

const server = new jayson.Server ({
  start: controller.start,
  stat: controller.stat,
  stop: controller.kill
});

server.tcp ().listen ( 8163 );

/* EXPORT */

export default server;
