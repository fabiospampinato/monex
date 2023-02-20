
/* IMPORT */

import {createHttpClient} from 'picorpc';
import type Procedures from '~/daemon/procedures';

/* MAIN */

const client = createHttpClient<typeof Procedures> ({
  url: 'http://localhost:8163'
});

/* EXPORT */

export default client;
