#!/usr/bin/env node
// @ts-check

const fs = require(`node:fs`);
const path = require(`node:path`);
const { execSync } = require(`node:child_process`);

/**
 * @param {string} dir - The starting directory to walk.
 * @param {string} bin - The path to the asciidork binary.
 * @param {boolean} verbose - Whether to output verbose messages.
 */
function processAdocFiles(dir, bin, verbose) {
  const backends = [`dr-html`, `html5`];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullpath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processAdocFiles(fullpath, bin, verbose);
    } else if (entry.isFile() && entry.name.endsWith(`.adoc`)) {
      const adocPath = fullpath;

      for (const backend of backends) {
        const htmlPath = fullpath.replace(
          /input\.adoc$/,
          `output.${backend}.html`
        );

        if (verbose) {
          process.stdout.write(`Checking ${fullpath} [${backend}]...\n`);
        }
        try {
          const html = execSync(
            `${bin} -i ${adocPath} -s unsafe -e -f ${backend}`,
            { encoding: `utf8` }
          );
          fs.writeFileSync(htmlPath, html, { encoding: `utf8` });
        } catch (err) {
          process.stderr.write(
            `Failed to process ${fullpath} [${backend}]: ${err.message}\n`
          );
        }
      }
    }
  }
}

const verbose = process.argv.includes(`--verbose`);
const asciidorkBin = process.argv[2];
if (!asciidorkBin) {
  process.stderr.write(`asciidork binary path not passed\n`);
  process.exit(1);
}

processAdocFiles(`${__dirname}/tests`, asciidorkBin, verbose);

execSync(
  `${__dirname}/node_modules/.bin/prettier --write ${__dirname}/**/*.html`,
  { encoding: `utf8` }
);

const gitStatus = execSync(`git status --porcelain tests`, {
  cwd: __dirname,
  encoding: `utf8`,
});

process.exit(gitStatus.length === 0 ? 0 : 1);
