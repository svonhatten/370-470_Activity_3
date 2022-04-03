const {Octokit} = require("@octokit/core");
const Request = require("./Request");
module.exports = class RequestBuilder {
    repo;
    scope;
    _octokit;
    _excludes = [];
    _opts = [];
    _multiPage;

    /**
     * Constructor
     * @param token {string} GitHub access token
     * @param repo {string} Repository to request data from
     * @param scope {string} Scope of data to request
     */
    constructor(token, repo, scope) {
        this._octokit = new Octokit({auth: token});
        this.repo = repo;
        this.scope = scope;
    }

    option(key, value) {
        this._opts[key] = value;
    }

    exclude(key) {
        this._excludes.push(key);
    }

    multiPage(bool) {
        this._multiPage = bool;
    }

    async submit() {
        return new Request(this._octokit, this._opts, this.repo, this.scope, this._multiPage, this._excludes).submit();
    }
}

