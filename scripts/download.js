const { get } = require('https');
const fs = require('fs');
const { mkdir, rm, stat } = require('fs/promises');

const { Octokit } = require('@octokit/core');

run().then(() => console.log('done'), console.error);

async function run() {
  await clean('cache');
  console.log('cache/ cleared');

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  // const {
  //   data: {
  //     items: [mostRecentPr],
  //   },
  // } = await octokit.request("GET /search/issues", {
  //   q: "is:open is:pr author:andook-github-bot repo:andook/rest-api-description",
  // });

  const getDescriptionsOptions = {
    owner: 'andook',
    repo: 'rest-api-description',
    path: 'generated',
    ref: 'master'
  };

  // if (mostRecentPr) {
  //   const {
  //     data: {
  //       head: { ref },
  //     },
  //   } = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
  //     owner: "andook",
  //     repo: "rest-api-description",
  //     pull_number: mostRecentPr.number,
  //   });
  //   getDescriptionsOptions.ref = ref;
  //   console.log(
  //     `Open pull requests found by @andook-github-bot: ${mostRecentPr.html_url}.\nLoading descriptions from "${ref}" branch`
  //   );
  // } else {
  //   console.log(
  //     "No open pull requests found by @andook-github-bot. Loading descriptions from default branch"
  //   );
  // }

  const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', getDescriptionsOptions);

  if (!Array.isArray(data)) {
    throw new Error('https://github.com/andook/rest-api-description/tree/main/generated is not a directory');
  }

  for (const folder of data) {
    const { name } = folder;
    const ref = getDescriptionsOptions.ref;

    if (name === 'README.md') {
      continue;
    }

    await download(name, `${ref}/generated/${name}/${name}.json`);
    // await download(
    //   `${name}.deref`,
    //   `${ref}/generated/${name}/dereferenced/${name}.deref.json`
    // );
  }
}

async function clean(dir) {
  try {
    await stat(dir);
    await rm(dir, { recursive: true });
    await mkdir(dir);
  } catch (_) {
    await mkdir(dir);
  }
}

async function download(name, remotePath) {
  const path = `cache/${name}.json`;

  const file = fs.createWriteStream(path);
  const url = `https://raw.githubusercontent.com/andook/rest-api-description/${remotePath}`;

  console.log('Downloading %s', url);

  await new Promise((resolve, reject) => {
    get(url, (response) => {
      response.pipe(file);
      file
        .on('finish', () =>
          file.close((error) => {
            if (error) return reject(error);
            console.log('%s written', path);
            resolve();
          })
        )
        .on('error', (error) => reject(error.message));
    });
  });

  console.log('Formatting %s', path);

  const content = fs.readFileSync(path, 'utf-8');
  fs.writeFileSync(path, JSON.stringify(JSON.parse(content), null, 2));
}
