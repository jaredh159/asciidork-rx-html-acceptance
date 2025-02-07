#!/usr/bin/env node

const fs = require(`node:fs`);
const path = require(`node:path`);
const { execSync } = require(`node:child_process`);

/**
 * @param {string} dir - The starting directory to walk.
 */
function processAdocFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullpath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processAdocFiles(fullpath);
    } else if (entry.isFile() && entry.name.endsWith(`.adoc`)) {
      const adocPath = fullpath;
      const htmlPath = fullpath.replace(/input\.adoc$/, `output.html`);

      process.stdout.write(`Checking ${fullpath}...\n`);
      try {
        // test w/ windows line endings
        // execSync(`/usr/bin/perl -i -pe 's/\\n/\\r\\n/' ${adocPath}`);
        const html = execSync(
          `/Users/jared/jaredh159/asciidork/target/debug/asciidork -i ${adocPath} -s unsafe -e`,
          { encoding: `utf8` }
        );
        fs.writeFileSync(htmlPath, html, { encoding: `utf8` });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to process ${fullpath}:`, error.message);
      }
    }
  }
}

processAdocFiles(__dirname);

execSync(`prettier --write ${__dirname}/**/*.html`, { encoding: `utf8` });
