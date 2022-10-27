const crossSpawn = require('cross-spawn');
const path = require('path');

const LIB_PATH = path.join(process.cwd(), 'projects/addin-client');

function runCommand(command, args) {
  crossSpawn.sync(command, args, {
    cwd: LIB_PATH,
    stdio: 'inherit',
  });
}

module.exports = runCommand;
