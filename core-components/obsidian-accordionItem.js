class ObsidianAccordionItem extends HTMLElement {
    _titleElement = null;
    _contentElement = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    border-bottom: 1px solid var(--accordion-border-color, var(--divider-color, #ccc));
                    /* Last item border is handled by the parent ::slotted selector */
                }
                .title {
                    padding: 1rem;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: var(--accordion-title-bg-distinct, var(--background-secondary-alt, #e9e9e9));
                    user-select: none;
                    transition: background-color 0.2s ease-in-out;
                }
                .title:hover {
                    background-color: var(--accordion-title-hover-bg-distinct, var(--background-modifier-hover, #ddd));
                }
                .icon {
                    transition: transform 0.3s ease-out;
                    width: 1em;
                    height: 1em;
                    flex-shrink: 0;
                    stroke: var(--accordion-icon-color, var(--text-muted));
                    margin-left: 0.5em;
                }
                :host([open]) .icon {
                    transform: rotate(90deg);
                }
                .content {
                    background-color: var(--accordion-content-bg-obsidian, var(--background-primary, #fff));
                    padding: 0 1.5rem; /* Collapsed padding */
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-out, padding 0.3s ease-out, border-top 0.3s ease-out;
                    box-sizing: border-box;
                    border-top: 1px solid transparent; /* Prepare for border when open */
                }
                :host([open]) .content {
                    padding: 1.5rem; /* Expanded padding */
                    max-height: 1000px; /* Adjust as needed */
                    transition: max-height 0.3s ease-out, padding 0.3s ease-out, border-top 0.3s ease-out;
                    border-top: 1px solid var(--accordion-border-color, var(--divider-color, #ccc)); /* Add top border when open */
                }
            </style>
            <div class="item-container">
                <div class="title" part="title">
                    <slot name="title">Default Title</slot> <!-- Named slot for title -->
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>
                <div class="content" part="content">
                    <slot></slot> <!-- Default slot for content -->
                </div>
            </div>
        `;

        this._titleElement = this.shadowRoot.querySelector('.title');
        this._contentElement = this.shadowRoot.querySelector('.content');
    }

    static get observedAttributes() {
        return ['open', 'title']; // Observe 'title' attribute as well
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'open') {
            // Reflect state visually (CSS does this via :host([open]))
            // console.log(`AccordionItem ${this.title}: open attribute changed to ${this.hasAttribute('open')}`);
        }
        if (name === 'title') {
            // If the title attribute changes, update the named slot if it's empty or default
            this._updateTitleSlot(newValue);
        }
    }

    connectedCallback() {
        // console.log(`AccordionItem ${this.title}: connected`);
        if (!this._titleElement) return;

        // Add click listener to title
        this._titleElement.removeEventListener('click', this._toggleOpen); // Prevent duplicates
        this._titleElement.addEventListener('click', this._toggleOpen);

        // Set initial title if attribute exists and slot is empty/default
        if (this.hasAttribute('title')) {
            this._updateTitleSlot(this.getAttribute('title'));
        }
    }

    disconnectedCallback() {
        // console.log(`AccordionItem ${this.title}: disconnected`);
        if (this._titleElement) {
            this._titleElement.removeEventListener('click', this._toggleOpen);
        }
    }

    _toggleOpen = () => {
        this.toggleAttribute('open');
    }

    _updateTitleSlot(newTitle) {
        // Check if a slot element with name="title" exists
        let titleSlot = this.querySelector('[slot="title"]');

        // If title attribute is set AND no title slot exists OR existing slot is empty/default
        if (newTitle !== null && (!titleSlot || titleSlot.textContent.trim() === 'Default Title' || titleSlot.textContent.trim() === '')) {
             // If an old slot exists (even the default one), remove it
             if (titleSlot) {
                 this.removeChild(titleSlot);
             }
             // Create and append the new title slot from the attribute
             const newTitleSpan = document.createElement('span');
             newTitleSpan.setAttribute('slot', 'title');
             newTitleSpan.textContent = newTitle;
             this.appendChild(newTitleSpan);
        }
        // If title attribute is removed/null, and we created a span previously, remove it?
        // Or let the default slot show "Default Title"? Let default show for now.
    }

    // Allow setting open state programmatically
    set open(value) { value ? this.setAttribute('open', '') : this.removeAttribute('open'); }
    get open() { return this.hasAttribute('open'); }

    // Allow setting title programmatically
    set title(value) { this.setAttribute('title', value); }
    get title() { return this.getAttribute('title'); }
}

// Define the custom element globally
if (!customElements.get('obsidian-accordion-item')) {
    console.log('Defining obsidian-accordion-item (WC) custom element...');
    customElements.define('obsidian-accordion-item', ObsidianAccordionItem);
}