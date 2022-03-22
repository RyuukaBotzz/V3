# Cooldown

Timer mechanism to place upper bound on rate of events.

## Installation

    npm install cooldown

## Example

This example reads lines of text from stdin.  When 'spam' is entered, it will
output 'spam' but only at a rate of once per 5 seconds.  Entering 'reset' can
reset the cooldown and allow 'spam' to succeed immediately after.  Entering
'ready?' will display the state of the cooldown timer.  The 'ready' event
listener will automatically print when the timer is off cooldown.

```javascript
var Cooldown = require('cooldown');
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Set limit to 5s
var cd = new Cooldown(5000);
cd.on('ready', console.log.bind('console', 'off cooldown'));

rl.on('line', function (line) {
  switch (line) {
  case 'spam':
    if (cd.fire()) {
      console.log('have some spam');
    } else {
      console.log('not yet');
    }
    break;
  case 'ready?':
    console.log(cd.ready ? 'yep' : 'nope');
    break;
  case 'reset':
    // reset the cooldown
    cd.reset();
    break;
  case 'quit':
    cd.destroy();
    rl.close();
    break;
  }
});
```

## API

### Class Cooldown

A cooldown timer with two states:

- ready: available to be fired
- on-cooldown: fired and waiting to become ready again

#### new Cooldown(timeout)

- timeout: cooldown timeout duration (in ms)

#### cooldown.fire()

Return true if the timer was ready (and puts it on-cooldown).

#### cooldown.reset(noEmit)

If timer is on-cooldown, reset it back to ready.

- noEmit: do not emit 'ready' event if timer was on-cooldown

#### cooldown.destroy()

Clear any timeouts and set timer to on-cooldown.
It will never enter the 'ready' state unless it is reset.

#### Property: ready

Contains true if the timer is off cooldown and available to fire, else false.

#### Event: 'ready'

Emitted whenever the timer comes back off cooldown.

- blocked: True if attempts were made to fire timer during cooldown period

#### Event: 'cooldown'

Emitted whenever the timer goes on cooldown.

## License

MIT


## Bugs

See <https://github.com/pfmooney/node-cooldown/issues>.
