#!/usr/bin/env node

const { promisify } = require('node:util');
const exec = promisify(require('node:child_process').exec);

const args = process.argv.slice(2);
let exclude;
while (args.length) {
  switch (args[0]) {
    case '--exclude': { // NOTE: Use pipe `|` to add multiple exclusions: ':win|:unique'
      exclude = args[1];
      args.splice(0, 2);
      break;
    }
    default: args.splice(0, args.length);
  }
}

// TODO: Switch to `node:util -> styleText` if support is considered efficient.
const color = (col, txt) => {
  const cols = {
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    reset: "\x1b[0m",
    yellow: "\x1b[33m",
  };

  return `${cols[col] || ''}${txt}${cols.reset}`;
};

const tests = Object
  .keys(require('../package.json').scripts)
  .filter(s => (
    /^test:/.test(s)
    && ((exclude.length) ? !(new RegExp(`(${exclude})`)).test(s) : true)
  ));

const printMsg = (msg, overwrite = false) => {
  if (overwrite) {
    process.stdout.clearLine?.(0);
    process.stdout.cursorTo?.(0);
  }
  process.stdout.write(msg);
};

(async () => {
  for (let t of tests) {
    
    try {
      printMsg(` Testing: ${color('cyan', t)}`);
      await exec(`npm run ${t}`);
      printMsg(` ${color('green', '✔')} ${color('cyan', t)}`, true);
    }
    catch (err) {
      printMsg(` ${color('red', '✘')} ${color('yellow', t)}`, true);
      
      if (err.stdout) {
        const lines = err.stdout
          .split('\n')
          .filter(l => !!l && !l.startsWith('> '))
          .map(l => color('red', l));
        
        printMsg(`\n\n   ${lines.join('\n')}`);
        break;
      }
      else { throw err; }
    }
    finally {
      printMsg('\n');
    }
  }
})();
