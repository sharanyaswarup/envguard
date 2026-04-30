import axios from 'axios';
import chalk from 'chalk';
import Conf from 'conf';
import fs from 'fs';
import path from 'path';

const config = new Conf({ projectName: 'envguard' });

export async function pullCmd(options) {
  const apiUrl    = config.get('apiUrl');
  const token     = config.get('accessToken');
  const projectId = options.project || config.get('projectId');
  const outFile   = options.out || '.env';

  if (!token) {
    console.log(chalk.red('\n  ✗ Not logged in. Run: envguard login\n'));
    process.exit(1);
  }

  if (!projectId) {
    console.log(chalk.red('\n  ✗ No project selected. Run: envguard projects\n'));
    process.exit(1);
  }

  try {
    console.log(chalk.cyan(`\n  Pulling secrets...\n`));

    // ✅ ONLY THIS CALL
    const res = await axios.get(
      `${apiUrl}/projects/${projectId}/secrets/export`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const envData = res.data;

    const outPath = path.resolve(process.cwd(), outFile);
    fs.writeFileSync(outPath, envData, 'utf8');

    const count = envData.split('\n').filter(Boolean).length;

    console.log(chalk.green(`\n  ✓ ${count} secrets written to ${outFile}\n`));

  } catch (err) {
    console.log(chalk.red(`\n  ✗ ${err.response?.data?.message || err.message}\n`));
    process.exit(1);
  }
}