const demo = document.querySelector('[data-demo]');
const stateButtons = [...document.querySelectorAll('[data-state-controls] button')];
const stateIndex = document.querySelector('#state-index');
const stateNote = document.querySelector('#state-note');

const stateMessages = {
  default: ['State 01 / 05', 'The happy path deserves care. It just doesn’t deserve all of it.', 'A quiet, clear starting point for a job that matters.'],
  focus: ['State 02 / 05', 'The next action should always be obvious—especially without a mouse.', 'A visible focus path makes the interface navigable by keyboard.'],
  error: ['State 03 / 05', 'Good recovery language helps people move forward without losing confidence.', 'An input needs a little more detail before you can continue.'],
  processing: ['State 04 / 05', 'Waiting is part of the experience. Give it a clear, calm shape.', 'Saving your profile. This should only take a moment.'],
  success: ['State 05 / 05', 'Completion should feel final, but leave the next move within reach.', 'Your profile is ready. Next: set your preferences.']
};

function switchState(nextState) {
  if (!demo || !stateMessages[nextState]) return;
  const [index, note, message] = stateMessages[nextState];
  demo.dataset.state = nextState;
  stateIndex.textContent = index;
  stateNote.textContent = note;
  document.querySelector('[data-state-message]').textContent = message;
  stateButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.state === nextState)));
}

stateButtons.forEach((button) => button.addEventListener('click', () => switchState(button.dataset.state)));

const filters = [...document.querySelectorAll('[data-filter]')];
const posts = [...document.querySelectorAll('[data-post-list] a')];
const emptyMessage = document.querySelector('#no-posts');

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
}));
