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
  let selectedModules = ["public", "admin"];

  const response = await prompts([
    {
      type: projectName ? null : "text",
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
    },
    {
      type: "select",
      name: "modules",
      message: "Which version of the template do you want?",
      choices: [
        { title: "Full Template (Public + Admin + User)", value: ["public", "admin", "user"] },
        { title: "Public + Admin Dashboard", value: ["public", "admin"] },
        { title: "Admin + User Dashboard", value: ["admin", "user"] },
        { title: "Public + User Dashboard", value: ["public", "user"] },
        { title: "Public Pages Only", value: ["public"] },
        { title: "Admin Dashboard Only", value: ["admin"] },
        { title: "User Dashboard Only", value: ["user"] },
      ],
      initial: 0,
    },
  ]);

  projectName = projectName || response.projectName;
  selectedModules = response.modules || selectedModules;

  if (!projectName) {
    console.log(chalk.red("\nOperation cancelled"));
    process.exit(1);
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
        type: "confirm",
        name: "overwrite",
        message: `Target directory "${appName}" is not empty. Remove existing files and continue?`,
      });

      if (!overwrite) {
        console.log(chalk.red("Operation cancelled"));
        process.exit(1);
      }
      rmSync(projectPath, { recursive: true, force: true });
    }
  }

  console.log(
    chalk.blue(`\nCreating a new React app in ${chalk.bold(projectPath)}...`)
  );

  // Download template using giget
  try {
    await downloadTemplate(
      "github:mdkazinaim/starter-template-react-typescript",
      {
        dir: projectPath,
        force: true,
      }
    );
  } catch (error) {
    console.error(chalk.red("Failed to download template:"), error.message);
    process.exit(1);
  }

  console.log(chalk.green("Template downloaded successfully."));

  // Cleanup & Configuration
  console.log(chalk.blue("Configuring project modules..."));

  // 1. Module Pruning Logic
  const routesPath = resolve(projectPath, "src/routes/Routes.tsx");
  if (existsSync(routesPath)) {
    let routesContent = readFileSync(routesPath, "utf-8");

    // Admin Pruning
    if (!selectedModules.includes("admin")) {
      console.log(chalk.yellow("- Removing Admin module..."));
      rmSync(resolve(projectPath, "src/pages/Admin"), {
        recursive: true,
        force: true,
      });
      rmSync(resolve(projectPath, "src/routes/AdminRoutes.tsx"), {
        force: true,
      });
      routesContent = routesContent.replace(
        /\/\/ \[ADMIN_MODULE_START\][\s\S]*?\/\/ \[ADMIN_MODULE_END\]/g,
        ""
      );
      routesContent = routesContent.replace(
        /\/\/ \[ADMIN_ROUTES_START\][\s\S]*?\/\/ \[ADMIN_ROUTES_END\]/g,
        ""
      );
    }

    // User Pruning
    if (!selectedModules.includes("user")) {
      console.log(chalk.yellow("- Removing User module..."));
      rmSync(resolve(projectPath, "src/pages/UserDashboard"), {
        recursive: true,
        force: true,
      });
      rmSync(resolve(projectPath, "src/routes/UserRoutes.tsx"), {
        force: true,
      });
      routesContent = routesContent.replace(
        /\/\/ \[USER_MODULE_START\][\s\S]*?\/\/ \[USER_MODULE_END\]/g,
        ""
      );
      routesContent = routesContent.replace(
        /\/\/ \[USER_ROUTES_START\][\s\S]*?\/\/ \[USER_ROUTES_END\]/g,
        ""
      );
    }

    // Public Pruning (Refined)
    if (!selectedModules.includes("public")) {
      console.log(chalk.yellow("- Removing Public module..."));
      rmSync(resolve(projectPath, "src/pages/Public"), {
        recursive: true,
        force: true,
      });
      rmSync(resolve(projectPath, "src/routes/PublicRoutes.tsx"), {
        force: true,
      });
      routesContent = routesContent.replace(
        /\/\/ \[PUBLIC_MODULE_START\][\s\S]*?\/\/ \[PUBLIC_MODULE_END\]/g,
        ""
      );

      // Only remove the specific routes generator, keeping the / layout for Auth
      routesContent = routesContent.replace(
        /\/\/ \[PUBLIC_ROUTES_START\][\s\S]*?\/\/ \[PUBLIC_ROUTES_END\]/g,
        ""
      );

      // If Public is unselected, but others exist, we should redirect / to a dashboard
      if (selectedModules.includes("admin") || selectedModules.includes("user")) {
        const target = selectedModules.includes("admin") ? "/admin" : "/user";
        // Update the default redirect if root children are now only Auth
        routesContent = routesContent.replace(
            /path: "\/",\n\s*element: \([\s\S]*?\),\n\s*children: \[/,
            `path: "/",\n    element: (\n      <Suspense fallback={<div>Loading...</div>}>\n        <App />\n      </Suspense>\n    ),\n    children: [\n      { index: true, element: <Navigate to="${target}" replace /> },`
        );
        if (!routesContent.includes("Navigate")) {
          routesContent = routesContent.replace(
            /import { createBrowserRouter }/,
            "import { createBrowserRouter, Navigate }"
          );
        }
      }
    }

    // Final cleanup: Remove all remaining structural markers
    routesContent = routesContent.replace(/\/\/ \[[A-Z_]+\]\n?/g, "");

    writeFileSync(routesPath, routesContent);
  }

  // 2. Package.json Cleanup
  const packageJsonPath = resolve(projectPath, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

  delete packageJson.bin;
  delete packageJson.files;
  delete packageJson.repository;
  delete packageJson.bugs;
  delete packageJson.homepage;

  const cliDeps = ["giget", "prompts", "chalk", "validate-npm-package-name"];
  cliDeps.forEach((dep) => {
    if (packageJson.dependencies && packageJson.dependencies[dep])
      delete packageJson.dependencies[dep];
    if (packageJson.devDependencies && packageJson.devDependencies[dep])
      delete packageJson.devDependencies[dep];
  });

  packageJson.name = appName;
  packageJson.version = "0.1.0";
  packageJson.description = "";

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // 3. Remove CLI-specific folders
  const binPath = resolve(projectPath, "bin");
  if (existsSync(binPath)) {
    rmSync(binPath, { recursive: true, force: true });
  }

  // Install dependencies
  console.log(chalk.blue("Installing dependencies..."));

  const installResult = spawnSync("npm", ["install"], {
    cwd: projectPath,
    stdio: "inherit",
    shell: true,
  });

  if (installResult.status !== 0) {
    console.error(chalk.red("Failed to install dependencies."));
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