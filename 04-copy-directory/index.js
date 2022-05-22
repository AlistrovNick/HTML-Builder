const path = require("path");
const fs = require("fs/promises");

let srcPath = path.join(__dirname, "files");
let destPath = path.join(__dirname, "files-copy");

createDestDir(destPath);
deepCopyingDirWithFiles(srcPath, destPath);

async function createDestDir(destPath) {
    let isDestDirNotExist;
    await fs.access(destPath)
        .then(() => isDestDirNotExist = false)
        .catch(() => isDestDirNotExist = true);
    if (isDestDirNotExist) {
        await fs.mkdir(destPath);
    }
}

async function deepCopyingDirWithFiles(srcPath, destPath) {
    await removeUnnecessary(srcPath, destPath);
    await copyMissing(srcPath, destPath);
}

async function removeUnnecessary(srcPath, destPath) {
    let option = { withFileTypes: true };
    let srcElements = await fs.readdir(srcPath, option);
    let destElements = await fs.readdir(destPath, option);
    for (let element of destElements) {
        if (!isElementIncludes(srcElements, element)) {
            let path4remove = path.join(destPath, element.name);
            element.isDirectory() ? removeDir(path4remove) : fs.unlink(path4remove);
        } else {
            let nextSrcPath = path.join(srcPath, element.name);
            let nextDestPath = path.join(destPath, element.name);
            if (element.isDirectory()) {
                removeUnnecessary(nextSrcPath, nextDestPath);
            } else {
                let srcFileContent = await fs.readFile(nextSrcPath);
                let destFileContent = await fs.readFile(nextDestPath);
                if (!srcFileContent.equals(destFileContent)) {
                    fs.copyFile(nextSrcPath, nextDestPath);
                }
            }
        }
    }
}
async function copyMissing(srcPath, destPath) {
    let option = { withFileTypes: true };
    let srcElements = await fs.readdir(srcPath, option);
    let destElements = await fs.readdir(destPath, option);
    for (let element of srcElements) {
        let src4copy = path.join(srcPath, element.name);
        let dest4copy = path.join(destPath, element.name);
        if (!isElementIncludes(destElements, element)) {
            if (element.isDirectory()) {
                fs.mkdir(dest4copy);
                copyMissing(src4copy, dest4copy);
            } else {
                fs.copyFile(src4copy, dest4copy);
            }
        } else {
            if (element.isDirectory()) {
                copyMissing(src4copy, dest4copy);
            }
        }
    }
}

function isElementIncludes(array, element) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].name === element.name) {
            return true;
        }
    }
    return false;
}

async function removeDir(pathDir) {
    let option = { withFileTypes: true };
    let dir = await fs.readdir(pathDir, option);
    if (dir.length !== 0) {
        for (let element of dir) {
            let currentPath = path.join(pathDir, element.name);
            element.isDirectory() ? await removeDir(currentPath) : await fs.unlink(currentPath);
        }
    }
    fs.rmdir(pathDir);
}