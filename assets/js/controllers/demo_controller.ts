import { Controller } from '@hotwired/stimulus';

type DemoState = 'default' | 'focus' | 'error' | 'processing' | 'success';

/** Index label, design note, and the message shown inside the demo. */
type StateCopy = readonly [string, string, string];

const STATE_COPY: Record<DemoState, StateCopy> = {
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
  value !== undefined && value in STATE_COPY;

// A local, interactive demo of the interface states the section talks about.
// Nothing is submitted; saving is simulated.
export default class extends Controller<HTMLElement> {
  static override targets = [
    'controls',
    'panel',
    'index',
    'note',
    'message',
    'name',
    'error',
    'continue',
    'form',
    'stateButton',
  ];

  declare readonly controlsTarget: HTMLElement;
  declare readonly panelTarget: HTMLElement;
  declare readonly indexTarget: HTMLElement;
  declare readonly noteTarget: HTMLElement;
  declare readonly messageTarget: HTMLElement;
  declare readonly nameTarget: HTMLInputElement;
  declare readonly errorTarget: HTMLElement;
  declare readonly continueTarget: HTMLButtonElement;
  declare readonly formTarget: HTMLElement;
  declare readonly stateButtonTargets: HTMLButtonElement[];

  private saveTimer?: number;

  override connect(): void {
    // The switcher and the editable field only exist once JavaScript runs.
    this.controlsTarget.hidden = false;
    this.continueTarget.hidden = false;
    this.nameTarget.readOnly = false;
  }

  override disconnect(): void {
    window.clearTimeout(this.saveTimer);
  }

  choose(event: Event): void {
    const button = event.currentTarget;
    if (!(button instanceof HTMLElement)) return;
    const next = button.dataset.state;
    this.nameTarget.value = next === 'error' ? 'D' : 'Devin';
    if (next === 'processing') this.save();
    else this.switchTo(next);
  }

  advance(): void {
    if (this.continueTarget.getAttribute('aria-disabled') === 'true') return;
    if (this.panelTarget.dataset.state === 'success') {
      this.nameTarget.value = 'Devin';
      this.switchTo('default');
      this.nameTarget.focus();
    } else if (this.nameTarget.value.trim().length < 2) {
      this.switchTo('error');
      this.nameTarget.focus();
    } else this.save();
  }

  revalidate(): void {
    if (
      this.panelTarget.dataset.state === 'error' &&
      this.nameTarget.value.trim().length >= 2
    )
      this.switchTo('default');
  }

  submitOnEnter(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    this.continueTarget.click();
  }

  private save(): void {
    this.switchTo('processing');
    this.saveTimer = window.setTimeout(() => this.switchTo('success'), 1500);
  }

  private switchTo(next: string | undefined): void {
    if (!isDemoState(next)) return;
    window.clearTimeout(this.saveTimer);
    const [index, note, message] = STATE_COPY[next];
    this.panelTarget.dataset.state = next;
    this.indexTarget.textContent = index;
    this.noteTarget.textContent = note;
    this.messageTarget.textContent = message;
    this.stateButtonTargets.forEach((button) =>
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.state === next),
      ),
    );
    const invalid = next === 'error';
    const busy = next === 'processing';
    this.nameTarget.setAttribute('aria-invalid', String(invalid));
    this.nameTarget.setAttribute(
      'aria-describedby',
      invalid ? 'demo-name-hint demo-name-error' : 'demo-name-hint',
    );
    this.errorTarget.hidden = !invalid;
    this.nameTarget.readOnly = busy || next === 'success';
    this.formTarget.setAttribute('aria-busy', String(busy));
    // Keep the button focused during saving, while blocking pointer AND keyboard activation.
    this.continueTarget.setAttribute('aria-disabled', String(busy));
    this.continueTarget.textContent = busy
      ? 'Saving…'
      : next === 'success'
        ? 'Restart demo'
        : 'Continue';
  }
}
