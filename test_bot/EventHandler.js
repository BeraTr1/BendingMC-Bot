const path = require("path");
const fs = require("fs");

function getFiles(directory, options) {
    let files = [];
    let dirents = fs.readdirSync(directory, {withFileTypes: true});

    for (let dirent of dirents) {
        let filePath = path.join(directory, dirent.name);

        // if folders only is true, this function will only return folders. Otherwise, it will only return file paths
        let foldersOnly = options.foldersOnly === true;
        if (foldersOnly) {
            let isFolder = dirent.isDirectory();
            if (!isFolder) continue;

            files.push(filePath);
        } else {
            let isFile = dirent.isFile();
            if (!isFile) continue;

            files.push(filePath);
        }
    }

    return files;
}

module.exports = (client) => {
    // get all files in a folder
    // for each file, require a function inside of it
    
    const folderPath = path.join(__dirname, "bot_modules");

    let moduleFolders = getFiles(folderPath, {foldersOnly: true});

    for (let folder of moduleFolders) {
        let files = getFiles(folderPath);
    }

    let files = getFiles(folderPath);

    for (let file of files) {
        // console.log("file name: " + file.name);
        console.log("found file: " + file);
    }
}