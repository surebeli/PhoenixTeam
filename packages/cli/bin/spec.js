#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const {
  parseCollaborators,
  parseDecisions,
  parseDivergences,
  parseIndex,
  parseSignals,
  parseThesis,
  validate,
} = require('@specteam/schema');

const pkg = require('../package.json');

const SPEC_DIR = path.join(process.cwd(), '.spec');
const DIVERGENCES_FILE = path.join(SPEC_DIR, 'DIVERGENCES.md');

const VALIDATION_TARGETS = [
  { fileName: 'COLLABORATORS.md', entityType: 'collaborator', parser: parseCollaborators },
  { fileName: 'DIVERGENCES.md', entityType: 'divergence', parser: parseDivergences },
  { fileName: 'SIGNALS.md', entityType: 'signal', parser: parseSignals },
  { fileName: 'THESIS.md', entityType: 'thesis', parser: parseThesis },
  { fileName: 'INDEX.md', entityType: 'index-doc', parser: parseIndex },
];

// Resolve the skills directory in both packaged (npm install) and repo-dev layouts.
function resolveSkillsDir() {
  const candidates = [
    path.resolve(__dirname, '..', 'skills'),             // packaged via prepack
    path.resolve(__dirname, '..', '..', 'plugin', 'skills') // repo checkout
  ];
  return candidates.find((p) => fs.existsSync(p));
}

program
  .name('spec')
  .description('Thin local CLI for SpecTeam spec review and decision alignment.')
  .version(pkg.version);

function runCmd(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch (e) {
    return null;
  }
}

function resolveValidationPath(inputPath) {
  return inputPath
    ? path.resolve(inputPath)
    : path.join(process.cwd(), '.spec');
}

function formatValidationFile(targetDir, filePath) {
  const relativePath = path.relative(targetDir, filePath).replace(/\\/g, '/');
  return relativePath || path.basename(filePath);
}

function collectValidationTargets(targetDir) {
  const targets = [];

  for (const target of VALIDATION_TARGETS) {
    const filePath = path.join(targetDir, target.fileName);
    if (fs.existsSync(filePath)) {
      targets.push({
        filePath,
        entityType: target.entityType,
        parser: target.parser,
      });
    }
  }

  const decisionsDir = path.join(targetDir, 'decisions');
  if (fs.existsSync(decisionsDir) && fs.statSync(decisionsDir).isDirectory()) {
    const decisionFiles = fs.readdirSync(decisionsDir)
      .filter((fileName) => fileName.endsWith('.md'))
      .sort();

    for (const fileName of decisionFiles) {
      targets.push({
        filePath: path.join(decisionsDir, fileName),
        entityType: 'decision',
        parser: parseDecisions,
      });
    }
  }

  return targets;
}

function isEmptyDivergenceRegistry(text) {
  return !/^###\s+D-\d{3}:/m.test(text)
    && /_\(No unresolved divergences\)_/m.test(text)
    && /_\(No proposed divergences\)_/m.test(text)
    && /_\(No resolved divergences\)_/m.test(text);
}

function buildValidationReport(targetDir) {
  const report = {
    targetPath: targetDir,
    results: [],
    summary: {
      passed: 0,
      failed: 0,
    },
  };

  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    report.results.push({
      file: targetDir,
      entityType: null,
      ok: false,
      errors: [
        {
          code: 'PX-E003',
          path: '/',
          message: `Validation target not found: ${targetDir}`,
        },
      ],
    });
    report.summary.failed = 1;
    return report;
  }

  const validationTargets = collectValidationTargets(targetDir);
  for (const target of validationTargets) {
    const relativeFile = formatValidationFile(targetDir, target.filePath);
    const text = fs.readFileSync(target.filePath, 'utf8');

    if (target.entityType === 'divergence' && isEmptyDivergenceRegistry(text)) {
      report.results.push({
        file: relativeFile,
        entityType: target.entityType,
        ok: true,
        errors: [],
      });
      report.summary.passed += 1;
      continue;
    }

    const parsed = target.parser(text);
    if (!parsed.ok) {
      report.results.push({
        file: relativeFile,
        entityType: target.entityType,
        ok: false,
        errors: parsed.errors,
      });
      report.summary.failed += 1;
      continue;
    }

    const validated = validate(target.entityType, parsed.value);
    if (!validated.ok) {
      report.results.push({
        file: relativeFile,
        entityType: target.entityType,
        ok: false,
        errors: validated.errors,
      });
      report.summary.failed += 1;
      continue;
    }

    report.results.push({
      file: relativeFile,
      entityType: target.entityType,
      ok: true,
      errors: [],
    });
    report.summary.passed += 1;
  }

  return report;
}

function printHumanValidationReport(report) {
  for (const result of report.results) {
    if (result.ok) {
      console.log(chalk.green(`PASS ${result.file}`));
      continue;
    }

    console.log(chalk.red(`FAIL ${result.file}`));
    for (const error of result.errors) {
      const location = error.line !== undefined
        ? `${error.line}:${error.column}`
        : (error.path || '/');
      console.log(`  [${error.code}] ${location} ${error.message}`);
    }
  }

  console.log(`Summary: ${report.summary.passed} passed, ${report.summary.failed} failed`);
}

// 1. Install Command
program
  .command('install')
  .description('Install SpecTeam prompt skills as slash commands for your AI tool')
  .option('-g, --global', 'Install globally to ~/.claude/commands')
  .action((options) => {
    console.log(chalk.cyan('🚀 Installing SpecTeam workflow skills...'));
    const sourceDir = resolveSkillsDir();

    if (!sourceDir) {
      console.log(chalk.red('❌ Could not locate skills directory. Reinstall specteam-cli or run from the repo root.'));
      process.exit(1);
    }

    const targetBaseDir = options.global
      ? path.join(require('os').homedir(), '.claude/commands')
      : path.join(process.cwd(), '.claude/commands');

    if (!fs.existsSync(targetBaseDir)) {
      fs.mkdirSync(targetBaseDir, { recursive: true });
    }

    const skills = fs.readdirSync(sourceDir).filter((f) =>
      fs.statSync(path.join(sourceDir, f)).isDirectory()
    );
    let count = 0;

    for (const skill of skills) {
      const skillFile = path.join(sourceDir, skill, 'SKILL.md');
      if (fs.existsSync(skillFile)) {
        const destFile = path.join(targetBaseDir, `${skill}.md`);
        fs.copyFileSync(skillFile, destFile);
        count++;
      }
    }

    console.log(chalk.green(`✅ Installed ${count} skills to ${targetBaseDir}`));
    console.log(chalk.yellow(`\nYou can now run e.g. '/spec-status' in Claude Code.`));
  });

// 2. Local Status UI Command
program
  .command('status')
  .description('Render a token-free local summary of DIVERGENCES and repo state')
  .action(() => {
    console.log(chalk.cyan('\n=== SpecTeam Workflow Status ===\n'));

    const gitStatus = runCmd('git status --short');
    if (gitStatus === null) {
      console.log(chalk.red('❌ Not a git repository. SpecTeam requires Git.'));
      process.exit(1);
    }

    const branch = runCmd('git branch --show-current');
    const memberCode = runCmd('git config spec.member-code') || chalk.gray('(Not bound - run /spec-whoami)');

    console.log(`${chalk.bold('Identity:')} ${memberCode}`);
    console.log(`${chalk.bold('Branch:')}   ${chalk.green(branch)}`);
    console.log('');

    if (!fs.existsSync(SPEC_DIR)) {
      console.log(chalk.yellow('⚠️ .spec/ directory not found. Run /spec-init in your AI assistant.'));
      return;
    }

    if (!fs.existsSync(DIVERGENCES_FILE)) {
      console.log(chalk.green('✅ No DIVERGENCES.md found. No tracked divergences yet.'));
      return;
    }

    const divergencesContent = fs.readFileSync(DIVERGENCES_FILE, 'utf-8');
    const openMatches = divergencesContent.match(/### (D-\d+):.*?🔴/g) || [];
    const proposedMatches = divergencesContent.match(/### (D-\d+):.*?🟡/g) || [];
    const resolvedMatches = divergencesContent.match(/### (D-\d+):.*?✅/g) || [];

    console.log(chalk.bold('📊 Divergence Summary:'));
    console.log(`  🔴 Open:     ${chalk.red(openMatches.length)}`);
    console.log(`  🟡 Proposed: ${chalk.yellow(proposedMatches.length)}`);
    console.log(`  ✅ Resolved: ${chalk.green(resolvedMatches.length)}`);
    console.log('');

    if (openMatches.length > 0 || proposedMatches.length > 0) {
      console.log(chalk.yellow('💡 Tip: Ask your AI assistant to run /spec-align to resolve open items.'));
    }
  });

// 3. SOS Command (Conflict Detection)
program
  .command('sos')
  .description('Detect Git merge conflicts and hand off to /spec-sos')
  .action(() => {
    const gitStatus = runCmd('git status --porcelain');
    if (gitStatus === null) {
      console.log(chalk.red('❌ Not a git repository.'));
      process.exit(1);
    }

    const lines = gitStatus.split('\n');
    const conflictedFiles = lines.filter((line) =>
      line.startsWith('UU') || line.startsWith('AA') || line.startsWith('DD')
    );

    if (conflictedFiles.length === 0) {
      console.log(chalk.green('✅ Git tree is clean. No merge conflicts detected.'));
      return;
    }

    console.log(chalk.red.bold('🚨 GIT MERGE CONFLICT DETECTED 🚨\n'));
    console.log(chalk.white('The following files are in a conflicted state:'));
    conflictedFiles.forEach((file) => console.log(chalk.red(`  ${file}`)));

    console.log(chalk.yellow('\n⚠️  Do not resolve .spec/ metadata manually.'));
    console.log(chalk.cyan('Open your AI assistant (e.g., Claude Code) and run:'));
    console.log(chalk.white.bold('\n    /spec-sos\n'));
    console.log(chalk.cyan('The AI will parse the markers and merge state safely.'));
  });

// 4. Init Command (Scaffold)
program
  .command('init')
  .description('Scaffold .spec/ and hand off to /spec-init in your AI assistant')
  .action(() => {
    console.log(chalk.cyan('🚀 Preparing SpecTeam workflow environment...'));

    const isGit = runCmd('git rev-parse --is-inside-work-tree');
    if (!isGit) {
      console.log(chalk.yellow('Git repository not found. Initializing...'));
      runCmd('git init');
      console.log(chalk.green('✅ Initialized empty Git repository.'));
    } else {
      console.log(chalk.green('✅ Git repository detected.'));
    }

    if (!fs.existsSync(SPEC_DIR)) {
      fs.mkdirSync(SPEC_DIR, { recursive: true });
      console.log(chalk.green('✅ Created .spec/ directory.'));
    }

    console.log(chalk.magenta('\n✨ Environment ready. Open your AI assistant and run:'));
    console.log(chalk.white.bold('\n    /spec-init\n'));
  });

program
  .command('validate')
  .description('Validate deterministic .spec markdown files with @specteam/schema')
  .option('--path <dir>', 'Validate a specific .spec directory instead of the current working directory/.spec')
  .option('--json', 'Emit machine-readable JSON instead of the human summary')
  .action((options) => {
    const targetDir = resolveValidationPath(options.path);
    const report = buildValidationReport(targetDir);

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printHumanValidationReport(report);
    }

    process.exit(report.summary.failed > 0 ? 1 : 0);
  });

program.parse(process.argv);
