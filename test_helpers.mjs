import { existsSync, readFile, writeFile } from "node:fs";
import { exec, execSync, spawnSync } from "node:child_process";
import { raw } from "express";

let proc;
const dir = "./irods_testing_environment";
export async function runTest(
  pythonFile,
  tests,
  directory,
  irodsVersion,
  verbosity,
  catalog,
  containers,
  versionOrDir
) {
  if (!existsSync(dir)) {
    execSync(
      "git clone https://github.com/alanking/irods_testing_environment.git",
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error ${error}`);
        }
      }
    );
  }

  const setupCommand =
    "pip3 install virtualenv;" +
    "virtualenv -p python3 /tmp/venv;" +
    "source /tmp/venv/bin/activate;" +
    "python -m pip install --upgrade pip;" +
    "pip install docker-compose;" +
    "pip install GitPython;" +
    "cd irods_testing_environment;";

  let testsExec = "";
  tests.forEach((test) => {
    testsExec += test + " ";
  });
  const pythonRunFile = "python " + pythonFile + " ";
  if (testsExec != "none ") testsExec = "--tests " + testsExec;
  const projectDir = "--project-dir=projects/" + directory + "/ ";
  let irodsVers = "--irods-package-version=" + irodsVersion + " ";
  if (versionOrDir == "isDir")
    irodsVers = "--irods-package-directory=" + irodsVersion + " ";
  const setContainers = "--concurrent-test-executor-count=" + containers + " ";
  let testCommand = pythonRunFile;
  if (testsExec === "none ") testCommand += projectDir + verbosity + ";";
  else if (pythonRunFile.includes("topology"))
    testCommand +=
      catalog +
      " " +
      testsExec +
      projectDir +
      setContainers +
      irodsVers +
      verbosity +
      ";";
  else
    testCommand +=
      testsExec + projectDir + setContainers + irodsVers + verbosity + ";";

  var res;

  return setupCommand + testCommand;
}

export function stopServer() {
  proc.kill();
}

export function testResParser(rawRes) {
  let beg = "==== begin test run results ====\n";
  let end = "==== end of test run results ====\n";

  let begPos = rawRes.indexOf(beg);
  let endPos = rawRes.indexOf(end) + end.length - 1;
  let logBeg = "collecting logs ";
  let logBegPos = rawRes.indexOf(logBeg);

  let rawResEnd = rawRes.substring(logBegPos + logBeg.length + 1);
  let logEndPos = rawResEnd.indexOf("]");
  let logFile = rawResEnd.substring(0, logEndPos);

  let testStr = rawRes.substring(begPos, endPos);

  let passedPos = testStr.indexOf("passed tests:");
  let skippedPos = testStr.indexOf("skipped tests:");
  let failedPos = testStr.indexOf("failed tests:");
  let retCodePos = testStr.indexOf("return code:");
  let timePos = testStr.indexOf("time elapsed:");
  let res = {
    "Start Test Result": beg,
    "Passed Tests": testStr.substring(passedPos, skippedPos),
    "Skipped Tests": testStr.substring(skippedPos, failedPos),
    "Failed Tests": testStr.substring(failedPos, retCodePos),
    "Return Code": testStr.substring(retCodePos, timePos),
    "Time Elapsed": testStr.substring(timePos, testStr.indexOf(":)")),
    "End Test Result": end,
    "Log File": logFile
  };

  return res;
}

export function storeTests(tests, results) {
  readFile("./test_history.json", "utf-8", (err, data) => {
    if (err) throw err;

    var jsonData = [JSON.parse(data)];
    let newjson = {};
    var i = 1;
    let time = new Date().toJSON();
    jsonData.forEach((entry) => {
      newjson = entry;
      i += 1;
    });

    let entry = {
      tests: tests,
      results: results
    };
    time = new Date().toJSON();
    newjson[time] = entry;

    writeFile(
      "./test_history.json",
      JSON.stringify(newjson, null, 2),
      "utf-8",
      () => {
        console.log(JSON.stringify(newjson, null, 2));
      }
    );
  });
}