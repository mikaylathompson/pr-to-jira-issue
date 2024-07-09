const JIRA_ISSUE_LINK_CLASS = "create-jira-issue-link";


function runContent() {
  if (document.querySelector(`.${JIRA_ISSUE_LINK_CLASS}`) !== null) {
    return;
  }

  const commentSelectors = '.js-comments-holder';

  document.querySelectorAll(commentSelectors).forEach(addButton);

  function addButton(commentGroup) {
    const comment = commentGroup.lastElementChild;
    const plural = commentGroup.children.length > 1;

    const createIssueLink = document.createElement('a');
    createIssueLink.className = JIRA_ISSUE_LINK_CLASS;
    createIssueLink.textContent = `Create JIRA task from this ${plural ? "thread" : "comment"}`;
    createIssueLink.style.marginLeft = '10px';
    createIssueLink.href = "javascript:void";
    createIssueLink.onclick = () => openModal(comment);
    comment.appendChild(createIssueLink);
  }

  function openModal(comment) {
    const commentText = comment.querySelector(".comment-body").textContent.trim();
    const modal = document.createElement('dialog');
    modal.id = 'jira-modal';
    modal.innerHTML = `
      <div class="modal-content" style="width: 500px;height: 400px;padding-left:50px;">
        <h2>Create JIRA Task</h2>
        <form id="jira-form">
          <label for="title">Title</label><br/>
          <input type="text" id="title" name="title" required style="width: 400px; margin-bottom: 20px;"/><br/>
          <label for="description">Description</label><br/>
          <textarea id="description" name="description" required style="width: 400px; height: 200px; margin-bottom: 20px;"
          >${commentText}</textarea><br/>
          <button type="submit">Create Task</button>
          <button id="jira-modal-close" aria-label="close" type="reset">Cancel</button>
        </form>
      </div>
    `;
    comment.appendChild(modal);
    modal.showModal()
    
    closeButton = document.getElementById("jira-modal-close");
    closeButton.addEventListener("click", () => modal.close());

    document.getElementById('jira-form').onsubmit = (e) => {
      e.preventDefault();
      console.log("Attempting to create JIRA task")

      const title = document.getElementById('title').value;
      console.log("Title = " + title);
      
      const description = document.getElementById('description').value;

      browser.runtime.sendMessage({
        action: 'createJiraTask',
        title: title,
        description: description,
        comment: {
          text: commentText,
          id: comment.id,
          url: window.location.href,
          directUrl: comment.baseURI
        }
      });

      modal.close();
    };
  }
}


browser.runtime.onMessage.addListener((message) => {
  if (message.action === "gh_pr_comment_posted") {
    if (message.url !== null) {
      window.location.href = message.url;
    } else {
      window.location.reload();
    }
  }
});


if (document.readyState === "loading") {
  // Loading hasn't finished yet
  document.addEventListener("DOMContentLoaded", runContent);
} else {
  runContent();
}
