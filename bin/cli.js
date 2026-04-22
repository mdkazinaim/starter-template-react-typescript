#!/usr/bin/env node

import { spawnSync } from "child_process";
import { existsSync, rmSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { resolve, basename } from "path";
import chalk from "chalk";
import prompts from "prompts";
import { downloadTemplate } from "giget";
import validateNpmName from "validate-npm-package-name";

const run = async () => {
  let projectName = process.argv[2];

  if (!projectName) {
    const response = await prompts({
      type: "text",
      name: "projectName",
      message: "What is the name of your project?",
      initial: "my-app",
      validate: (value) => {
        if (value === ".") return true;
        const validation = validateNpmName(basename(resolve(value)));
        if (!validation.validForNewPackages) {
          return `Invalid project name: ${validation.errors ? validation.errors.join(', ') : ''} ${validation.warnings ? validation.warnings.join(', ') : ''}`;
        }
        return true;
      },
    });

    if (!response.projectName) {
      console.log(chalk.red("\nOperation cancelled"));
      process.exit(1);
    }
    projectName = response.projectName;
  }

  const isCurrentDir = projectName === ".";
  const projectPath = isCurrentDir
    ? process.cwd()
    : resolve(process.cwd(), projectName);
  const appName = isCurrentDir ? basename(projectPath) : projectName;

  // Validation
  if (!isCurrentDir && existsSync(projectPath)) {
    if (readdirSync(projectPath).length > 0) {
        const { overwrite } = await prompts({
            type: 'confirm',
            name: 'overwrite',
            message: `Target directory "${appName}" is not empty. Remove existing files and continue?`,
        });

        if (!overwrite) {
            console.log(chalk.red('Operation cancelled'));
            process.exit(1);
        }
        rmSync(projectPath, { recursive: true, force: true });
    }
  }

  console.log(chalk.blue(`\nCreating a new React app in ${chalk.bold(projectPath)}...`));

  // Download template using giget
  try {
    await downloadTemplate("github:naim0018/starter-template-react-typescript", {
      dir: projectPath,
      force: true,
    });
  } catch (error) {
    console.error(chalk.red("Failed to download template:"), error.message);
    process.exit(1);
  }

  console.log(chalk.green("Template downloaded successfully."));

  // Cleanup & Configuration
  console.log(chalk.blue("Configuring project..."));

  const packageJsonPath = resolve(projectPath, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

  // Cleanup: Remove library-specific fields
  delete packageJson.bin;
  delete packageJson.files;
  delete packageJson.repository;
  delete packageJson.bugs;
  delete packageJson.homepage;
  
  // Cleanup: Remove CLI dependencies (so the user project doesn't have them)
  const cliDeps = ["giget", "prompts", "chalk", "validate-npm-package-name"];
  cliDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) delete packageJson.dependencies[dep];
      if (packageJson.devDependencies && packageJson.devDependencies[dep]) delete packageJson.devDependencies[dep];
  });

  packageJson.name = appName;
  packageJson.version = "0.1.0";
  packageJson.description = ""; // Reset description

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Remove bin folder
  const binPath = resolve(projectPath, "bin");
  if (existsSync(binPath)) {
    rmSync(binPath, { recursive: true, force: true });
  }

  // Install dependencies
  console.log(chalk.blue("Installing dependencies..."));
  
  const installResult = spawnSync('npm', ['install'], { 
    cwd: projectPath, 
    stdio: 'inherit',
    shell: true
  });

  if (installResult.status !== 0) {
      console.error(chalk.red("Failed to install dependencies."));
      if (installResult.error) {
        console.error(chalk.red(installResult.error.message));
      }
      // We don't exit here, just warn, so the user sees the output.
  } else {
      console.log(chalk.green("Dependencies installed successfully."));
  }

  // Success Message
  console.log(chalk.green(`\nSuccess! Created ${appName} at ${projectPath}`));
  console.log("\nInside that directory, you can run several commands:\n");
  console.log(chalk.cyan(`  npm run dev`));
  console.log("    Starts the development server.\n");
  console.log(chalk.cyan(`  npm run build`));
  console.log("    Bundles the app for production.\n");
  console.log("\nWe suggest that you begin by typing:\n");
  if (!isCurrentDir) {
    console.log(chalk.cyan(`  cd ${projectName}`));
  }
  console.log(chalk.cyan(`  npm run dev`));
  console.log("");
};
run().catch((err) => {
  console.error(chalk.red("Unexpected error:"), err);
  process.exit(1);
});
