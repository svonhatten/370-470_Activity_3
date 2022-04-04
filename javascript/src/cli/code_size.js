const fs = require("fs");
const {Octokit} = require("@octokit/core");
const commander = require("commander");

// Setup process

commander.version("1.0.0", "-v, --version")
    .requiredOption("-t, --token <value>", "Sets the GitHub access token to use")
    .requiredOption("-r, --repo <value>", "Sets the GitHub repository (obsproject/obs-studio)")
    .option("-o, --output <value>", "Sets the output file", "code_size.csv")
    .parse(process.argv);
commander.parse();
const options = commander.opts();

// Setup Octokit
const octokit = new Octokit({auth: options.token});

// These are all the keys and functions to format data for each key
// null means it will simply add the string value to the csv field

const keys = new Map();
keys.set("sha", null);
keys.set("size", null);
keys.set("path", null);


// Create CSV header
let csv = "";
for (let entry of keys.entries()) csv += `${entry[0]},`;
csv = csv.slice(0, -1) + "\n"; // Remove the last comma and add new line

async function generate_csv() {
    let res = [];
    let res_branches = [];
    let page = 1;
    let sha = [];
    let uniqueData = [];

    res_branches.status = 200;
    res_branches.data = [1];

    // commits
    while (res_branches.status !== 404 && res_branches.data.length !== 0) {
        // GET each commit's trees
        res_branches = await octokit.request(`GET /repos/${options.repo}/commits`, {
            per_page: 100,
            page
        });

        page++;
        if (res_branches.status !== 404) {
            for (let i = 0; i < res_branches.data.length; i++) {
                sha.push(res_branches.data[i].sha)
            }
        }
    }

    // commits for loop
    for (let commit of sha) {
        res = await octokit.request(`GET /repos/${options.repo}/git/trees/${commit}`, {
            recursive: true,
        });
        newArray(res.data);
    }

    uniqueData = getUnique(shaArray, "sha");
    console.log(uniqueData);

    if (res.status !== 404) csv += newFormatData(uniqueData);

    return csv;
}

// Add data to new array
let shaArray = [];
function newArray(data) {
    for (let j = 0; j < data.tree.length; j++) {
        shaArray.push(data.tree[j]);
    }

    return shaArray;
}

// Return new array with unique data
function getUnique(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
}

function newFormatData(uniqueData) {
    let csv = "";
    for (let i = 0; i < uniqueData.length; i++) {
        for (const [key, action] of keys.entries()) {
            if (uniqueData[i]["size"] !== undefined) {
                csv += (uniqueData[i][key] && action) ? `${action(uniqueData[i][key])},` : `${uniqueData[i][key]},`;
            }
        }
        csv = csv.slice(0, -1) + "\n";
    }
    return csv;
}

function formatData(data) {
    let csv = "";
    for (let i = 0; i < data.tree.length; i++) {
        for (const [key, action] of keys.entries()) {
            if (data.tree[i]["size"] !== undefined) {
                csv += (data.tree[i][key] && action) ? `${action(data.tree[i][key])},` : `${data.tree[i][key]},`;
            }
        }
        csv = csv.slice(0, -1) + "\n";
    }
    return csv;
}

generate_csv().then(csv => {
    console.log(`Writing to ${options.output}`);
    fs.writeFile(options.output, csv, err => {
        if (err) throw err; else console.log(`${options.output} written successfully.`);
    });
}).catch(console.error);



