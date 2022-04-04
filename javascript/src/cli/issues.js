const fs = require("fs");
const commander = require("commander");
const RequestBuilder = require("../lib/RequestBuilder");
const Formatter = require("../lib/Formatter");

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
        if (err) throw err; else console.log(`Wrote issues CSV to ${options.output}`);
        generateLabelsCSV(res.data, (err, file) => {
            if (err) throw err; else console.log(`Wrote labels CSV to ${file}`);
        });
    });
});

function generateLabelsCSV(data, callback) {
    const labels = new Map();

    for (let row of data) {
        for (let label of row.labels) {
            if (labels.has(label.name)) labels.set(label.name, labels.get(label.name) + 1); else labels.set(label.name, 1);
        }
    }

    let csv = "name,occurrences\n"
    for(let [name, occurrences] of labels) {
        csv += `${name},${occurrences}\n`
    }

    let fileParts = options.output.split(".");
    let ext = "";
    if (fileParts.length > 1) ext = `.${fileParts[1]}`;
    let name = `${fileParts[0]}-labels${ext}`;

    fs.writeFile(name, csv, err => {
        if (err) callback(err); else callback(null, name);
    });
}


function handleLabels(labels) {
    let string = "";
    for (let label of labels) {
        string += `${label.name}; `
    }
    string = string.slice(0, -2);
    return string;
}