import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import Table from "cli-table3";

const __filename =
  fileURLToPath(
    import.meta.url,
  );
const __dirname =
  path.dirname(
    __filename,
  );
const rootDir =
  path.join(
    __dirname,
    "..",
  );
const widgetDir =
  path.join(
    rootDir,
    "benchmarkWidget",
  );

class WidgetBuildBenchmark {
  constructor(
    options = {},
  ) {
    this.verbose =
      options.verbose ||
      process.argv.includes(
        "--verbose",
      );
    this.jsonOutput =
      options.json ||
      process.argv.includes(
        "--json",
      );
    this.results = {
      standardBuild:
        {},
      hyperBuild:
        {},
      comparison:
        {},
    };
  }

  log(
    message,
    type = "info",
  ) {
    if (
      this
        .jsonOutput
    )
      return;

    const prefix = {
      info: chalk.blue(
        "[INFO]",
      ),
      success:
        chalk.green(
          "[SUCCESS]",
        ),
      warning:
        chalk.yellow(
          "[WARNING]",
        ),
      error:
        chalk.red(
          "[ERROR]",
        ),
      debug:
        chalk.gray(
          "[DEBUG]",
        ),
    };

    console.log(
      `${prefix[type]} ${message}`,
    );
  }

  async clean() {
    this.log(
      "Cleaning previous build artifacts...",
    );
    const distPath =
      path.join(
        widgetDir,
        "dist",
      );
    const tmpPath =
      path.join(
        widgetDir,
        "tmp",
      );

    await fs.remove(
      distPath,
    );
    await fs.remove(
      tmpPath,
    );

    // Clean any .mpk files
    const files =
      await fs.readdir(
        widgetDir,
      );
    for (const file of files) {
      if (
        file.endsWith(
          ".mpk",
        )
      ) {
        await fs.remove(
          path.join(
            widgetDir,
            file,
          ),
        );
      }
    }
  }

  runBuild(
    command,
    buildType,
  ) {
    this.log(
      `Running ${buildType} build...`,
    );

    const startTime =
      Date.now();
    const startMemory =
      process.memoryUsage();

    try {
      const output =
        execSync(
          `npm run ${command}`,
          {
            cwd: widgetDir,
            stdio:
              this
                .verbose
                ? "inherit"
                : "pipe",
            encoding:
              "utf8",
          },
        );

      const endTime =
        Date.now();
      const endMemory =
        process.memoryUsage();

      const buildTime =
        endTime -
        startTime;
      const memoryUsed =
        (endMemory.heapUsed -
          startMemory.heapUsed) /
        1024 /
        1024;

      this.log(
        `${buildType} build completed in ${buildTime}ms`,
        "success",
      );

      return {
        success: true,
        buildTime,
        memoryUsed,
        output: this
          .verbose
          ? output
          : null,
      };
    } catch (error) {
      this.log(
        `${buildType} build failed: ${error.message}`,
        "error",
      );
      return {
        success: false,
        error:
          error.message,
      };
    }
  }

  async analyzeBuildOutput(
    buildType,
  ) {
    const distPath =
      path.join(
        widgetDir,
        "dist",
      );
    const distMpkPath =
      path.join(
        distPath,
        "1.0.0",
      );

    const analysis =
      {
        distSize: 0,
        fileCount: 0,
        files: [],
        mpkSize: 0,
      };

    // Analyze dist folder
    if (
      await fs.pathExists(
        distPath,
      )
    ) {
      const files =
        await this.getFilesRecursively(
          distPath,
        );
      analysis.fileCount =
        files.length;

      for (const file of files) {
        const stats =
          await fs.stat(
            file,
          );
        const relPath =
          path.relative(
            distPath,
            file,
          );
        analysis.files.push(
          {
            path: relPath,
            size: stats.size,
          },
        );
        analysis.distSize +=
          stats.size;
      }
    }

    // Find and analyze .mpk file
    const widgetFiles =
      await fs.readdir(
        distMpkPath,
      );
    const mpkFile =
      widgetFiles.find(
        (f) =>
          f.endsWith(
            ".mpk",
          ),
      );

    if (mpkFile) {
      const mpkPath =
        path.join(
          distMpkPath,
          mpkFile,
        );
      const stats =
        await fs.stat(
          mpkPath,
        );
      analysis.mpkSize =
        stats.size;
      analysis.mpkFile =
        mpkFile;
    }

    return analysis;
  }

  async getFilesRecursively(
    dir,
  ) {
    const files =
      [];
    const items =
      await fs.readdir(
        dir,
      );

    for (const item of items) {
      const fullPath =
        path.join(
          dir,
          item,
        );
      const stats =
        await fs.stat(
          fullPath,
        );

      if (
        stats.isDirectory()
      ) {
        files.push(
          ...(await this.getFilesRecursively(
            fullPath,
          )),
        );
      } else {
        files.push(
          fullPath,
        );
      }
    }

    return files;
  }

  async saveBuildArtifacts(
    buildType,
  ) {
    const artifactsDir =
      path.join(
        rootDir,
        "artifacts",
        buildType,
      );
    await fs.ensureDir(
      artifactsDir,
    );

    // Copy dist folder
    const distPath =
      path.join(
        widgetDir,
        "dist",
      );
    if (
      await fs.pathExists(
        distPath,
      )
    ) {
      await fs.copy(
        distPath,
        path.join(
          artifactsDir,
          "dist",
        ),
      );
    }

    // Copy .mpk file
    const widgetFiles =
      await fs.readdir(
        widgetDir,
      );
    const mpkFile =
      widgetFiles.find(
        (f) =>
          f.endsWith(
            ".mpk",
          ),
      );

    if (mpkFile) {
      await fs.copy(
        path.join(
          widgetDir,
          mpkFile,
        ),
        path.join(
          artifactsDir,
          mpkFile,
        ),
      );
    }
  }

  calculateComparison() {
    const std =
      this.results
        .standardBuild;
    const hyper =
      this.results
        .hyperBuild;

    if (
      !std.metrics ||
      !hyper.metrics
    ) {
      return null;
    }

    return {
      buildTime: {
        difference:
          hyper
            .metrics
            .buildTime -
          std
            .metrics
            .buildTime,
        percentage:
          (
            ((hyper
              .metrics
              .buildTime -
              std
                .metrics
                .buildTime) /
              std
                .metrics
                .buildTime) *
            100
          ).toFixed(
            2,
          ),
      },
      memoryUsage: {
        difference:
          hyper
            .metrics
            .memoryUsed -
          std
            .metrics
            .memoryUsed,
        percentage:
          (
            ((hyper
              .metrics
              .memoryUsed -
              std
                .metrics
                .memoryUsed) /
              std
                .metrics
                .memoryUsed) *
            100
          ).toFixed(
            2,
          ),
      },
      distSize: {
        difference:
          hyper
            .analysis
            .distSize -
          std
            .analysis
            .distSize,
        percentage:
          (
            ((hyper
              .analysis
              .distSize -
              std
                .analysis
                .distSize) /
              std
                .analysis
                .distSize) *
            100
          ).toFixed(
            2,
          ),
      },
      mpkSize: {
        difference:
          hyper
            .analysis
            .mpkSize -
          std
            .analysis
            .mpkSize,
        percentage:
          (
            ((hyper
              .analysis
              .mpkSize -
              std
                .analysis
                .mpkSize) /
              std
                .analysis
                .mpkSize) *
            100
          ).toFixed(
            2,
          ),
      },
      fileCount: {
        difference:
          hyper
            .analysis
            .fileCount -
          std
            .analysis
            .fileCount,
      },
    };
  }

  displayResults() {
    if (
      this
        .jsonOutput
    ) {
      console.log(
        JSON.stringify(
          this
            .results,
          null,
          2,
        ),
      );
      return;
    }

    console.log(
      "\n" +
        chalk.bold.cyan(
          "=== Build Benchmark Results ===\n",
        ),
    );

    // Build metrics table
    const metricsTable =
      new Table({
        head: [
          "Metric",
          "Standard Build",
          "Hyper Build",
          "Difference",
        ],
        style: {
          head: [
            "cyan",
          ],
        },
      });

    const std =
      this.results
        .standardBuild;
    const hyper =
      this.results
        .hyperBuild;
    const comp =
      this.results
        .comparison;

    if (
      std.metrics &&
      hyper.metrics &&
      comp
    ) {
      metricsTable.push(
        [
          "Build Time",
          `${std.metrics.buildTime}ms`,
          `${hyper.metrics.buildTime}ms`,
          this.formatDifference(
            comp
              .buildTime
              .difference,
            comp
              .buildTime
              .percentage,
            "ms",
          ),
        ],
        [
          "Memory Usage",
          `${std.metrics.memoryUsed.toFixed(2)}MB`,
          `${hyper.metrics.memoryUsed.toFixed(2)}MB`,
          this.formatDifference(
            comp
              .memoryUsage
              .difference,
            comp
              .memoryUsage
              .percentage,
            "MB",
          ),
        ],
        [
          "Dist Size",
          this.formatBytes(
            std
              .analysis
              .distSize,
          ),
          this.formatBytes(
            hyper
              .analysis
              .distSize,
          ),
          this.formatDifference(
            comp
              .distSize
              .difference,
            comp
              .distSize
              .percentage,
            "bytes",
            true,
          ),
        ],
        [
          "MPK Size",
          this.formatBytes(
            std
              .analysis
              .mpkSize,
          ),
          this.formatBytes(
            hyper
              .analysis
              .mpkSize,
          ),
          this.formatDifference(
            comp
              .mpkSize
              .difference,
            comp
              .mpkSize
              .percentage,
            "bytes",
            true,
          ),
        ],
        [
          "File Count",
          std
            .analysis
            .fileCount,
          hyper
            .analysis
            .fileCount,
          comp
            .fileCount
            .difference >
          0
            ? `+${comp.fileCount.difference}`
            : `${comp.fileCount.difference}`,
        ],
      );

      console.log(
        metricsTable.toString(),
      );

      // Summary
      console.log(
        "\n" +
          chalk.bold(
            "Summary:",
          ),
      );

      const buildTimeImproved =
        comp
          .buildTime
          .difference <
        0;
      const sizeImproved =
        comp.mpkSize
          .difference <
        0;

      if (
        buildTimeImproved
      ) {
        console.log(
          chalk.green(
            `✓ Hyper build is ${Math.abs(comp.buildTime.percentage)}% faster`,
          ),
        );
      } else {
        console.log(
          chalk.yellow(
            `⚠ Hyper build is ${comp.buildTime.percentage}% slower`,
          ),
        );
      }

      if (
        sizeImproved
      ) {
        console.log(
          chalk.green(
            `✓ Hyper build produces ${Math.abs(comp.mpkSize.percentage)}% smaller package`,
          ),
        );
      } else if (
        comp.mpkSize
          .difference >
        0
      ) {
        console.log(
          chalk.yellow(
            `⚠ Hyper build produces ${comp.mpkSize.percentage}% larger package`,
          ),
        );
      } else {
        console.log(
          chalk.blue(
            `• Package size is identical`,
          ),
        );
      }
    }
  }

  formatDifference(
    diff,
    percentage,
    unit,
    isBytes = false,
  ) {
    const value =
      isBytes
        ? this.formatBytes(
            Math.abs(
              diff,
            ),
          )
        : `${Math.abs(diff).toFixed(2)}${unit}`;
    const sign =
      diff > 0
        ? "+"
        : "-";
    const color =
      diff > 0
        ? chalk.red
        : chalk.green;

    return color(
      `${sign}${value} (${sign}${Math.abs(percentage)}%)`,
    );
  }

  formatBytes(
    bytes,
  ) {
    if (
      bytes < 1024
    )
      return `${bytes}B`;
    if (
      bytes <
      1024 * 1024
    )
      return `${(bytes / 1024).toFixed(2)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  }

  async run() {
    try {
      this.log(
        "Starting Widget Build Benchmark",
        "info",
      );
      this.log(
        `Widget directory: ${widgetDir}`,
        "debug",
      );

      // Install dependencies if needed
      if (
        !(await fs.pathExists(
          path.join(
            widgetDir,
            "node_modules",
          ),
        ))
      ) {
        this.log(
          "Installing widget dependencies...",
        );
        execSync(
          "npm install",
          {
            cwd: widgetDir,
            stdio:
              "inherit",
          },
        );
      }

      // Standard build
      this.log(
        "\n" +
          chalk.bold(
            "Phase 1: Standard Build",
          ),
        "info",
      );
      await this.clean();
      const standardMetrics =
        this.runBuild(
          "build",
          "Standard",
        );

      if (
        standardMetrics.success
      ) {
        const standardAnalysis =
          await this.analyzeBuildOutput(
            "standard",
          );
        await this.saveBuildArtifacts(
          "standard",
        );

        this.results.standardBuild =
          {
            metrics:
              standardMetrics,
            analysis:
              standardAnalysis,
          };
      } else {
        throw new Error(
          "Standard build failed",
        );
      }

      // Hyper build
      this.log(
        "\n" +
          chalk.bold(
            "Phase 2: Hyper Build",
          ),
        "info",
      );
      await this.clean();
      const hyperMetrics =
        this.runBuild(
          "build:hyper",
          "Hyper",
        );

      if (
        hyperMetrics.success
      ) {
        const hyperAnalysis =
          await this.analyzeBuildOutput(
            "hyper",
          );
        await this.saveBuildArtifacts(
          "hyper",
        );

        this.results.hyperBuild =
          {
            metrics:
              hyperMetrics,
            analysis:
              hyperAnalysis,
          };
      } else {
        throw new Error(
          "Hyper build failed",
        );
      }

      // Calculate comparison
      this.results.comparison =
        this.calculateComparison();

      // Save results
      const resultsPath =
        path.join(
          rootDir,
          "results",
          `benchmark-${Date.now()}.json`,
        );
      await fs.ensureDir(
        path.join(
          rootDir,
          "results",
        ),
      );
      await fs.writeJson(
        resultsPath,
        this
          .results,
        {
          spaces: 2,
        },
      );
      this.log(
        `Results saved to: ${resultsPath}`,
        "success",
      );

      // Display results
      this.displayResults();
    } catch (error) {
      this.log(
        `Benchmark failed: ${error.message}`,
        "error",
      );
      if (
        this.verbose
      ) {
        console.error(
          error,
        );
      }
      process.exit(
        1,
      );
    }
  }
}

// Run benchmark
const benchmark =
  new WidgetBuildBenchmark();
benchmark.run();
