// Pass any logger method a single function if you are doing
// heavy computation to produce your message, so that it will
// only process that if the log message is being printed.

async function log(...messages) {
  if (typeof messages[0] === 'function') {
    const computedMessage = await messages[0]();
    log(computedMessage);
  } else {
    // eslint-disable-next-line
    console.log(...messages);
  }
}

export async function debug(...messages) {
  if (process.env.DEBUG_LOGS) {
    log(...messages);
  }
}
