# GitHub PR comment to JIRA Issue

This is a browser extension that adds a link to github PR comments to create a JIRA issue. A link to the JIRA issue is added to the comment thread, and the JIRA issue contains a direct link to the comment as well.


## Installation

The extension is available as a signed, installable file here: https://github.com/mikaylathompson/pr-to-jira-issue/releases/download/v0.1/3674be97c39e417d8b6c-1.0.zip

Download this zip, go to [about:addons](about:addons), and do Settings (gear icon) -> Install Add-on from File and select the zip above.

Still on about:addons, click into the extension and go to the Preferences tab.

JIRA login email and project key should be self-explanatory. 

For the JIRA token, follow these instructions: https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/

For the github token, follow these instructions: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token, and give the token `Read and Write access to pull requests` (this will automatically also add `Read access to metadata`).


## Development

```sh
# Clone repo
git clone git@github.com:mikaylathompson/pr-to-jira-issue.git
cd pr-to-jira-issue

# Install the web-ext tools
npm install --global web-ext

# Builds and installs the extension into an isolated firefox instance.
# It will watch the files and automatically refresh the extension.
web-ext run
```


## TODOs
- The big one is that the Atlassian instance url needs to be configurable. I haven't dealt with this yet. That means it will currently only create issues in the `https://opensearch.atlassian.net` instance. If you don't work on Opensearch, this is unfortunate for you, but very easy to do a search-replace.
- Ideally, things like the project key and atlassian instance can be configured for specific Github repos, or at least adjusted in the create issue modal.
- Perhaps it should also be configurable to only add the link in certain github repos. This is definitely doable via the extension permissions, but it's a pain becuase (I think) I need very broad permissions to be able to write the settings to local storage from the extension page.
- Ideally, I'd add the "create issue" link to the little menu on the comment, but that seemed execessively complicated for a first pass.
- I had to request super broad permissions in order to set options on the `about:addons` page. This isn't ideal.
