browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'createJiraTask') {
    createJiraTask(message.title, message.description, message.comment);
  }
});


function createJiraTask(title, description, comment) {
  browser.storage.local.get(['jiraApiToken', 'jiraProject', 'jiraEmail']).then((config) => {
    var { jiraApiToken, jiraProject, jiraEmail } = config;
    const apiUrl = `https://opensearch.atlassian.net/rest/api/3/issue`;

    const body = {
      "fields": {
        "description": {
          "content": [
            {
              "content": [
                {
                  "text": description,
                  "type": "text"
                }
              ],
              "type": "paragraph"
            },
            {
              "type": "paragraph",
              "content": [{
                "type": "text",
                "text": comment.url,   
                "marks": [
                  {
                    "type": "link",
                    "attrs": {
                      "href": comment.directUrl,
                    }
                  }
                ]
              }]
            }
          ],
          "type": "doc",
          "version": 1
        },
        "issuetype": {
          "id": "10002" // This is 'task' -- I pulled it from the project metadata but I'm hardcoding it here.
        },
        "project": {
          "key": "MIGRATIONS"
        },
        "summary": title
      },
      "update": {}
    }

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${jiraEmail}:${jiraApiToken}`)}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // These two are necessary to get around the Atlassian XSRF check
        // Why do they care about the user agent? Who knows.
        'X-Atlassian-Token': 'no-check',
        "User-Agent" : "GithubToJIRA Extension User"
      },
      body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(data => {
      const jiraTaskUrl = `https://opensearch.atlassian.net/browse/${data.key}`;
      replyToComment(title, comment, jiraTaskUrl);
    })
    .catch(error => console.error('Error creating JIRA task:', error));
  });
}

function replyToComment(title, comment, jiraTaskUrl) {
  const commentId = comment.id.replace("discussion_r", "");
  const urlPath = new URL(comment.url).pathname.split('/');
  const owner = urlPath[1];
  const repo = urlPath[2];
  const pullRequestId = urlPath[4];

  const issueUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullRequestId}/comments/${commentId}/replies`;
  
  browser.storage.local.get(['githubToken']).then((config) => {
    var { githubToken } = config;    

    fetch(issueUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github+json'
      },
      body: JSON.stringify({
        body: `Created a JIRA issue: [${title}](${jiraTaskUrl})`
      })
    })
    .then(response => response.json())
    .then(data => {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
          chrome.tabs.sendMessage(tabs[0].id, {action: "gh_pr_comment_posted", url: data.html_url});  
      });
    })
    .catch(error => console.error('Error replying to comment:', error));
  });
}
