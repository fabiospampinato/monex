
/* IMPORT */

import jayson from 'jayson/promise';

/* MAIN */

const client = jayson.Client.tcp ({
  port: 8163
});

/* EXPORT */

export default client;
