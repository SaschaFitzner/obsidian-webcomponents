const { Plugin, TFolder, TFile } = require('obsidian');

const COMPONENTS_FOLDER = 'Components'; // Name of the folder in the vault root

class WebcomponentsPlugin extends Plugin { // Renamed class

    componentScripts = []; // To keep track of added script elements

    async onload() {
        console.log('Loading Webcomponents plugin'); // Updated log

        // Defer script loading until layout is ready
        this.app.workspace.onLayoutReady(async () => {
            // console.log("Workspace layout ready, loading component scripts..."); // Removed log
            await this.loadComponentScripts();
        });

        // Register the code block processor immediately
        this.registerMarkdownCodeBlockProcessor("webcomponents", (source, el, ctx) => {
            // Processor logic starts

            // Create a container div
            const container = el.createDiv();

            // Set the innerHTML of the container to the source code.
            // This is where the browser parses the HTML and should initialize
            // the web component if its definition is known.
            // Removed component-specific checks to keep the wrapper generic.
            // It's assumed the necessary component definitions were loaded by loadComponentScripts.
            // If a component tag is used in the block but wasn't defined,
            // the browser will likely render it as an unknown element without erroring here.

            try {
                container.innerHTML = source;
                // Successfully set innerHTML
            } catch (error) {
                 console.error("Error setting innerHTML for webcomponent block:", error);
                 container.setText(`Error rendering webcomponent: ${error.message}`);
            }
        });

        // Watch for changes in the components folder (Advanced: requires more complex handling)
        // For simplicity, we only load on startup for now. Reload Obsidian to see changes.
        // this.registerEvent(this.app.vault.on('modify', this.handleFileModify));
    }

    async loadComponentScripts() {
        // console.log(`Wrapper: Looking for components in folder: ${COMPONENTS_FOLDER}`); // Removed log
        const componentsFolder = this.app.vault.getAbstractFileByPath(COMPONENTS_FOLDER);

        if (componentsFolder instanceof TFolder) {
            const filesToLoad = [];
            await this.findJsFilesRecursive(componentsFolder, filesToLoad);

            // console.log(`Wrapper: Found ${filesToLoad.length} JS files to load.`); // Removed log

            // Remove previously added scripts if any (e.g., during plugin reload)
            this.removeComponentScripts();

            for (const file of filesToLoad) {
                try {
                    const content = await this.app.vault.read(file);
                    this.injectScript(file.path, content);
                } catch (error) {
                    console.error(`Wrapper: Error reading or injecting script ${file.path}:`, error);
                }
            }
        } else {
            console.warn(`Webcomponents: Components folder "${COMPONENTS_FOLDER}" not found or is not a folder.`); // Updated log
        }
    }

    // Helper function to recursively find JS files
    async findJsFilesRecursive(folder, fileList) {
        for (const child of folder.children) {
            if (child instanceof TFile && child.extension === 'js') {
                fileList.push(child);
            } else if (child instanceof TFolder) {
                // If you want recursive loading, uncomment the next line:
                // await this.findJsFilesRecursive(child, fileList);
            }
        }
    }

    injectScript(filePath, content) {
        // console.log(`Wrapper: Injecting script ${filePath}`); // Removed log
        const scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.textContent = content;
        scriptElement.dataset.webcomponentSource = filePath; // Mark the source
        document.head.appendChild(scriptElement);
        this.componentScripts.push(scriptElement); // Keep track
    }

    removeComponentScripts() {
        // console.log(`Wrapper: Removing ${this.componentScripts.length} previously injected scripts.`); // Removed log
        this.componentScripts.forEach(script => script.remove());
        this.componentScripts = []; // Clear the array
    }


    onunload() {
        console.log('Unloading Webcomponents plugin'); // Updated log
        this.removeComponentScripts(); // Clean up added scripts
    }

    // Example handler if watching for file changes (more complex logic needed for reload)
    // async handleFileModify(file) {
    //     if (file.path.startsWith(COMPONENTS_FOLDER + '/') && file.extension === 'js') {
    //         console.log(`Wrapper: Detected modification in ${file.path}. Reloading components...`);
    //         // Simple reload for now: requires full Obsidian reload or more sophisticated script handling
    //         await this.loadComponentScripts();
    //     }
    // }
}

module.exports = WebcomponentsPlugin; // Renamed export