
/* IMPORT */

import {createHttpServer} from 'picorpc';
import Procedures from '~/daemon/procedures';

/* MAIN */

const server = createHttpServer ({
  port: 8163,
  procedures: Procedures
});

/* EXPORT */

export default server;
