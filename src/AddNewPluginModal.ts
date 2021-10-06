import { Modal, Notice, Setting } from 'obsidian';
import BetaPlugins from './BetaPlugins';
import ThePlugin from './main';
import { existBetaPluginInList } from './settings';

/**
 * Add a beta plugin to the list of plugins being tracked and updated
 */
export default class AddNewPluginModal extends Modal {
    plugin: ThePlugin;
    betaPlugins: BetaPlugins;
    address: string;
    openSettingsTabAfterwards: boolean;

    constructor(plugin: ThePlugin, betaPlugins: BetaPlugins, openSettingsTabAfterwards = false) {
        super(plugin.app);
        this.plugin = plugin;
        this.betaPlugins = betaPlugins;
        this.address = "";
        this.openSettingsTabAfterwards = openSettingsTabAfterwards;
    }

    async submitForm(): Promise<void> {
        if (this.address === "") return;
        const scrubbedAddress = this.address.replace("https://github.com/","");
        if (await existBetaPluginInList(this.plugin, scrubbedAddress)) {
            new Notice(`BRAT\nThis plugin is already in the list for beta testing`, 20000);
            return;
        }
        const result = await this.betaPlugins.addPlugin(scrubbedAddress);
        if (result) {
            this.close();
        }
    }

    onOpen(): void {
        this.contentEl.createEl('h4', { text: "Github repository for beta plugin:" });
        this.contentEl.createEl('form', {}, (formEl) => {
            new Setting(formEl)
                .addText((textEl) => {
                    textEl.setPlaceholder('Repository (example: TfTHacker/obsidian-brat');
                    textEl.onChange((value) => {
                        this.address = value.trim();
                    });
                    textEl.inputEl.addEventListener('keydown', async (e: KeyboardEvent) => {
                        if (e.key === 'Enter' && this.address !== ' ') {
                            e.preventDefault();
                            await this.submitForm();
                        }
                    });
                    textEl.inputEl.style.width = "100%";
                    window.setTimeout(() => {
                        const title = document.querySelector(".setting-item-info");
                        if (title) title.remove();
                        textEl.inputEl.focus()
                    }, 10);
                });

            formEl.createDiv('modal-button-container', (buttonContainerEl) => {
                buttonContainerEl
                    .createEl('button', { attr: { type: 'button' }, text: 'Never mind' })
                    .addEventListener('click', () => this.close());
                buttonContainerEl.createEl('button', {
                    attr: { type: 'submit' },
                    cls: 'mod-cta',
                    text: 'Add Plugin',
                });
            });

            // invoked when button is clicked. 
            formEl.addEventListener('submit', async (e: Event) => {
                e.preventDefault();
                if (this.address !== '') await this.submitForm();
            });
        });
    }
    
    async onClose(): Promise<void> {
        console.log('close',this.openSettingsTabAfterwards)
        if(this.openSettingsTabAfterwards) {
            //@ts-ignore
            await this.plugin.app.setting.open();
            //@ts-ignore
            await this.plugin.app.setting.openTabById("obsidian42-brat");
        }

    }
}