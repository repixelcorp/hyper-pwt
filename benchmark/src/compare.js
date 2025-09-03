import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import Table from 'cli-table3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

class BuildComparator {
  constructor() {
    this.artifactsDir = path.join(rootDir, 'artifacts');
  }

  async compareFiles() {
    const standardDir = path.join(this.artifactsDir, 'standard', 'dist');
    const hyperDir = path.join(this.artifactsDir, 'hyper', 'dist');

    if (!await fs.pathExists(standardDir) || !await fs.pathExists(hyperDir)) {
      console.error(chalk.red('Build artifacts not found. Please run benchmark first.'));
      return;
    }

    const standardFiles = await this.getFileMap(standardDir);
    const hyperFiles = await this.getFileMap(hyperDir);

    const table = new Table({
      head: ['File', 'Standard Size', 'Hyper Size', 'Difference'],
      style: { head: ['cyan'] }
    });

    const allFiles = new Set([...Object.keys(standardFiles), ...Object.keys(hyperFiles)]);

    let totalStandard = 0;
    let totalHyper = 0;

    for (const file of allFiles) {
      const stdSize = standardFiles[file] || 0;
      const hyperSize = hyperFiles[file] || 0;
      const diff = hyperSize - stdSize;
      
      totalStandard += stdSize;
      totalHyper += hyperSize;

      if (stdSize === 0) {
        table.push([
          file,
          '-',
          this.formatBytes(hyperSize),
          chalk.yellow('New file')
        ]);
      } else if (hyperSize === 0) {
        table.push([
          file,
          this.formatBytes(stdSize),
          '-',
          chalk.red('Removed')
        ]);
      } else {
        const percentage = ((diff / stdSize) * 100).toFixed(1);
        const diffStr = diff > 0 
          ? chalk.red(`+${this.formatBytes(diff)} (+${percentage}%)`)
          : diff < 0 
            ? chalk.green(`${this.formatBytes(diff)} (${percentage}%)`)
            : chalk.gray('No change');
        
        table.push([
          file,
          this.formatBytes(stdSize),
          this.formatBytes(hyperSize),
          diffStr
        ]);
      }
    }

    // Add total row
    table.push([
      chalk.bold('TOTAL'),
      chalk.bold(this.formatBytes(totalStandard)),
      chalk.bold(this.formatBytes(totalHyper)),
      chalk.bold(this.formatDifference(totalHyper - totalStandard, totalStandard))
    ]);

    console.log('\n' + chalk.bold.cyan('=== File Size Comparison ===\n'));
    console.log(table.toString());

    // Check for content differences
    await this.compareFileContents(standardFiles, hyperFiles, standardDir, hyperDir);
  }

  async compareFileContents(standardFiles, hyperFiles, standardDir, hyperDir) {
    const jsFiles = Object.keys(standardFiles).filter(f => f.endsWith('.js'));
    let identicalCount = 0;
    let differentCount = 0;

    for (const file of jsFiles) {
      if (hyperFiles[file]) {
        const stdContent = await fs.readFile(path.join(standardDir, file), 'utf8');
        const hyperContent = await fs.readFile(path.join(hyperDir, file), 'utf8');
        
        if (stdContent === hyperContent) {
          identicalCount++;
        } else {
          differentCount++;
        }
      }
    }

    console.log('\n' + chalk.bold('Content Analysis:'));
    console.log(`• ${identicalCount} files have identical content`);
    console.log(`• ${differentCount} files have different content`);
  }

  async getFileMap(dir, basePath = '') {
    const files = {};
    const items = await fs.readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        const subFiles = await this.getFileMap(fullPath, relativePath);
        Object.assign(files, subFiles);
      } else {
        files[relativePath] = stats.size;
      }
    }

    return files;
  }

  formatBytes(bytes) {
    const absBytes = Math.abs(bytes);
    if (absBytes < 1024) return `${bytes}B`;
    if (absBytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  }

  formatDifference(diff, original) {
    const percentage = ((diff / original) * 100).toFixed(1);
    if (diff > 0) {
      return chalk.red(`+${this.formatBytes(diff)} (+${percentage}%)`);
    } else if (diff < 0) {
      return chalk.green(`${this.formatBytes(diff)} (${percentage}%)`);
    }
    return chalk.gray('No change');
  }
}

// Run comparison
const comparator = new BuildComparator();
comparator.compareFiles();