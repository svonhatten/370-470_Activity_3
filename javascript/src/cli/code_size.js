const fs = require("fs");
const commander = require("commander");
const RequestBuilder = require("../lib/RequestBuilder");
const Formatter = require("../lib/Formatter");

// Setup process
commander.version("1.0.0", "-v, --version")
    .requiredOption("-t, --token <value>", "Sets the GitHub access token to use")
    .requiredOption("-r, --repo <value>", "Sets the GitHub repository (obsproject/obs-studio)")
    .option("-o, --output <value>", "Sets the output file", "code_size.csv")
    .parse(process.argv);
commander.parse();
const options = commander.opts();

const formatter = new Formatter();

let commitsRequest = new RequestBuilder(options.token, options.repo, "commits");
commitsRequest.multiPage(true);

commitsRequest.submit().then(async commits => {
    const keys = new Map();
    keys.set("sha", null);
    keys.set("date", null);
    keys.set("size", null);
    keys.set("path", null);

    const shas = [];

    commits.data.forEach(c => {
        if(c.sha) shas.push({
            sha: c.sha,
            date: c.commit.committer.date
        });
    });

    async function generateRows(csv) {
        await new Promise(async resolve => {
            let entry = shas.pop();
            let shaRequest = new RequestBuilder(options.token, options.repo, `git/trees/${entry.sha}`)
            shaRequest.option("recursive", true);
            shaRequest.dataPath("tree");
            shaRequest.uniqueKey("sha");
            shaRequest.required("size"); // Require the size key to be set (filters out directories)
            await shaRequest.submit().then(async tree => {
                tree.data.forEach(obj => {
                    obj.date = entry.date;
                });

                if (!csv) csv = tree.csvHeader(keys);
                csv += tree.toHeaderlessCsv(keys);
                if (shas.length !== 0) await generateRows(csv);
                else {
                    fs.writeFile(options.output, csv, err => {
                        if (err) throw err; else console.log(`Wrote code size to ${options.output}`);
                    });
                    resolve(csv);
                }
            });
        });
    }
    await generateRows();
});