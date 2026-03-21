const { execSync } = require('child_process');

const command = process.argv[2];
const args = process.argv.slice(3);

function run() {
  try {
    if (command === 'status') {
      const result = execSync('git status --short', { encoding: 'utf-8' });
      console.log(result || 'No changes');
    } else if (command === 'commit' && args.length > 0) {
      const message = args.join(' ');
      execSync('git add .', { encoding: 'utf-8' });
      execSync(`git commit -m "${message}"`, { encoding: 'utf-8' });
      console.log('Committed:', message);
    } else if (command === 'push' && args[0]) {
      const branch = args[0] || 'main';
      execSync(`git push origin ${branch}`, { encoding: 'utf-8' });
      console.log('Pushed to', branch);
    } else if (command === 'log' && args[0]) {
      const result = execSync(`git log --oneline -${args[0] || 5}`, { encoding: 'utf-8' });
      console.log(result);
    } else {
      console.log('Usage: node git-helper.js [status|commit|push|log] [args]');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

run();
