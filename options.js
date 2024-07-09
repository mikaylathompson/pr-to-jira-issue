async function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    jiraEmail: document.getElementById('jiraEmail').value,
    jiraApiToken: document.getElementById('jiraApiToken').value,
    githubToken: document.getElementById('githubToken').value,
    jiraProject: document.getElementById('jiraProject').value
  }).then(e => {
    document.getElementById('success-message').classList.add('show');
    setTimeout(() => document.getElementById('success-message').classList = [], 2000);
  }
  ).catch(e => {
    const error = document.getElementById('error-message')
    error.appendChild(e)
    error.classList.add('show');
    setTimeout(() => error.classList = [], 5000);
  });
}

async function restoreOptions() {
  const res = await browser.storage.local.get(['jiraApiToken', 'jiraProject', 'githubToken']);
  document.getElementById('jiraEmail').value = res.jiraEmail || '';
  document.getElementById('jiraApiToken').value = res.jiraApiToken || '';
  document.getElementById('githubToken').value = res.githubToken || '';
  document.getElementById('jiraProject').value = res.jiraProject || '';
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);