const demo = document.querySelector('[data-demo]');
const stateButtons = [...document.querySelectorAll('[data-state-controls] button')];
const stateIndex = document.querySelector('#state-index');
const stateNote = document.querySelector('#state-note');
const nameInput = document.querySelector('#demo-name');
const nameError = document.querySelector('#demo-name-error');
const continueButton = document.querySelector('[data-demo-continue]');
const demoForm = document.querySelector('[data-demo-form]');
let saveTimer;

const stateMessages = {
  default: ['State 01 / 05', 'The happy path deserves care. It just doesn’t deserve all of it.', 'A quiet, clear starting point for a job that matters.'],
  focus: ['State 02 / 05', 'The next action should always be obvious, especially without a mouse.', 'Keyboard preview: the dashed border suggests the next field. Press Tab to follow the real focus indicator.'],
  error: ['State 03 / 05', 'Good recovery language helps people move forward without losing confidence.', 'Display name is too short. Use at least 2 characters to continue.'],
  processing: ['State 04 / 05', 'Waiting is part of the experience. Give it a clear, calm shape.', 'Saving your profile. This should only take a moment.'],
  success: ['State 05 / 05', 'Completion should feel final, but leave the next move within reach.', 'Demo complete. Nothing was submitted. You can restart the demo.']
};

function switchState(nextState) {
  if (!demo || !stateMessages[nextState]) return;
  window.clearTimeout(saveTimer);
  const [index, note, message] = stateMessages[nextState];
  demo.dataset.state = nextState;
  stateIndex.textContent = index;
  stateNote.textContent = note;
  document.querySelector('[data-state-message]').textContent = message;
  stateButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.state === nextState)));
  const invalid = nextState === 'error';
  const busy = nextState === 'processing';
  nameInput.setAttribute('aria-invalid', String(invalid));
  nameInput.setAttribute('aria-describedby', invalid ? 'demo-name-hint demo-name-error' : 'demo-name-hint');
  nameError.hidden = !invalid;
  nameInput.readOnly = busy || nextState === 'success';
  demoForm.setAttribute('aria-busy', String(busy));
  // Keep the button focused during saving, while blocking pointer AND keyboard activation.
  continueButton.setAttribute('aria-disabled', String(busy));
  continueButton.textContent = busy ? 'Saving…' : nextState === 'success' ? 'Restart demo' : 'Continue';
}

function saveDemo() {
  switchState('processing');
  saveTimer = window.setTimeout(() => switchState('success'), 1500);
}

if (demo) {
  document.querySelector('[data-state-controls]').hidden = false;
  continueButton.hidden = false;
  nameInput.readOnly = false;
  stateButtons.forEach(button => button.addEventListener('click', () => {
    nameInput.value = button.dataset.state === 'error' ? 'D' : 'Devin';
    if (button.dataset.state === 'processing') saveDemo();
    else switchState(button.dataset.state);
  }));
  continueButton.addEventListener('click', () => {
    if (continueButton.getAttribute('aria-disabled') === 'true') return;
    if (demo.dataset.state === 'success') {
      nameInput.value = 'Devin';
      switchState('default');
      nameInput.focus();
    } else if (nameInput.value.trim().length < 2) {
      switchState('error');
      nameInput.focus();
    } else saveDemo();
  });
  nameInput.addEventListener('input', () => {
    if (demo.dataset.state === 'error' && nameInput.value.trim().length >= 2) switchState('default');
  });
  nameInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      continueButton.click();
    }
  });
}

const filters = [...document.querySelectorAll('[data-filter]')];
const posts = [...document.querySelectorAll('[data-post-list] a')];
const emptyMessage = document.querySelector('#no-posts');
const archiveStatus = document.querySelector('#archive-status');
const archiveFilters = document.querySelector('[data-archive-filters]');
if (archiveFilters) archiveFilters.hidden = false;

filters.forEach((filter) => filter.addEventListener('click', () => {
  const topic = filter.dataset.filter;
  const visible = posts.filter((post) => {
    const tags = (post.dataset.topics || "").split("|");
    const matches = topic === "all" || (topic === "web" ? !tags.includes("react") && !tags.includes("javascript") : tags.includes(topic));
    post.hidden = !matches;
    return matches;
  });
  filters.forEach((button) => {
    const selected = button === filter;
    button.setAttribute('aria-pressed', String(selected));
  });
  if (emptyMessage) emptyMessage.hidden = visible.length > 0;
  if (archiveStatus) {
    const topicName = topic === 'all' ? '' : `${filter.textContent.trim()} `;
    archiveStatus.textContent = `Showing ${visible.length} ${topicName}${visible.length === 1 ? 'article' : 'articles'}.`;
  }
}));
