const path = require("path");
const fs = require("fs/promises");

const SRC_DIR = "styles";
const DEST_DIR = "project-dist";
const DEST_FILE = "bundle.css";

let srcPath = path.join(__dirname, SRC_DIR);
let destPath = path.join(__dirname, DEST_DIR);
let bundlePath = path.join(__dirname, DEST_DIR, DEST_FILE);

(async function main() {
    await createDestDir(destPath);
    await createDestFile(bundlePath);
    let bundleContent = await fs.readFile(bundlePath);
    let filesContent = await getFilesContent(srcPath);
    if (bundleContent !== filesContent) {
        fs.writeFile(bundlePath, filesContent);
    }
})();

async function createDestDir(destPath) {
    let isDestDirNotExist;
    await fs.access(destPath)
                    .then(() => isDestDirNotExist = false)
                    .catch(() => isDestDirNotExist = true);
    if (isDestDirNotExist) {
        await fs.mkdir(destPath);
    }
}

async function createDestFile(destFilePath) {
    let isDestFileNotExist;
    await fs.access(destFilePath)
                    .then(() => isDestFileNotExist = false)
                    .catch(() => isDestFileNotExist = true);
    if (isDestFileNotExist) {
        await fs.writeFile(destFilePath, "");
    }
}

async function getFilesContent(src) {
    let dirContent = await getDirContent(src);
    let files = dirContent.filter(el => !el.isDirectory());
    let filesName = files.map(file => file.name);
    let cssFiles = filesName.filter(filename => path.extname(filename) === ".css");
    let filesContent = "";
    for (let i = 0; i < cssFiles.length; i++) {
        let filePath = path.join(src, cssFiles[i]);
        filesContent += await fs.readFile(filePath, {encoding: "utf-8"});
        filesContent += "\n";
    }
    return filesContent;
}

function getDirContent(src) {
    let option = { withFileTypes: true };
    return fs.readdir(src, option);
}