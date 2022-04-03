const fs = require("fs");
const commander = require("commander");
const RequestBuilder = require("../lib/RequestBuilder");
const Formatter = require("../lib/Formatter");
const path = require("path");

// Setup process
commander.version("1.0.0", "-v, --version")
    .requiredOption("-t, --token <value>", "Sets the GitHub access token to use")
    .requiredOption("-r, --repo <value>", "Sets the GitHub repository (obsproject/obs-studio)")
    .option("-o, --output <value>", "Sets the output file", "issues.csv")
    .parse(process.argv);
commander.parse();
const options = commander.opts();

const formatter = new Formatter();

let builder = new RequestBuilder(options.token, options.repo, "issues");
builder.option("state", "all");
builder.exclude("pull_request");
builder.multiPage(true);
builder.submit().then(res => {
    const keys = new Map();
    keys.set("id", null);
    keys.set("state", null);
    keys.set("created_at", formatter.formatDate);
    keys.set("closed_at", formatter.formatDate);
    keys.set("assignees", formatter.arraySize);
    keys.set("comments", null);
    keys.set("labels", handleLabels);

    res.toCsvFile(keys, options.output, err => {
        if (err) throw err;
        else console.log(`Wrote CSV to ${options.output}`);
    })
});

function handleLabels(labels) {
    // TODO: Handle label array
    return "label data (TODO)";
}