#!/usr/bin/env node
import { program } from 'commander';
import { loginCmd } from './commands/login.js';
import { projectsCmd } from './commands/projects.js';
import { pullCmd } from './commands/pull.js';
import { listCmd } from './commands/list.js';

program
  .name('envguard')
  .description('EnvGuard CLI — secure secret management')
  .version('1.0.0');

program
  .command('login')
  .description('Authenticate with your EnvGuard account')
  .action(loginCmd);

program
  .command('projects')
  .description('List and select your active project')
  .action(projectsCmd);

program
  .command('pull')
  .description('Pull secrets from selected project into local .env file')
  .option('--project <id>', 'Project ID (optional, uses saved project if omitted)')
  .option('--out <file>', 'Output file path', '.env')
  .action(pullCmd);

program
  .command('list')
  .description('List all secret keys in a project')
  .option('--project <id>', 'Project ID (optional, uses saved project if omitted)')
  .action(listCmd);

program.parse();