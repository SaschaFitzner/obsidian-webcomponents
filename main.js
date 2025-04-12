const { Plugin, TFolder, TFile, PluginSettingTab, Setting } = require('obsidian');

// Default settings structure
const DEFAULT_SETTINGS = {
    userComponentsPath: 'components' // Default folder in vault root
};

// Path for core components within the plugin directory
const CORE_COMPONENTS_SUBFOLDER = 'core-components';

class WebcomponentsPlugin extends Plugin {
    settings;
    componentScripts = []; // To keep track of added script elements

    async onload() {
        console.log('Loading Webcomponents plugin');
        // Use a global flag to prevent loading in the same window session across enable/disable
        if (window.__webcomponents_plugin_scripts_loaded) {
            console.log("Webcomponents: Scripts already loaded in this window session. Skipping load on enable.");
            // Ensure scripts are removed if they somehow exist from a failed previous load?
            // Or assume they are correctly loaded if flag is true. Let's assume they are loaded.
            // We still need to register the processor etc., so don't return early from onload.
        } else {
             console.log("Webcomponents: Scripts not yet loaded in this window session.");
        }

        // Load settings first
        await this.loadSettings();

        // Add the settings tab
        this.addSettingTab(new WebcomponentsSettingTab(this.app, this));

        // Defer script loading until layout is ready
        this.app.workspace.onLayoutReady(async () => {
            console.log("Workspace layout ready, attempting to load component scripts if needed...");
            // Only load if the global flag isn't set
            if (!window.__webcomponents_plugin_scripts_loaded) {
                await this.loadComponentScripts();
            } else {
                 console.log("Webcomponents: Skipping script load on layout ready as global flag is set.");
                 // Ensure componentScripts array is populated if plugin was disabled/enabled
                 // This might be needed if other parts rely on this array, though removeComponentScripts clears it.
                 // Let's re-query the DOM for our scripts if the flag is set.
                 this.findExistingScripts();
            }
        });

        // Register the code block processor immediately
        this.registerMarkdownCodeBlockProcessor("webcomponents", (source, el, ctx) => {
            // Processor logic starts
            const container = el.createDiv();
            try {
                container.innerHTML = source;
                // Successfully set innerHTML
            } catch (error) {
                 console.error("Error setting innerHTML for webcomponent block:", error);
                 container.setText(`Error rendering webcomponent: ${error.message}`);
            }
        });
    }

    async loadComponentScripts() {
        // Double check the global flag here as well, although onload should prevent this call if set.
        if (window.__webcomponents_plugin_scripts_loaded) {
             console.warn("Webcomponents: loadComponentScripts called but global flag is already set. Skipping.");
             return;
        }
        console.log("Webcomponents: Proceeding with script loading..."); // Add log for clarity
        // Clear previously injected scripts first (still useful if loading fails midway?)
        this.removeComponentScripts();
        let filesToLoad = [];

        // --- Load Core Components ---
        // --- Load Core Components using Adapter API ---
        const coreFilesToLoad = [];
        const coreComponentsPath = `${this.manifest.dir}/${CORE_COMPONENTS_SUBFOLDER}`;
        console.log(`Webcomponents: Attempting to list core components via adapter in: ${coreComponentsPath}`);
        try {
            const adapter = this.app.vault.adapter;
            const listResult = await adapter.list(coreComponentsPath);

            if (listResult && listResult.files) {
                 const coreJsFiles = listResult.files.filter(filePath => filePath.toLowerCase().endsWith('.js'));
                 console.log(`Webcomponents: Found ${coreJsFiles.length} potential core component files via adapter:`, coreJsFiles);
                 // Need to read these files using the adapter as well
                 for (const filePath of coreJsFiles) {
                     try {
                         const content = await adapter.read(filePath);
                         // Store path and content for later injection
                         coreFilesToLoad.push({ path: filePath, content: content });
                     } catch (readError) {
                         console.error(`Webcomponents: Error reading core component file ${filePath} via adapter:`, readError);
                     }
                 }
                 filesToLoad.push(...coreFilesToLoad); // Add successfully read files to the main list
            } else {
                 console.warn(`Webcomponents: adapter.list did not return files for core components path: ${coreComponentsPath}`);
            }
        } catch (error) {
             console.warn(`Webcomponents: Error listing core components path "${coreComponentsPath}" via adapter:`, error);
             // This likely means the folder doesn't exist or isn't accessible yet
        }


        // --- Load User Components (using Vault API - seems to work for vault paths) ---
        const userPath = this.settings.userComponentsPath.trim();
        const userFilesToLoad = []; // Keep track separately for logging/injection
         if (userPath) {
            console.log(`Webcomponents: Looking for user components in vault path: ${userPath}`);
            const userComponentsFolder = this.app.vault.getAbstractFileByPath(userPath);

            if (userComponentsFolder instanceof TFolder) {
                const userJsFiles = [];
                await this.findJsFilesRecursive(userComponentsFolder, userJsFiles); // Use Vault API helper here
                console.log(`Webcomponents: Found ${userJsFiles.length} user component files.`);
                // Read user files using Vault API
                for (const file of userJsFiles) {
                     try {
                         const content = await this.app.vault.read(file);
                         userFilesToLoad.push({ path: file.path, content: content });
                     } catch (readError) {
                         console.error(`Webcomponents: Error reading user component file ${file.path}:`, readError);
                     }
                }
            } else {
                console.warn(`Webcomponents: User components folder "${userPath}" not found or is not a folder.`);
            }
        } else {
             console.log(`Webcomponents: No user components path configured.`);
        }

        // --- Inject all found scripts (Core + User) ---
        const allFilesToInject = [...coreFilesToLoad, ...userFilesToLoad];
        console.log(`Webcomponents: Total component files to inject: ${allFilesToInject.length}`);
        // Remove previously added scripts before injecting new ones
        this.removeComponentScripts();
        for (const fileData of allFilesToInject) {
             this.injectScript(fileData.path, fileData.content);
        }
        // Set the global flag ONLY after successful injection of all scripts
        window.__webcomponents_plugin_scripts_loaded = true;
        console.log("Webcomponents: Script loading finished and global flag set.");
    }

    // Helper function to recursively find JS files using Vault API (for User Components)
    async findJsFilesRecursive(folder, fileList) {
        for (const child of folder.children) {
            if (child instanceof TFile && child.extension === 'js') {
                // Avoid adding duplicates if core/user paths overlap somehow
                if (!fileList.some(f => f.path === child.path)) {
                     fileList.push(child);
                }
            } else if (child instanceof TFolder) {
                // Enable recursive loading if desired
                // await this.findJsFilesRecursive(child, fileList); // Keep recursion disabled for now
            }
        }
    }

    injectScript(filePath, content) {
        // Check if component is already defined BEFORE injecting the script containing its class definition
        // This requires parsing the tag name from the file content or path, which is fragile.
        // Example: Extract class name like 'ObsidianButton' and check customElements.get('obsidian-button')
        // Let's stick to the global flag approach for now, as checking inside injectScript is complex.

        console.log(`Webcomponents: Injecting script ${filePath}`); // Log injection attempt
        // console.log(`Webcomponents: Injecting script ${filePath}`); // Keep this less verbose
        const scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.textContent = content;
        scriptElement.dataset.webcomponentSource = filePath; // Mark the source
        document.head.appendChild(scriptElement);
        this.componentScripts.push(scriptElement); // Keep track
    }

    removeComponentScripts() {
        // console.log(`Webcomponents: Removing ${this.componentScripts.length} previously injected scripts.`);
        this.componentScripts.forEach(script => script.remove());
        this.componentScripts = []; // Clear the array
    }
    onunload() {
        console.log('Unloading Webcomponents plugin');
        // DO NOT reset the global flag here. It should persist for the window session.
        // Only remove the script elements from the DOM.
        this.removeComponentScripts(); // Clean up added scripts
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        // Reload components after saving settings - need to reset the flag first
        console.log("Webcomponents: Settings saved, resetting load flag and reloading scripts.");
        window.__webcomponents_plugin_scripts_loaded = false; // Allow reload after settings change
        await this.loadComponentScripts();
    }
    // Helper to find existing script tags if plugin is re-enabled
    findExistingScripts() {
        this.componentScripts = []; // Clear array first
        const existingScripts = document.head.querySelectorAll('script[data-webcomponent-source]');
        existingScripts.forEach(script => {
            this.componentScripts.push(script);
        });
        console.log(`Webcomponents: Found ${this.componentScripts.length} existing script tags on re-enable.`);
    }
} // End of WebcomponentsPlugin class

// Settings Tab Class (Ensure this is outside the main plugin class)
class WebcomponentsSettingTab extends PluginSettingTab {
    plugin;

    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Webcomponents Settings' });

        new Setting(containerEl)
            .setName('User Components Folder')
            .setDesc('Path to the folder in your vault containing your custom web component .js files (e.g., components or scripts/wc). Leave empty to load only core components.')
            .addText(text => text
                .setPlaceholder(DEFAULT_SETTINGS.userComponentsPath)
                .setValue(this.plugin.settings.userComponentsPath)
                .onChange(async (value) => {
                    this.plugin.settings.userComponentsPath = value.trim();
                    await this.plugin.saveSettings(); // saveSettings now handles flag reset + reload
                }));
    }
}

module.exports = WebcomponentsPlugin;