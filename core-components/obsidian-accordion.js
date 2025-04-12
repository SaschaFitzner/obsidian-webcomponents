class ObsidianAccordion extends HTMLElement {
    constructor() {
        super();
        // Optional: Attach shadow DOM if you need specific styles for the container itself
        // For a simple container, light DOM might be sufficient.
        // Let's add a shadow DOM for consistency and potential future styling.
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    border: 1px solid var(--accordion-border-color, var(--divider-color, #ccc));
                    border-radius: 5px;
                    margin-bottom: 1.5rem;
                    overflow: hidden; /* Ensures children adhere to border-radius */
                }
                /* Remove bottom border from the last slotted item */
                ::slotted(obsidian-accordion-item:last-child) {
                   border-bottom: none;
                }
            </style>
            <slot></slot> <!-- Default slot for accordion items -->
        `;
    }

    connectedCallback() {
        // console.log('ObsidianAccordion (WC) connected');
    }
}

// Define the custom element globally
if (!customElements.get('obsidian-accordion')) {
    console.log('Defining obsidian-accordion (WC) custom element...');
    customElements.define('obsidian-accordion', ObsidianAccordion);
}