const path = require("path");
const fs = require("fs");
const { stdin } = process;

const FILE_NAME = "output.txt";
const EXIT_WORD = "exit";
const filePath = path.join(__dirname, FILE_NAME);
const option = {
    flags: "a",
    encoding: null,
    mode: 0666
};
let output;

greeting();
handleEnteredText();
parting();

function greeting() {
    console.log("Hello! Please enter new line:");
}

function handleEnteredText() {
    stdin.on("data", data => {
        let text = data.toString().trim();
        if (text === EXIT_WORD) {
            process.exit(0);
        }
        writeToFile(text);
    });
}

async function writeToFile(text) {
    if (!output) {
        output = await fs.createWriteStream(filePath, option);
    }
    await output.write(`${text}\n`);
}

function parting() {
    process.on("SIGINT", () => {
        process.exit();
    });
    process.on("exit", () => {
        console.log("Good Bye!");
    });
}