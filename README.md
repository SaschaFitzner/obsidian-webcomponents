# Obsidian Web Components Plugin

This plugin allows you to load and use custom web components within your Obsidian notes. It provides a way to extend Obsidian's rendering capabilities with standard web technologies.

## Features

*   **Load Custom Web Components:** Loads JavaScript files (`.js`) defining custom elements from a specified folder within your vault.
*   **Core Components:** Includes a set of pre-built core components (like `obsidian-accordion`, `obsidian-accordion-item`, `obsidian-button`) ready to use.
*   **User Components Folder:** Configure the path to your custom components folder via the plugin settings tab (Default: `components` in your vault root).
*   **Markdown Code Block:** Use the `webcomponents` code block processor to render HTML containing your loaded web components directly in your notes.

## How to Use

1.  **Install the Plugin:** Place the plugin files into your vault's `.obsidian/plugins/` directory.
2.  **Enable the Plugin:** Enable "Webcomponents" in the Obsidian Community Plugins settings.
3.  **(Optional) Configure User Components:**
    *   Go to Settings -> Community Plugins -> Webcomponents -> Settings Tab.
    *   Enter the path to the folder in your vault where your custom `.js` web component files are located (e.g., `my-components`).
    *   Create your web component files (e.g., `my-components/my-element.js`) defining your custom elements using standard Web Component APIs (`customElements.define(...)`).
4.  **Use in Notes:** Create a `webcomponents` code block in your Markdown notes and write the HTML that uses your loaded components:

```html
    ```webcomponents
        <obsidian-accordion>
        <obsidian-accordion-item title="First Item">
            Content for the first item.
        </obsidian-accordion-item>
        <obsidian-accordion-item title="Second Item" open>
            Content for the second item. <obsidian-button>Click Me</obsidian-button>
        </obsidian-accordion-item>
        <!-- Use your custom components here -->
        <my-element>Hello from my component!</my-element>
        </obsidian-accordion>
    ```
```

The plugin will load the necessary JavaScript files and render the HTML within the code block.

## Development Notes

*   The plugin loads component scripts once per Obsidian window session to avoid re-declaration errors when the plugin is disabled and re-enabled.
*   Core components are loaded from the `core-components` subfolder within the plugin directory.
*   User components are loaded from the path specified in the settings.

Copyright (c) 2025 fitznerIO GmbH - Sascha Fitzner