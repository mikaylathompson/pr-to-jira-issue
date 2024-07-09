const JIRA_ISSUE_LINK_CLASS = "create-jira-issue-link";

function issueLinkAlreadyPresent(commentGroup) {
  return (commentGroup.querySelector(`.${JIRA_ISSUE_LINK_CLASS}`) !== null)
}

function runContent() {
  console.log("Running content.js");

  document.querySelectorAll('.js-comments-holder').forEach(addButton);

  function addButton(commentGroup) {
    if (issueLinkAlreadyPresent(commentGroup)) {
      return;
    }
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
    closeButton.addEventListener("click", () => {
      document.getElementById('jira-modal').close();
      document.getElementById('jira-modal').remove();
    });

    // I'm querying from within the modal object because there's the possibility of
    // having closed but not deleted a different modal object, and that would cause
    // unexpected values to be submitted.
    modal.querySelector("#jira-form").onsubmit = (e) => {
      e.preventDefault();
      console.log("Attempting to create JIRA task")

      const title = modal.querySelector("#title").value;
      console.log("Title = " + title);
      
      const description = modal.querySelector("#description").value;

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

  // This is github specific stuff because they don't do a full DOM reload when switching tabs.
  // Set up mutation observer for changes to the `turbo-frame` element, and then rerun content script
  // if the `complete` attribute is set.
  const observer = new MutationObserver((mutationList, records) => {
      var rerunContent = false;
      mutationList.forEach((mutationRecord) => {
        // I'm specifically looking for a mutation to the complete atttribute that makes it non-null.
        if (mutationRecord.type != "attributes") {
          return;
        }
        if (mutationRecord.attributeName != "complete") {
          return;
        }
        if (mutationRecord.target.getAttribute(mutationRecord.attributeName) === null) {
          return;
        }
        console.log("Found a mutation that necessitates a reload.");
        rerunContent = true;
      })

      if (rerunContent) {
        runContent()
      }
    });
  const turbo = document.querySelector("turbo-frame");
  observer.observe(turbo, { attributes: true, childList: false, subtree: false });
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
