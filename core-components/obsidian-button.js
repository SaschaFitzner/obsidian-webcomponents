class ObsidianButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Styling (similar to before, could be externalized later)
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: inline-block;
                vertical-align: middle;
            }
            button {
                padding: 0.5em 1em;
                margin: 0 0.2em;
                border: 1px solid var(--interactive-accent, #4a90e2);
                background-color: var(--interactive-accent, #4a90e2);
                color: white;
                border-radius: 4px;
                cursor: pointer;
                font-size: inherit;
                transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
                line-height: 1.2;
                text-align: center;
            }
            button:hover:not([disabled]) {
                background-color: var(--interactive-accent-hover, #357abd);
                border-color: var(--interactive-accent-hover, #357abd);
            }
            button:active:not([disabled]) {
                 background-color: var(--interactive-accent-active, #2a6194);
                 border-color: var(--interactive-accent-active, #2a6194);
            }
            button[disabled] {
                background-color: var(--background-modifier-disabled, #ccc);
                border-color: var(--background-modifier-disabled, #ccc);
                cursor: not-allowed;
                opacity: 0.6;
            }
        `;

        // Button Element
        this._button = document.createElement('button');

        // Slot for the button label/content
        this._slot = document.createElement('slot');
        this._button.appendChild(this._slot); // Put the slot inside the button

        this.shadowRoot.append(style, this._button);

        // Click listener
        this._button.addEventListener('click', (e) => {
            if (this.hasAttribute('disabled')) {
                e.stopPropagation();
                return;
            }
            this.dispatchEvent(new CustomEvent('obsidian-button-click', { bubbles: true, composed: true }));
            console.log(`ObsidianButton (WC) clicked! Label: "${this.textContent.trim()}"`);
        });
    }

    // Observe disabled attribute
    static get observedAttributes() {
        return ['disabled'];
    }

    // Update component when attributes change
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'disabled') {
            this._button.disabled = newValue !== null;
        }
    }

    // Set initial state
    connectedCallback() {
        // console.log('ObsidianButton (WC) connected');
        this._button.disabled = this.hasAttribute('disabled');
        // No need to handle text attribute, slot handles content
    }

    disconnectedCallback() {
        // console.log('ObsidianButton (WC) disconnected');
    }

     // Expose disabled property
    get disabled() { return this.hasAttribute('disabled'); }
    set disabled(value) { value ? this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }
}

// Define the custom element globally
// This script needs to be executed in the global context
if (!customElements.get('obsidian-button')) {
    console.log('Defining obsidian-button (WC) custom element...');
    customElements.define('obsidian-button', ObsidianButton);
} else {
    // console.log('obsidian-button (WC) custom element already defined.');
}