module.exports = class Formatter {
    constructor() {
    }

    formatDate(string) {
        if (string) {
            let date = new Date(string);
            return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
        }
    }

    arraySize(array) {
        return (array && array.length) ? array.length : "";
    }
}