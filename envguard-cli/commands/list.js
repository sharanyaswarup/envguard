import axios from 'axios';
import chalk from 'chalk';
import Conf from 'conf';

const config = new Conf({ projectName: 'envguard' });

export async function listCmd(options) {
  const apiUrl    = config.get('apiUrl');
  const token     = config.get('accessToken');
  const projectId = options.project || config.get('projectId');

  if (!token) {
    console.log(chalk.red('\n  ✗ Not logged in. Run: envguard login\n'));
    process.exit(1);
  }

  if (!projectId) {
    console.log(chalk.red('\n  ✗ No project selected. Run: envguard projects\n'));
    process.exit(1);
  }

  try {
    const res = await axios.get(`${apiUrl}/projects/${projectId}/secrets`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const secrets = res.data;
    const projectName = config.get('projectName') || projectId;

    console.log(chalk.cyan(`\n  ${projectName} — ${secrets.length} secret${secrets.length !== 1 ? 's' : ''}\n`));

    if (secrets.length === 0) {
      console.log(chalk.yellow('  No secrets yet.\n'));
      return;
    }

    secrets.forEach((s, i) => {
      const num  = chalk.gray(`${String(i + 1).padStart(2, ' ')}.`);
      const key  = chalk.cyan(s.key);
      const dots = chalk.gray('••••••••');
      const by   = s.updatedBy?.name ? chalk.gray(` · ${s.updatedBy.name}`) : '';
      console.log(`  ${num} ${key}  ${dots}${by}`);
    });

    console.log();
  } catch (err) {
    console.log(chalk.red(`\n  ✗ ${err.response?.data?.message || err.message}\n`));
    process.exit(1);
  }
}