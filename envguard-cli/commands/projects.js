import inquirer from 'inquirer';
import axios from 'axios';
import chalk from 'chalk';
import Conf from 'conf';

const config = new Conf({ projectName: 'envguard' });

export async function projectsCmd() {
  const apiUrl = config.get('apiUrl');
  const token  = config.get('accessToken');

  if (!token) {
    console.log(chalk.red('\n  ✗ Not logged in. Run: envguard login\n'));
    process.exit(1);
  }

  try {
    const res = await axios.get(`${apiUrl}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const projects = res.data;

    if (projects.length === 0) {
      console.log(chalk.yellow('\n  No projects found.\n'));
      return;
    }

    console.log(chalk.cyan('\n  Your Projects\n'));

    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: 'Select active project:',
        choices: projects.map((p) => ({
          name: `${p.name}  ${chalk.gray(`(${p.secretCount || 0} secrets · ${p.members?.length || 0} members)`)}`,
          value: p._id,
          short: p.name,
        })),
      },
    ]);

    const project = projects.find((p) => p._id === selected);
    config.set('projectId',   project._id);
    config.set('projectName', project.name);

    console.log(chalk.green(`\n  ✓ Active project set to: ${project.name}\n`));
  } catch (err) {
    console.log(chalk.red(`\n  ✗ ${err.response?.data?.message || 'Failed to fetch projects'}\n`));
    process.exit(1);
  }
}