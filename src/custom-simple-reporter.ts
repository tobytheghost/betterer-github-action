"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reporter = void 0;

let os;
let fs;
let githubCore;
try {
  os = require("os");
  fs = require("fs");
  githubCore = require("@actions/core");
} catch (e) {}

function setOutput(key, value) {
  // Temporary hack until core actions library catches up with github new recommendations
  const output = process.env["GITHUB_OUTPUT"];
  fs.appendFileSync(output, `${key}=${value}${os.EOL}`);
}

const projectName = process.env.INPUT_PROJECT_NAME || process.env.PROJECT_NAME;
const chatopsResultsFileUpdateCommand =
  process.env.INPUT_CHATOPS_RESULTS_FILE_UPDATE_COMMAND ||
  process.env.INPUT_CHATOPS_RESULTS_FILE_UPDATE_COMMAND;
const bettererConfigFilePath =
  process.env.INPUT_BETTERER_CONFIG_FILE_PATH ||
  process.env.INPUT_BETTERER_CONFIG_FILE_PATH;
const bettererResultsFileName =
  process.env.INPUT_BETTERER_RESULTS_FILE_NAME ||
  process.env.INPUT_BETTERER_RESULTS_FILE_NAME;
const bettererResultsFilePath =
  process.env.INPUT_BETTERER_RESULTS_FILE_PATH ||
  process.env.INPUT_BETTERER_RESULTS_FILE_PATH;

function good(message: string) {
  return `\x1b[32m\-\x1b[0m ${message}`;
}

function bad(message: string) {
  return `\x1b[31m\+\x1b[0m ${message}`;
}

function log(message: string) {
  console.log(message);
}

function bright(message: string) {
  return `\x1b[1m${message}\x1b[0m\x1b[49m\x1b[39m`;
}

function green(message: string) {
  return `\x1b[32m${message}\x1b[0m\x1b[49m\x1b[39m`;
}

function brightGreen(message: string) {
  return `\x1b[1m\x1b[32m${message}\x1b[0m\x1b[49m\x1b[39m`;
}

function red(message: string) {
  return `\x1b[31m${message}\x1b[0m\x1b[49m\x1b[39m`;
}

function brightRed(message: string) {
  return `\x1b[1m\x1b[31m${message}\x1b[0m\x1b[49m\x1b[39m`;
}

function brightYellow(message: string) {
  return `\x1b[1m\x1b[33m${message}\x1b[0m\x1b[49m\x1b[39m`;
}

exports.reporter = createReporter();

function createReporter() {
  const RENDER_OPTIONS = {
    debug: process.env.NODE_ENV === "test",
  };
  let renderer;
  return {
    configError(_, error) {
      renderError(error);
    },
    async contextStart(context) {
      new Promise((resolve) => resolve(true));
    },
    async contextEnd(contextSummary) {
      new Promise((resolve) => resolve(true));
    },
    contextError(_, error) {
      console.error(JSON.stringify(error, null, 2));
      new Promise((resolve) => resolve(true));
    },
    suiteStart(suite) {
      return new Promise((resolve) => {
        resolve(true);
      });
    },
    suiteEnd(suiteSummary) {
      // console.log(JSON.stringify(suiteSummary, null, 2))
      let currentProblemTestName;
      let isOnlyBetter;
      let deltaDiff;
      const changesSummaryList = {
        fixed: [],
        new: [],
        existing: [],
      };

      if (suiteSummary) {
        if (suiteSummary.runSummaries && suiteSummary.runSummaries.length > 0) {
          suiteSummary.runSummaries.forEach((run) => {
            try {
              deltaDiff = run.delta.diff;
            } catch (e) {}

            const shouldReportItIsOnlyBetter =
              run.isBetter && !run.isWorse && !run.isNew;

            if (shouldReportItIsOnlyBetter) {
              isOnlyBetter = true;
            }

            if (run.diff) {
              const { diff } = run.diff;
              for (const [filePath, changeSummary] of Object.entries(diff)) {
                for (const [reportType, changes] of Object.entries(
                  changeSummary
                )) {
                  if (changes && changes.length > 0) {
                    changes.forEach((change) => {
                      changesSummaryList[reportType].push({
                        testName: run.name,
                        filePath: filePath,
                        lineNumber: change[0],
                        startColumnNumber: change[1],
                        endColumnNumber: change[2],
                        errorMessage: change[3],
                        something: change[4],
                      });
                    });
                  }
                }
              }
            }
          });
        }
      }
      let fixedIssuesCount = changesSummaryList.fixed.length || 0;
      const newIssuesCount = changesSummaryList.new.length || 0;

      const totalIssuesCount = changesSummaryList.existing.length || 0;

      if (isOnlyBetter && deltaDiff < 0) {
        fixedIssuesCount = Math.abs(deltaDiff);
      }

      const hasFixed = fixedIssuesCount;
      const hasNew = newIssuesCount;

      try {
        setOutput("fixed_issues_count", fixedIssuesCount);
        setOutput("new_issues_count", newIssuesCount);
        setOutput("total_issues_count", totalIssuesCount);

        console.log("fixed_issues_count", fixedIssuesCount);
        console.log("new_issues_count", newIssuesCount);
        console.log("total_issues_count", totalIssuesCount);
      } catch (e) {
        console.error(e);
      }

      log(" ");
      log(bright(`✅ Fixed issues ( ${fixedIssuesCount} )`));
      log("");

      const fixedResults = changesSummaryList.fixed.map((problem, index) => {
        if (problem.testName !== currentProblemTestName) {
          currentProblemTestName = problem.testName;
        }
        log(brightGreen(`    ${index + 1}: ${problem.errorMessage}`));
        log(green(`          ${problem.filePath}:${problem.lineNumber}`));
        log("");

        return `    ${index + 1}: ${problem.errorMessage}\n          ${
          problem.filePath
        }:${problem.lineNumber}\n`;
      });

      try {
        setOutput("fixed_issues", fixedResults.join("\n"));
        console.log("fixed_issues", fixedResults.join("\n"));
      } catch (e) {
        console.error(e);
      }

      currentProblemTestName = null;

      log(bright(`🔥 New issues ( ${newIssuesCount} )`));
      log("");

      const newIssues = changesSummaryList.new.map((problem, index) => {
        if (problem.testName !== currentProblemTestName) {
          currentProblemTestName = problem.testName;
        }
        log(brightRed(`    ${index + 1}: ${problem.errorMessage}`));
        log(red(`          ${problem.filePath}:${problem.lineNumber}`));
        log("");

        return `    ${index + 1}: ${problem.errorMessage}\n          ${
          problem.filePath
        }:${problem.lineNumber}\n`;
      });

      try {
        setOutput("new_issues", newIssues.join("\n"));
        console.log("new_issues", newIssues.join("\n"));
      } catch (e) {
        console.error(e);
      }

      if (hasFixed || hasNew) log(bright(`RESULTS`));

      log(
        good(brightGreen(`✅ You have fixed \`${fixedIssuesCount}\` issues!`))
      );
      log(
        bad(brightRed(`🔥 You have added \`${newIssuesCount}\` issues!\n\n`))
      );

      log(
        `🛠 Config file with TypeScript rule overrides: ` +
          brightYellow(`"${bettererConfigFilePath}"\n\n`)
      );

      if (hasNew) {
        log(bright(`READ THIS CAREFULLY `));
        log(
          red(
            `We are trying to migrate to strict TypeScript to dramatically reduce amount of issues we ship with our code. To achieve this goal we need to keep our better every day. Please take this into account and try to fix the TypeScript issues you have added now.`
          )
        );

        log(bright(`WHAT CAN I DO NOW?`));
        log(brightRed(`\n🔷 Case: You can fix issues`));
        log(
          red(
            `Use the list above, and go back to code and fix the detected issues.`
          )
        );
        log(brightRed(`\n🔷 Case: You don't have time to fix issues`));
        log(
          red(
            `If however you do not have time right now to fix those issues, you can regenerate `
          ) +
            brightYellow(`"${bettererResultsFilePath}"`) +
            red(
              ` file to include your newly introduced errors, and make Betterer check green.`
            )
        );
        log(
          red(`To do that, add `) +
            brightYellow(`"${chatopsResultsFileUpdateCommand}"`) +
            red(
              ` comment in your Pull Request, and CI bot will update the results file, commit it to your PR, and notify you. \n`
            )
        );
      }
      if (hasFixed && !hasNew) {
        log(bright(`WHAT I HAVE TO DO NOW?`));
        log(brightRed(`\n🔷 Case: Betterer results file needs to be updated`));
        log(
          red(`Please update the `) +
            brightYellow(`"${bettererResultsFilePath}"`) +
            red(` file to save state of good changes\n`)
        );
        log(
          red(
            `Every time there are good or bad changes detected, it is necessary to update `
          ) +
            brightYellow(`"${bettererResultsFilePath}"`) +
            red(` file so that this new state is saved to repository.\n`)
        );
        log(
          red(`To do that, add `) +
            brightYellow(`"${chatopsResultsFileUpdateCommand}"`) +
            red(
              ` comment in your Pull Request, and CI bot will update the results file, commit it to your PR, and notify you. \n`
            )
        );
      }

      return new Promise((resolve) => resolve(true));
    },
  };

  function renderError(error) {
    console.error(JSON.stringify(error, null, 2));
  }
}
