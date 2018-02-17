import "es6-shim";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { SlateReactComponent, SlateReactComponentParameters } from "./slateReactComponent";
import { IEventManager } from "@paperbits/common/events/IEventManager";
import { IHyperlink } from "@paperbits/common/permalinks/IHyperlink";
import { IPermalinkService } from "@paperbits/common/permalinks/IPermalinkService";
import { IHtmlEditor, SelectionState, HtmlEditorEvents } from "@paperbits/common/editing/IHtmlEditor";
import { Intention } from "../../paperbits-common/src/appearance/intention";

export class SlateHtmlEditor implements IHtmlEditor {
    private readonly eventManager: IEventManager;
    private readonly permalinkService: IPermalinkService;
    private slateReactComponent: SlateReactComponent;
    private readonly intentions: any;

    constructor(eventManager: IEventManager, intentionsProvider: any) {
        // initialization...
        this.eventManager = eventManager;

        this.intentions = intentionsProvider.getIntentions();

        // rebinding...
        this.getSelectionState = this.getSelectionState.bind(this);
        this.toggleBold = this.toggleBold.bind(this);
        this.toggleItalic = this.toggleItalic.bind(this);
        this.toggleUnderlined = this.toggleUnderlined.bind(this);
        this.toggleUl = this.toggleUl.bind(this);
        this.toggleOl = this.toggleOl.bind(this);
        this.toggleH1 = this.toggleH1.bind(this);
        this.toggleH2 = this.toggleH2.bind(this);
        this.toggleH3 = this.toggleH3.bind(this);
        this.toggleH4 = this.toggleH4.bind(this);
        this.toggleH5 = this.toggleH5.bind(this);
        this.toggleH6 = this.toggleH6.bind(this);
        this.toggleCode = this.toggleCode.bind(this);
        this.toggleQuote = this.toggleQuote.bind(this);
        this.getHyperlink = this.getHyperlink.bind(this);
        this.setHyperlink = this.setHyperlink.bind(this);
        this.removeHyperlink = this.removeHyperlink.bind(this);
        this.disable = this.disable.bind(this);
        this.renderToContainer = this.renderToContainer.bind(this);
    }

    public renderToContainer(element: HTMLElement): void {
        try {
            const props: SlateReactComponentParameters = {
                parentElement: element,
                instanceSupplier: (slate: SlateReactComponent) => { this.slateReactComponent = slate; },
                intentions: this.intentions
            }

            const reactElement = React.createElement(SlateReactComponent, props);

            this.slateReactComponent = ReactDOM.render(reactElement, element)
        }
        catch (error) {
            debugger;
        }
    }

    public getSelectionState(): SelectionState {
        const state = this.slateReactComponent.getSelectionState();

        state.normal = !state.h1 && !state.h2 && !state.h3 && !state.h4 && !state.h5 && !state.h6 && !state.code && !state.quote;

        return state;
    }

    public getState(): Object {
        let state = this.slateReactComponent.getState();
        return state;
    }

    public setState(state: Object): void {
        this.slateReactComponent.updateState(state);
    }

    public toggleBold(): void {
        this.slateReactComponent.toggleBold();
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleItalic(): void {
        this.slateReactComponent.toggleItalic();
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleUnderlined(): void {
        this.slateReactComponent.toggleUnderlined();
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleUl(): void {
        this.slateReactComponent.toggleUl();
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleOl(): void {
        this.slateReactComponent.toggleOl();
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleH1(): void {
        this.slateReactComponent.toggleH1();
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleH2(): void {
        this.slateReactComponent.toggleH2();
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleH3(): void {
        this.slateReactComponent.toggleH3();
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleH4(): void {
        this.slateReactComponent.toggleH4();
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleH5(): void {
        this.slateReactComponent.toggleH5();
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleH6(): void {
        this.slateReactComponent.toggleH6();
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public setHyperlink(data: IHyperlink): void {
        this.slateReactComponent.setHyperlink(data);
    }

    public getHyperlink(): IHyperlink {
        return this.slateReactComponent.getHyperlink();
    }

    public removeHyperlink(): void {
        this.slateReactComponent.removeHyperlink();
    }

    public toggleQuote(): void {
        this.slateReactComponent.toggleQuote();
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleCode(): void {
        this.slateReactComponent.toggleCode();
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleIntention(intention: Intention): void {
        this.slateReactComponent.toggleIntention(intention);
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public setIntention(intention: Intention): void {
        this.slateReactComponent.setIntention(intention);
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public resetToNormal(): void {
        this.slateReactComponent.resetToNormal();
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public enable(): void {
        this.slateReactComponent.enable();
    }

    public disable(): void {
        this.slateReactComponent.disable();
    }

    public addSelectionChangeListener(callback: (htmlEditor: IHtmlEditor) => void): void {
        let callbackWrapper = () => {
            callback(this);
        }

        this.slateReactComponent.addSelectionChangeListener(callbackWrapper);
    }

    public removeSelectionChangeListener(callback: () => void): void {
        this.slateReactComponent.removeSelectionChangeListener(callback);
    }

    public setSelection(selection: Selection): void {
        this.slateReactComponent.setSelection(selection);
    }

    public expandSelection(): void {
        this.slateReactComponent.expandSelection();
    }

    public getSelectionText(): string {
        return this.slateReactComponent.getSelectionText();
    }

    public removeAllIntentions(): void {
        return this.slateReactComponent.removeAllIntentions();
    }
}