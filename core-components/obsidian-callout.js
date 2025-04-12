class ObsidianCallout extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Styling
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block; /* Changed to flex below */
                border-radius: 6px;
                margin-bottom: 1em;
                position: relative; /* Needed for close button */
                overflow: hidden;
                border-left: 5px solid; /* Default border color */
                background-color: var(--background-secondary);
                color: var(--text-normal);
                padding: 1em; /* Keep general padding */
                display: flex; /* Use flex for host */
                align-items: flex-start; /* Align icon and text container at the top */
                gap: 0.8em; /* Gap between icon and text */
            }

            /* Removed .callout-container styles, host is now the flex container */
            .callout-text-content { /* New wrapper for title and content */
                 display: flex;
                 flex-direction: column;
                 flex-grow: 1; /* Takes remaining space */
            }

            .callout-header {
                display: flex;
                align-items: center;
                margin-bottom: 0.5em;
                font-weight: bold;
            }

            .callout-icon {
                /* Removed absolute positioning */
                flex-shrink: 0; /* Prevent icon from shrinking */
                width: 1.3em;   /* Slightly larger icon */
                height: 1.3em;
                fill: currentColor;
                margin-top: 0.1em; /* Fine-tune vertical alignment */
                /* margin-right is handled by host gap */
            }

            .callout-title {
                flex-grow: 1;
                /* margin-left removed */
            }

            .callout-content {
                 /* margin-left removed */
                 /* Add some space below title if content exists */
                 margin-top: 0.3em;
            }

            .close-button {
                position: absolute;
                top: 0.5em;
                right: 0.5em;
                background: none;
                border: none;
                font-size: 1.2em;
                cursor: pointer;
                color: inherit;
                padding: 0.2em;
                line-height: 1;
            }
            .close-button:hover {
                opacity: 0.7;
            }

            /* Type Variants */
            :host([type="neutral"]) {
                border-left-color: var(--callout-neutral-border, #607d8b); /* Slate Gray */
                background-color: var(--callout-neutral-bg, rgba(96, 125, 139, 0.1));
            }
            :host([type="neutral"]) .callout-icon { color: var(--callout-neutral-icon, #607d8b); }

            :host([type="positive"]), :host([type="success"]) { /* Alias success */
                border-left-color: var(--callout-positive-border, #4CAF50); /* Green */
                background-color: var(--callout-positive-bg, rgba(76, 175, 80, 0.1));
            }
             :host([type="positive"]) .callout-icon, :host([type="success"]) .callout-icon { color: var(--callout-positive-icon, #4CAF50); }

            :host([type="warning"]) {
                border-left-color: var(--callout-warning-border, #FF9800); /* Orange */
                background-color: var(--callout-warning-bg, rgba(255, 152, 0, 0.1));
            }
             :host([type="warning"]) .callout-icon { color: var(--callout-warning-icon, #FF9800); }

            :host([type="critical"]), :host([type="error"]) { /* Alias error */
                border-left-color: var(--callout-critical-border, #F44336); /* Red */
                background-color: var(--callout-critical-bg, rgba(244, 67, 54, 0.1));
            }
             :host([type="critical"]) .callout-icon, :host([type="error"]) .callout-icon {
                 color: var(--callout-critical-icon, #F44336);
                 width: 1.7em; /* Further increase size for critical/error */
                 height: 1.7em; /* Further increase size for critical/error */
                 margin-top: -0.1em; /* Adjust top margin to pull up slightly */
             }

             /* Filled Variants */
            :host([type="neutral"][filled]) {
                background-color: var(--callout-neutral-filled-bg, #CFD8DC); /* Lighter Slate Gray */
                color: var(--callout-neutral-filled-text, #263238); /* Darker Slate Gray */
                border-left-color: var(--callout-neutral-filled-border, #607d8b);
            }
            :host([type="neutral"][filled]) .callout-icon { color: var(--callout-neutral-filled-icon, #37474F); }
            :host([type="neutral"][filled]) .close-button { color: var(--callout-neutral-filled-icon, #37474F); }


            :host([type="positive"][filled]), :host([type="success"][filled]) {
                background-color: var(--callout-positive-filled-bg, #4CAF50); /* Green */
                color: var(--callout-positive-filled-text, white);
                border-left-color: var(--callout-positive-filled-border, #388E3C); /* Darker Green */
            }
            :host([type="positive"][filled]) .callout-icon, :host([type="success"][filled]) .callout-icon { color: var(--callout-positive-filled-icon, white); }
            :host([type="positive"][filled]) .close-button, :host([type="success"][filled]) .close-button { color: var(--callout-positive-filled-icon, white); }


            :host([type="warning"][filled]) {
                background-color: var(--callout-warning-filled-bg, #FF9800); /* Orange */
                color: var(--callout-warning-filled-text, white);
                border-left-color: var(--callout-warning-filled-border, #F57C00); /* Darker Orange */
            }
            :host([type="warning"][filled]) .callout-icon { color: var(--callout-warning-filled-icon, white); }
            :host([type="warning"][filled]) .close-button { color: var(--callout-warning-filled-icon, white); }


            :host([type="critical"][filled]), :host([type="error"][filled]) {
                background-color: var(--callout-critical-filled-bg, #F44336); /* Red */
                color: var(--callout-critical-filled-text, white);
                border-left-color: var(--callout-critical-filled-border, #D32F2F); /* Darker Red */
            }
            :host([type="critical"][filled]) .callout-icon, :host([type="error"][filled]) .callout-icon { color: var(--callout-critical-filled-icon, white); }
            :host([type="critical"][filled]) .close-button, :host([type="error"][filled]) .close-button { color: var(--callout-critical-filled-icon, white); }


            /* Hide close button if not closable */
            :host(:not([closable])) .close-button {
                display: none;
            }
        `;

        // Structure
        // Create the main text content container
        this._textContentContainer = document.createElement('div');
        this._textContentContainer.classList.add('callout-text-content');

        this._icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this._icon.classList.add('callout-icon');
        this._icon.setAttribute('viewBox', '0 0 24 24'); // Default viewBox, might be overridden
        this._iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._icon.appendChild(this._iconPath);

        this._header = document.createElement('div');
        this._header.classList.add('callout-header');

        this._titleSlot = document.createElement('slot');
        this._titleSlot.name = 'title';
        this._titleSlot.classList.add('callout-title');
        this._titleSlot.textContent = this.getAttribute('title') || 'Info'; // Default title

        this._header.append(this._titleSlot);

        this._contentSlot = document.createElement('slot');
        this._contentSlot.classList.add('callout-content'); // Default slot for content

        this._closeButton = document.createElement('button');
        this._closeButton.classList.add('close-button');
        this._closeButton.innerHTML = '&times;'; // Simple 'x'
        this._closeButton.setAttribute('aria-label', 'Close');
        this._closeButton.addEventListener('click', () => this.close());

        // Append header and content to the text container
        this._textContentContainer.append(this._header, this._contentSlot);

        // Append icon, text container, and close button to shadow root
        // The host element itself is now the flex container
        this.shadowRoot.append(style, this._icon, this._textContentContainer, this._closeButton);

        this._updateIcon(); // Initial icon setup
    }

    // Observe attributes
    static get observedAttributes() {
        return ['type', 'title', 'closable', 'filled', 'icon'];
    }

    // Update component when attributes change
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'title' && oldValue !== newValue) {
            // If title slot is not used, update the default title text
            if (!this.querySelector('[slot="title"]')) {
                 this._titleSlot.textContent = newValue || 'Info';
            }
        } else if (name === 'type' && oldValue !== newValue) {
            this._updateIcon();
        } else if (name === 'icon' && oldValue !== newValue) {
             this._updateIcon(); // Allow custom icon override
        }
        // 'closable' and 'filled' are handled by CSS selectors
    }

    // Set initial state
    connectedCallback() {
        // Set initial title if not provided via slot
        if (!this.querySelector('[slot="title"]') && this.hasAttribute('title')) {
            this._titleSlot.textContent = this.getAttribute('title');
        }
        this._updateIcon(); // Ensure icon is correct on connect
    }

    disconnectedCallback() {
        // console.log('ObsidianCallout (WC) disconnected');
    }

    // Method to close/hide the callout
    close() {
        this.style.display = 'none';
        this.dispatchEvent(new CustomEvent('obsidian-callout-close', { bubbles: true, composed: true }));
        // Optional: Remove the element entirely after animation/delay
        // setTimeout(() => this.remove(), 300);
    }

    _updateIcon() {
        const type = this.getAttribute('type')?.toLowerCase() || 'neutral';
        const customIcon = this.getAttribute('icon');
        let iconPathData = '';
        let viewBox = '0 0 24 24'; // Default

        if (customIcon) {
            // Basic check if it looks like SVG path data
            if (customIcon.startsWith('M') || customIcon.startsWith('m')) {
                iconPathData = customIcon;
            } else {
                // Potentially handle named icons or URLs later
                console.warn(`Custom icon format for "${customIcon}" not recognized. Provide SVG path data.`);
                // Fallback to type icon
            }
        }

        if (!iconPathData) {
            switch (type) {
                case 'positive':
                case 'success':
                    // Checkmark icon
                    iconPathData = "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z";
                    break;
                case 'warning':
                    // Warning triangle icon
                    iconPathData = "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z";
                    break;
                case 'critical':
                case 'error':
                    // Error circle icon
                    // New icon: Circle with exclamation mark (similar to info/error_outline)
                    iconPathData = "M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z";
                    break;
                case 'neutral':
                default:
                    // Person/Info icon (similar to screenshot)
                    viewBox = '0 0 512 512'; // Adjust viewBox for this icon
                    iconPathData = "M256 288c79.5 0 144-64.5 144-144S335.5 0 256 0 112 64.5 112 144s64.5 144 144 144zm-94.7 32C72.2 320 0 392.2 0 481.3c0 17 13.7 30.7 30.7 30.7h450.6c17 0 30.7-13.7 30.7-30.7 0-89.1-72.2-161.3-161.3-161.3H161.3z";
                    break;
            }
        }

        this._iconPath.setAttribute('d', iconPathData);
        this._icon.setAttribute('viewBox', viewBox);
    }

     // --- Properties (Optional) ---
    get type() { return this.getAttribute('type'); }
    set type(value) { this.setAttribute('type', value); }

    get title() { return this.getAttribute('title'); }
    set title(value) { this.setAttribute('title', value); }

    get closable() { return this.hasAttribute('closable'); }
    set closable(value) { value ? this.setAttribute('closable', '') : this.removeAttribute('closable'); }

    get filled() { return this.hasAttribute('filled'); }
    set filled(value) { value ? this.setAttribute('filled', '') : this.removeAttribute('filled'); }

    get icon() { return this.getAttribute('icon'); }
    set icon(value) { this.setAttribute('icon', value); }
}

// Define the custom element globally
if (!customElements.get('obsidian-callout')) {
    console.log('Defining obsidian-callout (WC) custom element...');
    customElements.define('obsidian-callout', ObsidianCallout);
} else {
    // console.log('obsidian-callout (WC) custom element already defined.');
}