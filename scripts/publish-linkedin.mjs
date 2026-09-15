import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

function changedFiles() {
  try {
    return execFileSync('git', ['diff', '--name-only', 'HEAD^', 'HEAD', '--', 'content/linkedin/*.json'], { encoding: 'utf8' })
      .trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

const files = changedFiles();
if (!files.length) {
  console.log('No changed LinkedIn post files.');
  process.exit(0);
}

for (const file of files) {
  const post = JSON.parse(await readFile(file, 'utf8'));
  if (post.publish !== true) {
    console.log(`Skip ${file}: publish=false`);
    continue;
  }

  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const author = process.env.LINKEDIN_AUTHOR_URN;
  const version = process.env.LINKEDIN_API_VERSION || '202608';
  if (!token || !author) throw new Error('LinkedIn credentials are not configured.');
  if (!post.text || typeof post.text !== 'string') throw new Error(`Missing text in ${file}`);

  const commentary = post.url ? `${post.text}\n\n${post.url}` : post.text;
  const body = {
    author,
    commentary,
    visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false
  };

  const response = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-restli-protocol-version': '2.0.0',
      'linkedin-version': version
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  if (!response.ok) throw new Error(`LinkedIn API ${response.status}: ${text}`);
  console.log(`Published ${file}: ${response.headers.get('x-restli-id') || 'created'}`);
}
