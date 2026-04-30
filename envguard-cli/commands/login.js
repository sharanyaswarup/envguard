import inquirer from 'inquirer';
import axios from 'axios';
import chalk from 'chalk';
import Conf from 'conf';

const config = new Conf({ projectName: 'envguard' });

export async function loginCmd() {
  console.log(chalk.cyan('\n  EnvGuard Login\n'));

  const { apiUrl } = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiUrl',
      message: 'API URL:',
      default: config.get('apiUrl') || 'https://envguard-api-bzuh.onrender.com/api',
    },
  ]);

  const { email, password } = await inquirer.prompt([
    { type: 'input',    name: 'email',    message: 'Email:' },
    { type: 'password', name: 'password', message: 'Password:', mask: '*' },
  ]);

  try {
    const res = await axios.post(`${apiUrl}/auth/login`, { email, password });
    const { accessToken, user } = res.data;

    config.set('apiUrl', apiUrl);
    config.set('accessToken', accessToken);
    config.set('userEmail', user.email);
    config.set('userName', user.name);

    console.log(chalk.green(`\n  ✓ Logged in as ${user.name} (${user.email})\n`));
  } catch (err) {
    console.log(chalk.red(`\n  ✗ ${err.response?.data?.message || 'Login failed'}\n`));
    process.exit(1);
  }
}