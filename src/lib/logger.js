// Pass any logger method a single function if you are doing
// heavy computation to produce your message, so that it will
// only process that if the log message is being printed.

async function log(...messages) {
  if (typeof messages[0] === 'function') {
    const computedMessage = await messages[0]();
    if (Array.isArray(computedMessage)) {
      log(...computedMessage);
    } else {
      log(computedMessage);
    }
  } else {
    // eslint-disable-next-line
    console.log(...messages);
  }
}

export async function debug(...messages) {
  if (process.env.NEXT_PUBLIC_DEBUG_LOGS) {
    log('[DEBUG]', ...messages);
  }
}

export async function error(...messages) {
  log('[ERROR]', ...messages);
}

export async function info(...messages) {
  log(...messages);
}
