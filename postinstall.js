/**
 * Installs rg to ./bin/rg
 */
const https = require('https');
const fs = require('fs');
const packageData = require('./package.json');
const {execSync} = require('child_process');

// ex /BurntSushi/ripgrep/releases/download/13.0.0/ripgrep-13.0.0-x86_64-apple-darwin.tar.gz
const ROOT = `https://github.com/BurntSushi/ripgrep/releases/download/`;
const VERSION = packageData.ripgrepConfig.version;

/** @type {{[k: string]: string}} */
const releases = {
    'darwin': 'ripgrep-VER-x86_64-apple-darwin.tar.gz',
    'linux': 'ripgrep-VER-x86_64-unknown-linux-musl.tar.gz',
    'win32': 'ripgrep-VER-x86_64-pc-windows-msvc.zip',
}

const url = (
    `${ROOT}${VERSION}/` +
    `${releases[process.platform].replace('VER', VERSION)}`
);

function fetch(location) {
    https.get(location, res => {
        if (res.headers.location) {
            return fetch(res.headers.location);
        }
        if (res.statusCode !== 200) {
            throw new Error(`${res.statusCode}: ${res.statusMessage}`);
        }
        download(res);
    });
}

function download(res) {
    const file = fs.createWriteStream('./bin/rg.tar.gz');
    res.pipe(file);
    file.on('finish', () => {
        file.close();
        unpack();
    });
}

function unpack() {
    execSync('tar -xvzf ./bin/rg.tar.gz');
    const dir = fs.readdirSync('./').filter(f => f.startsWith('ripgrep-'))[0];  
    const end = process.platform === 'win32' ? '.exe' : ""
    fs.copyFileSync(`./${dir}/rg${end}`, `./bin/rg${end}`);
    fs.unlinkSync(`./${dir}/rg${end}`);
    remove(`./${dir}`);
    fs.unlinkSync('./bin/rg.tar.gz');
}

function remove(path) {
    const stats = fs.statSync(path);
    if (stats.isDirectory()) {
        for (const file of fs.readdirSync(path)) {
            remove(`${path}/${file}`);
        }
    } else {
        fs.unlinkSync(path);
    }
}

try {
    execSync('rg --help');
} catch {
    fetch(url);
}