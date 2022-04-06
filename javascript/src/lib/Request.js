const fs = require("fs");
module.exports = class Request {
    _octokit;
    _repo;
    _scope;
    _opts = [];
    _multiPage;
    _excludes;
    _required;
    _dataPath;
    _uniqueKey;
    data = [];

    /**
     * Constructor
     * @param octokit {octokit}
     * @param opts {String[]}
     * @param repo {string}
     * @param scope {String[]}
     * @param multiPage {boolean}
     * @param dataPath {string}
     * @param uniqueKey {string}
     * @param required {String[]}
     * @param excludes {String[]}
     */
    constructor(octokit, opts, repo, scope, multiPage, dataPath, uniqueKey, required, excludes) {
        this._octokit = octokit;
        this._opts = opts;
        this._repo = repo;
        this._scope = scope;
        this._multiPage = multiPage;
        this._dataPath = dataPath;
        this._uniqueKey = uniqueKey;
        this._required = required;
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
                resolve(this);
            } else {
                await this._req(null).then(res => {
                    this._pushData(res.data);
                }).catch(console.error);
                resolve(this);
            }
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
        if (this._dataPath && data[this._dataPath]) data = data[this._dataPath];
        if (Symbol.iterator in Object(data)) for (let row of data) this._pushRow(row); else this._pushRow(data);
    }

    _pushRow(row) {
        if (this._dataPath) row = row[this._dataPath];
        for (const exclude of this._excludes) if (row[exclude]) return;
        this.data.push(row);
    }

    csvHeader(keys) {
        let csv = "";
        for (let entry of keys.entries()) csv += `${entry[0]},`;
        csv = csv.slice(0, -1) + "\n"; // Remove the last comma and add new line
        return csv;
    }

    toHeaderlessCsv(keys) {
        let csv = "";
        row_loop:
            for (let row of this.data) {
                let rowString = "";
                for (let [key, action] of keys.entries()) {
                    if (row[key]) {
                        rowString += action ? `${action(row[key])},` : `${row[key]},`
                    } else {
                        if (this._required.indexOf(key) > -1) continue row_loop; else rowString += ",";
                    }
                }
                csv += rowString.slice(0, -1) + "\n";
            }
        return csv;
    }

    /**
     * Creates a CSV String containing all data
     * @param keys {Map<string, function>} Map of keys and functions to format CSV data
     * @returns {string}
     */
    toCsv(keys) {
        let csv = this.csvHeader(keys);
        csv += this.toHeaderlessCsv(keys);
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
            if (err) callback(err); else callback(null);
        });
    }
}