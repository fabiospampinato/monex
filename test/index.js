
const {spawn} = require ( 'child_process' );

console.log ( 'Child started...', Date.now () );

spawn ( 'while sleep 1; do echo "Subchild echoing..."; done', { stdio: 'inherit', shell: true } );

setInterval ( () => {

  if ( Math.random () < .1 ) {

    console.log ( 'Child about to throw...', Date.now () );

    throw new Error ();

  }

  if ( Math.random () < .1 ) {

    console.log ( 'Child about to crash...', Date.now () );

    process.exit ();

  }

  console.log ( 'Child still alive...', Date.now () );

}, 1000 );
