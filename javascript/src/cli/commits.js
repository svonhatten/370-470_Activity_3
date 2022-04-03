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
builder.exclude("pull_request");
builder.multiPage(true);
builder.submit().then(res => {
    const keys = new Map();
    keys.set("id", null);
    keys.set("commit", formatCommit);
    keys.set("committer", formatCommitter);
    keys.set("author", formatAuthor);

    // console.log(res.data); // Print data
    // console.log(res.toCsv(keys)) // Print CSV

    res.toCsvFile(keys, options.output, err => {
        if (err) throw err; else console.log(`Wrote CSV to ${options.output}`);
    })
});

function formatCommit(data) {
    // TODO
}

function formatCommitter(data) {
    // TODO
}

function formatAuthor(data) {
    // TODO
}

function formatURL(data) {
    if (data) {
        let url = new URL(data);
        return url;
    } else return "null"
}