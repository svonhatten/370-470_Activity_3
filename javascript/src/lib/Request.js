const fs = require("fs");
module.exports = class Request {
    _octokit;
    _repo;
    _scope;
    _opts = [];
    _multiPage;
    data = [];

    /**
     * Constructor
     * @param octokit {octokit}
     * @param opts {[]}
     * @param repo {string}
     * @param scope {[]}
     * @param multiPage {boolean}
     * @param excludes {[]}
     */
    constructor(octokit, opts, repo, scope, multiPage, excludes) {
        this._octokit = octokit;
        this._opts = opts;
        this._repo = repo;
        this._scope = scope;
        this._multiPage = multiPage;
        this._excludes = excludes;
    }

    async submit() {
        return new Promise(async (resolve, reject) => {
            if (this._multiPage) { // Recursive
                let page = 1;
                while (true) {
                    let res = await this._req(page);
                    if (res.status !== 404 && res.data.length > 0) {
                        this._pushData(res.data);
                        page++;
                    } else {
                        break;
                    }
                }
            } else {
                this._req(null).then(res => {
                    this._pushData(res.data);
                }).catch(console.error);
            }
            resolve(this);
        });
    }

    /**
     *
     * @returns {Promise<>}
     * @private
     */
    _req(page) {
        this._opts.per_page = 100;
        if (page) this._opts.page = page;
        return this._octokit.request(`GET /repos/${this._repo}/${this._scope}`, this._opts)
    }

    _pushData(data) {
        row_loop:
            for (let row of data) {
                for (const exclude of this._excludes) if (row[exclude]) continue row_loop;
                this.data.push(row);
            }
    }


    /**
     * Creates a CSV String containing all data
     * @param keys {Map<string, function>} Map of keys and functions to format CSV data
     * @returns {string}
     */
    toCsv(keys) {
        let csv = "";
        for (let entry of keys.entries()) csv += `${entry[0]},`;
        csv = csv.slice(0, -1) + "\n"; // Remove the last comma and add new line

        for (let row of this.data) {
            for (const [key, action] of keys.entries()) {
                csv += (row[key]) ? action ? `${action(row[key])},` : `${row[key]},` : ",";
            }
            csv = csv.slice(0, -1) + "\n";
        }
        return csv;
    }

    /**
     * Creates a CSV file containing all data
     * @param keys {Map<string, function>} Map of keys and functions to format CSV data
     * @param {String} path
     * @param callback
     */
    toCsvFile(keys, path, callback) {
        fs.writeFile(path, this.toCsv(keys), err => {
            if (err) callback(err);
            else callback(null);
        });
    }
}