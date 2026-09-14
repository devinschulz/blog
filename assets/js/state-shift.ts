type DemoState = 'default' | 'focus' | 'error' | 'processing' | 'success';

/** Index label, design note, and the message shown inside the demo. */
type StateCopy = readonly [string, string, string];

const demo = document.querySelector<HTMLElement>('[data-demo]');
const stateControls = document.querySelector<HTMLElement>(
  '[data-state-controls]',
);
const stateButtons = [
  ...document.querySelectorAll<HTMLButtonElement>(
    '[data-state-controls] button',
  ),
];
const stateIndex = document.querySelector<HTMLElement>('#state-index');
const stateNote = document.querySelector<HTMLElement>('#state-note');
const stateMessage = document.querySelector<HTMLElement>(
  '[data-state-message]',
);
const nameInput = document.querySelector<HTMLInputElement>('#demo-name');
const nameError = document.querySelector<HTMLElement>('#demo-name-error');
const continueButton = document.querySelector<HTMLButtonElement>(
  '[data-demo-continue]',
);
const demoForm = document.querySelector<HTMLElement>('[data-demo-form]');
let saveTimer: number | undefined;

const stateMessages: Record<DemoState, StateCopy> = {
  default: [
    'State 01 / 05',
    'The happy path deserves care. It just doesn’t deserve all of it.',
    'A quiet, clear starting point for a job that matters.',
  ],
  focus: [
    'State 02 / 05',
    'The next action should always be obvious, especially without a mouse.',
    'Keyboard preview: the dashed border suggests the next field. Press Tab to follow the real focus indicator.',
  ],
  error: [
    'State 03 / 05',
    'Good recovery language helps people move forward without losing confidence.',
    'Display name is too short. Use at least 2 characters to continue.',
  ],
  processing: [
    'State 04 / 05',
    'Waiting is part of the experience. Give it a clear, calm shape.',
    'Saving your profile. This should only take a moment.',
  ],
  success: [
    'State 05 / 05',
    'Completion should feel final, but leave the next move within reach.',
    'Demo complete. Nothing was submitted. You can restart the demo.',
  ],
};

const isDemoState = (value: string | undefined): value is DemoState =>
  value !== undefined && value in stateMessages;

function switchState(nextState: string | undefined): void {
  // One guard for the whole demo: without every part of it on the page there
  // is nothing to switch, which is the case on every page but the home page.
  if (
    !demo ||
    !isDemoState(nextState) ||
    !stateIndex ||
    !stateNote ||
    !stateMessage ||
    !nameInput ||
    !nameError ||
    !continueButton ||
    !demoForm
  )
    return;
  window.clearTimeout(saveTimer);
  const [index, note, message] = stateMessages[nextState];
  demo.dataset.state = nextState;
  stateIndex.textContent = index;
  stateNote.textContent = note;
  stateMessage.textContent = message;
  stateButtons.forEach((button) =>
    button.setAttribute(
      'aria-pressed',
      String(button.dataset.state === nextState),
    ),
  );
  const invalid = nextState === 'error';
  const busy = nextState === 'processing';
  nameInput.setAttribute('aria-invalid', String(invalid));
  nameInput.setAttribute(
    'aria-describedby',
    invalid ? 'demo-name-hint demo-name-error' : 'demo-name-hint',
  );
  nameError.hidden = !invalid;
  nameInput.readOnly = busy || nextState === 'success';
  demoForm.setAttribute('aria-busy', String(busy));
  // Keep the button focused during saving, while blocking pointer AND keyboard activation.
  continueButton.setAttribute('aria-disabled', String(busy));
  continueButton.textContent = busy
    ? 'Saving…'
    : nextState === 'success'
      ? 'Restart demo'
      : 'Continue';
}

function saveDemo(): void {
  switchState('processing');
  saveTimer = window.setTimeout(() => switchState('success'), 1500);
}

if (demo && stateControls && continueButton && nameInput) {
  stateControls.hidden = false;
  continueButton.hidden = false;
  nameInput.readOnly = false;
  stateButtons.forEach((button) =>
    button.addEventListener('click', () => {
      nameInput.value = button.dataset.state === 'error' ? 'D' : 'Devin';
      if (button.dataset.state === 'processing') saveDemo();
      else switchState(button.dataset.state);
    }),
  );
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
    if (demo.dataset.state === 'error' && nameInput.value.trim().length >= 2)
      switchState('default');
  });
  nameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      continueButton.click();
    }
  });
}

const filters = [
  ...document.querySelectorAll<HTMLButtonElement>('[data-filter]'),
];
const posts = [
  ...document.querySelectorAll<HTMLAnchorElement>('[data-post-list] a'),
];
const emptyMessage = document.querySelector<HTMLElement>('#no-posts');
const archiveStatus = document.querySelector<HTMLElement>('#archive-status');
const archiveFilters = document.querySelector<HTMLElement>(
  '[data-archive-filters]',
);
if (archiveFilters) archiveFilters.hidden = false;

filters.forEach((filter) =>
  filter.addEventListener('click', () => {
    const topic = filter.dataset.filter ?? '';
    const visible = posts.filter((post) => {
      const tags = (post.dataset.topics || '').split('|');
      const matches =
        topic === 'all' ||
        (topic === 'web'
          ? !tags.includes('react') && !tags.includes('javascript')
          : tags.includes(topic));
      post.hidden = !matches;
      return matches;
    });
    filters.forEach((button) => {
      const selected = button === filter;
      button.setAttribute('aria-pressed', String(selected));
    });
    if (emptyMessage) emptyMessage.hidden = visible.length > 0;
    if (archiveStatus) {
      const topicName =
        topic === 'all' ? '' : `${(filter.textContent ?? '').trim()} `;
      archiveStatus.textContent = `Showing ${visible.length} ${topicName}${visible.length === 1 ? 'article' : 'articles'}.`;
    }
  }),
);
