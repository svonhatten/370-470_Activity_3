const fs = require("fs");
const {Octokit} = require("@octokit/core");
const commander = require("commander");

// Setup process

commander.version("1.0.0", "-v, --version")
    .requiredOption("-t, --token <value>", "Sets the GitHub access token to use")
    .requiredOption("-r, --repo <value>", "Sets the GitHub repository (obsproject/obs-studio)")
    .option("-o, --output <value>", "Sets the output file", "issues.csv")
    .parse(process.argv);
commander.parse();
const options = commander.opts();

// Setup Octokit
const octokit = new Octokit({auth: options.token});

// These are all the keys and functions to format data for each key
// null means it will simply add the string value to the csv field

const keys = new Map();
keys.set("id", null);
keys.set("state", null);
keys.set("created_at", formatDate);
keys.set("closed_at", formatDate);
keys.set("assignees", arraySize);
keys.set("comments", arraySize);
keys.set("labels", handleLabels);

// Create CSV header
let csv = "";
for (let entry of keys.entries()) csv += `${entry[0]},`;
csv = csv.slice(0, -1) + "\n"; // Remove the last comma and add new line

async function generate_csv() {
    let res = [];
    let page = 1;

    res.status = 200; // Dirty trick to get the loop going
    res.data = [1];

    while (res.status !== 404 && res.data.length !== 0) {
        res = await octokit.request(`GET /repos/${options.repo}/issues`, {
            state: "all", per_page: 100, // GitHub API max items per page is 100
            page
        });

        page++;
        if (res.status !== 404) csv += formatData(res.data);
    }
    return csv;
}

function formatData(data) {
    let csv = "";
    for (let i = 0; i < data.length; i++) {
        if (!data[i]["pull_request"]) {     // Ignore pull requests
            for (const [key, action] of keys.entries()) {
                csv += (data[i][key]) ? (action) ? `${action(data[i][key])},` : `${data[i][key]},` : `${data[i][key]},`;
            }
            csv = csv.slice(0, -1) + "\n";
        }
    }
    return csv;
}

function formatDate(data) {
    if (data) {
        let date = new Date(data);
        return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
    } else return "null"
}

function arraySize(array) {
    return (array && array.size) ? array.length :  0;
}

function handleLabels(labels) {
    // TODO: Handle label array
    return "label data (TODO)";
}

generate_csv().then(csv => {
    console.log(`Writing to ${options.output}`);
    fs.writeFile(options.output, csv, err => {
        if (err) throw err; else console.log(`${options.output} written successfully.`);
    });
}).catch(console.error);