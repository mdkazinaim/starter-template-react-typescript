#!/usr/bin/env node

import { spawn, spawnSync } from "child_process";
import { existsSync, rmSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { resolve, basename } from "path";
import chalk from "chalk";
import prompts from "prompts";
import { downloadTemplate } from "giget";
import validateNpmName from "validate-npm-package-name";

import gradient from "gradient-string";
import ora from "ora";
import cliProgress from "cli-progress";

// Helper for smoother UI transitions
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  console.clear();
  console.log("");
  console.log(
    gradient.pastel.multiline(
      `
   ██████╗██████╗ ███████╗ █████╗ ████████╗███████╗      ██████╗  ██████╗████████╗
  ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔════╝      ██╔══██╗██╔════╝╚══██╔══╝
  ██║     ██████╔╝█████╗  ███████║   ██║   █████╗        ██████╔╝╚█████╗    ██║   
  ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██╔══╝        ██╔══██╗ ╚═══██╗   ██║   
  ╚██████╗██║  ██║███████╗██║  ██║   ██║   ███████╗      ██║  ██║██████╔╝   ██║   
   ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝      ╚═╝  ╚═╝╚═════╝    ╚═╝   
      React + TypeScript Starter Pack CLI
      `
    )
  );

  let projectName = process.argv[2];
  let selectedModules = ["public", "admin", "user"];

  const response = await prompts([
    {
      type: projectName ? null : "text",
      name: "projectName",
      message: chalk.cyan("What is the name of your project?"),
      initial: "my-rst-app",
      validate: (value) => {
        if (value === ".") return true;
        const validation = validateNpmName(basename(resolve(value)));
        if (!validation.validForNewPackages) {
          return `Invalid project name: ${
            validation.errors ? validation.errors.join(", ") : ""
          } ${validation.warnings ? validation.warnings.join(", ") : ""}`;
        }
        return true;
      },
    },
    {
      type: "select",
      name: "modules",
      message: chalk.cyan("Which version of the template do you want?"),
      choices: [
        {
          title: "Full Template (Public + Admin + User)",
          value: ["public", "admin", "user"],
        },
        { title: "Public + Admin Dashboard", value: ["public", "admin"] },
        { title: "Admin + User Dashboard", value: ["admin", "user"] },
        { title: "Public Pages Only", value: ["public"] },
        { title: "Admin Dashboard Only", value: ["admin"] },
      ],
      initial: 0,
    },
  ]);

  projectName = projectName || response.projectName;
  selectedModules = response.modules || selectedModules;

  if (!projectName) {
    console.log(chalk.red("\n✖ Operation cancelled\n"));
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
      console.log("");
      const { overwrite } = await prompts({
        type: "confirm",
        name: "overwrite",
        message: chalk.yellow(
          `⚠ Target directory "${appName}" is not empty. Remove existing files?`
        ),
      });

      if (!overwrite) {
        console.log(chalk.red("\n✖ Operation cancelled\n"));
        process.exit(1);
      }
      rmSync(projectPath, { recursive: true, force: true });
    }
  }

  console.log("");
  console.log(chalk.cyan(`🚀 Creating your React app in ${projectPath}...`));

  // Progress Bar for overall process
  const progressBar = new cliProgress.SingleBar(
    {
      format:
        chalk.cyan("  {bar}") + " {percentage}% | {task}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic
  );

  progressBar.start(100, 0, { task: "Initializing download..." });

  // Download template using giget
  try {
    await downloadTemplate(
      "github:mdkazinaim/starter-template-react-typescript",
      {
        dir: projectPath,
        force: true,
      }
    );
    progressBar.update(20, { task: "Template downloaded." });
    await sleep(300);
  } catch (error) {
    progressBar.stop();
    console.error(chalk.red("\n✖ Failed to download template: " + error.message));
    process.exit(1);
  }

  // 1. Module Pruning Logic
  const routesPath = resolve(projectPath, "src/routes/Routes.tsx");
  if (existsSync(routesPath)) {
    let routesContent = readFileSync(routesPath, "utf-8");

    progressBar.update(35, { task: "Configuring Admin module..." });
    await sleep(200);
    // Admin Pruning
    if (!selectedModules.includes("admin")) {
      rmSync(resolve(projectPath, "src/pages/Admin"), {
        recursive: true,
        force: true,
      });
      rmSync(resolve(projectPath, "src/routes/AdminRoutes.tsx"), {
        force: true,
      });
      rmSync(resolve(projectPath, "src/common/Skeleton/Admin"), {
        recursive: true,
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

    progressBar.update(50, { task: "Configuring User module..." });
    await sleep(200);
    // User Pruning
    if (!selectedModules.includes("user")) {
      rmSync(resolve(projectPath, "src/pages/UserDashboard"), {
        recursive: true,
        force: true,
      });
      rmSync(resolve(projectPath, "src/routes/UserRoutes.tsx"), {
        force: true,
      });
      rmSync(resolve(projectPath, "src/common/Skeleton/User"), {
        recursive: true,
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

    progressBar.update(65, { task: "Configuring Public module..." });
    await sleep(200);
    // Public Pruning (Refined)
    if (!selectedModules.includes("public")) {
      rmSync(resolve(projectPath, "src/pages/Public"), {
        recursive: true,
        force: true,
      });
      rmSync(resolve(projectPath, "src/routes/PublicRoutes.tsx"), {
        force: true,
      });
      rmSync(resolve(projectPath, "src/common/Skeleton/Public"), {
        recursive: true,
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
      if (
        selectedModules.includes("admin") ||
        selectedModules.includes("user")
      ) {
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

    progressBar.update(80, { task: "Cleaning up source code..." });
    await sleep(200);
    // Final cleanup: Remove all remaining structural markers
    routesContent = routesContent.replace(/\/\/ \[[A-Z_]+\]\n?/g, "");

    writeFileSync(routesPath, routesContent);
  }

  // 1.5 Replace App Name placeholders
  progressBar.update(85, { task: "Customizing application name..." });
  const filesToUpdate = [
    "index.html",
    "src/Layout/PublicLayout/Navbar.tsx",
    "src/Layout/DashboardLayout/Sidebar.tsx",
  ];

  filesToUpdate.forEach((file) => {
    const filePath = resolve(projectPath, file);
    if (existsSync(filePath)) {
      let content = readFileSync(filePath, "utf-8");
      content = content.replace(/REACT STARTER TEMPLATE/g, appName);
      writeFileSync(filePath, content);
    }
  });

  progressBar.update(90, { task: "Finalizing package.json..." });
  await sleep(200);

  // 2. Package.json Cleanup
  const packageJsonPath = resolve(projectPath, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

  delete packageJson.bin;
  delete packageJson.files;
  delete packageJson.repository;
  delete packageJson.bugs;
  delete packageJson.homepage;

  const cliDeps = [
    "giget",
    "prompts",
    "chalk",
    "validate-npm-package-name",
    "gradient-string",
    "ora",
    "cli-progress",
  ];
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

  progressBar.update(100, { task: "Configuration complete." });
  await sleep(400);
  progressBar.stop();

  // Install dependencies
  console.log("");
  const installBar = new cliProgress.SingleBar(
    {
      format: chalk.cyan("  {bar}") + " {percentage}% | {task}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic
  );

  installBar.start(100, 0, { task: "Preparing installation..." });

  // Simulated progress for npm install (since npm doesn't provide a steady stream)
  let progress = 0;
  const progressInterval = setInterval(() => {
    if (progress < 40) progress += 2;
    else if (progress < 70) progress += 1;
    else if (progress < 95) progress += 0.5;
    
    const task = progress < 30 ? "Downloading packages..." : 
                 progress < 70 ? "Linking dependencies..." : 
                 "Building modules...";
    
    installBar.update(Math.floor(progress), { task });
  }, 800);

  // Async install function to allow progress bar to animate
  const installDeps = () => {
    return new Promise((resolve) => {
      const child = spawn("npm", ["install"], {
        cwd: projectPath,
        stdio: "ignore",
        shell: true,
      });

      child.on("close", (code) => {
        resolve(code);
      });
    });
  };

  const exitCode = await installDeps();

  clearInterval(progressInterval);

  if (exitCode !== 0) {
    installBar.stop();
    console.log(chalk.red("\n✖ Failed to install dependencies. Try running 'npm install' manually.\n"));
  } else {
    installBar.update(100, { task: "Dependencies installed!" });
    installBar.stop();
    console.log(chalk.green("\n✨ Dependencies installed successfully."));
  }

  // Success Message
  console.log("");
  console.log(
    gradient.morning.multiline(
      `
   🎉 SUCCESS!
   🚀 Your project ${appName} is ready.
      `
    )
  );

  console.log(chalk.gray("  Inside that directory, you can run:\n"));
  console.log(chalk.cyan(`    npm run dev`));
  console.log("      Starts the development server.\n");
  console.log(chalk.cyan(`    npm run build`));
  console.log("      Bundles the app for production.\n");

  console.log(chalk.yellow("  We suggest that you begin by typing:\n"));
  if (!isCurrentDir) {
    console.log(chalk.white(`    cd ${projectName}`));
  }
  console.log(chalk.white(`    npm run dev`));
  console.log("");
};
run().catch((err) => {
  console.error(chalk.red("Unexpected error:"), err);
  process.exit(1);
});