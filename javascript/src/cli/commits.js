const fs = require("fs");
const {Octokit} = require("@octokit/core");
const commander = require("commander");
const RequestBuilder = require("../lib/RequestBuilder");
const Formatter = require("../lib/Formatter");

// Setup process

commander.version("1.0.0", "-v, --version")
    .requiredOption("-t, --token <value>", "Sets the GitHub access token to use")
    .requiredOption("-r, --repo <value>", "Sets the GitHub repository (obsproject/obs-studio)")
    .option("-o, --output <value>", "Sets the output file", "commits.csv")
    .parse(process.argv);
commander.parse();
const options = commander.opts();

let builder = new RequestBuilder(options.token, options.repo, "commits");
builder.option("state", "all");
builder.dataPath("commit");
builder.multiPage(true);
builder.submit().then(res => {
    const keys = new Map();
    keys.set("committer", formatCommit);
    keys.set("tree", formatTree);

    // console.log(res.data); // Print data
    // console.log(res.toCsv(keys)) // Print CSV

    res.toCsvFile(keys, options.output, err => {
        if (err) throw err; else console.log(`Wrote CSV to ${options.output}`);
    });
});

function formatCommit(data) {

}

function formatTree(data) {
    return data.url;
}