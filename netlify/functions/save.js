const VALID_HASH = '2fff2e6c12b3866d026c4c8be5fdd4fa731e08dcea568afaf46a758252500c3b'; // SHA-256 of hirak@sarkar9486

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ success: false, message: 'Method Not Allowed' }) };
  }

  try {
    const payload = JSON.parse(event.body);

    // Verify Password Hash
    if (payload.auth !== VALID_HASH) {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: 'Unauthorized: Invalid credentials.' })
      };
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER || 'rithikur';
    const GITHUB_REPO = process.env.GITHUB_REPO || 'dr_hiraksarkar';
    const FILE_PATH = 'data.json';

    if (!GITHUB_TOKEN) {
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, message: 'Server missing GITHUB_TOKEN environment variable' })
      };
    }

    // 1. Fetch current file to get its SHA (required by GitHub API to update files)
    const getRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Netlify-CMS-Function'
      }
    });

    if (!getRes.ok) {
      const errTxt = await getRes.text();
      return {
        statusCode: getRes.status,
        body: JSON.stringify({ success: false, message: `Failed to fetch current file info: ${errTxt}` })
      };
    }

    const fileInfo = await getRes.json();
    const sha = fileInfo.sha;

    // 2. Base64 Encode new data
    const newContentStr = JSON.stringify(payload.data, null, 2) + '\n';
    const newContentBase64 = Buffer.from(newContentStr).toString('base64');

    // 3. Put new content back to GitHub
    const putRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Netlify-CMS-Function'
      },
      body: JSON.stringify({
        message: 'Content update via Live Admin Panel',
        content: newContentBase64,
        sha: sha,
        branch: 'main'
      })
    });

    if (!putRes.ok) {
      const errTxt = await putRes.text();
      return {
        statusCode: putRes.status,
        body: JSON.stringify({ success: false, message: `Failed to update file: ${errTxt}` })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Successfully updated data.json via GitHub API' })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: `Server error: ${err.message}` })
    };
  }
};
