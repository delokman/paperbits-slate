import * as React from "react";
import * as ReactDOM from "react-dom";
import * as injector from "react-frame-aware-selection-plugin";
import { Editor, Mark, Raw, Data, State } from "slate"
import { Set, Seq, Collection, List, Map } from "immutable";
import { initialState } from "./state";
import { IHyperlink } from "@paperbits/common/permalinks/IHyperlink";
import { SelectionState } from "@paperbits/common/editing/IHtmlEditor";
import { IBag } from "@paperbits/common/core/IBag";

injector();

export class SlateReactComponent extends React.Component<any, any> {
    private static dirtyHack;
    private static DEFAULT_NODE = "paragraph";
    private static DEFAULT_ALIGNMENT = "align-left";
    private static intentionsMap = {};

    private readOnly = true;

    me = null;
    parentElement = null;
    reactElement = null;
    showToolbar = false;

    state = {
        state: Raw.deserialize(initialState, { terse: true }),
        getHrefData: null,
        selectionChangeListeners: [],
        disabledListeners: [],
        enabledListeners: []
    }

    constructor(intentionsMap: Object) {
        super();

        Object.assign(SlateReactComponent.intentionsMap, intentionsMap);

        this.getMyself = this.getMyself.bind(this);
        this.renderToContainer = this.renderToContainer.bind(this);
        this.updateState = this.updateState.bind(this);
        this.getState = this.getState.bind(this);
        this.getSelectionPosition = this.getSelectionPosition.bind(this);
        this.setSelectionPosition = this.setSelectionPosition.bind(this);
        this.addSelectionChangeListener = this.addSelectionChangeListener.bind(this);
        this.removeSelectionChangeListener = this.removeSelectionChangeListener.bind(this);
        this.addDisabledListener = this.addDisabledListener.bind(this);
        this.removeDisabledListener = this.removeDisabledListener.bind(this);
        this.addEnabledListener = this.addEnabledListener.bind(this);
        this.removeEnabledListener = this.removeEnabledListener.bind(this);
        this.notifyListeners = this.notifyListeners.bind(this);
        this.addOpenLinkEditorListener = this.addOpenLinkEditorListener.bind(this);
        this.getSelectionState = this.getSelectionState.bind(this);
        this.getIntentions = this.getIntentions.bind(this);
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
        this.toggleQuote = this.toggleQuote.bind(this);
        this.toggleCode = this.toggleCode.bind(this);
        this.toggleCategory = this.toggleCategory.bind(this);
        this.toggleInlineCategory = this.toggleInlineCategory.bind(this);
        this.toggleBlockCategory = this.toggleBlockCategory.bind(this);
        this.createOrUpdateCategory = this.createOrUpdateCategory.bind(this);
        this.updateCustomMark = this.updateCustomMark.bind(this);
        this.updateCustomBlock = this.updateCustomBlock.bind(this);
        this.toggleAlignment = this.toggleAlignment.bind(this);
        this.toggleColor = this.toggleColor.bind(this);
        this.resetToNormal = this.resetToNormal.bind(this);
        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
        this.setHyperlink = this.setHyperlink.bind(this);
        this.getHyperlink = this.getHyperlink.bind(this);
        this.removeHyperlink = this.removeHyperlink.bind(this);
        this.hasMark = this.hasMark.bind(this);
        this.getMarkData = this.getMarkData.bind(this);
        this.hasBlock = this.hasBlock.bind(this);
        this.has = this.has.bind(this);
        this.isAligned = this.isAligned.bind(this);
        this.findInlineNode = this.findInlineNode.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.toggleMark = this.toggleMark.bind(this);
        this.toggleBlock = this.toggleBlock.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.onClickLink = this.onClickLink.bind(this);
        this.render = this.render.bind(this);
        this.renderEditor = this.renderEditor.bind(this);
        this.createReactElementInternal = this.createReactElementInternal.bind(this);

        if (SlateReactComponent.dirtyHack) {
            let getMyself = SlateReactComponent.dirtyHack;
            this.getMyself = () => this.me ? this.me : (this.me = getMyself());
            SlateReactComponent.dirtyHack = null;
        }
    }

    public getMyself(): SlateReactComponent {
        return this.me;
    }

    public renderToContainer(parentElement: HTMLElement): SlateReactComponent {
        let self = this;

        SlateReactComponent.dirtyHack = () => self.me;

        this.reactElement = React.createElement(SlateReactComponent);
        this.parentElement = parentElement;

        this.me = ReactDOM.render(this.reactElement, parentElement, () => { });

        return this.me;
    }

    public applyState(state): void {
        if (this.getMyself()) {
            this.getMyself().setState({ state });
        }
        else {
            this.setState({ state });
        }
        this.getMyself().forceUpdate();
    }

    public getState(): Object {
        return Raw.serialize(this.getMyself().state.state, { terse: true });
    }

    public updateState(newState: Object): void {
        let state = Raw.deserialize(newState, { terse: true });
        this.getMyself().setState({ state })
    }

    public getSelectionPosition() {
        let state = this.getActualState();

        return {
            "anchorKey": state.selection.anchorKey,
            "anchorOffset": state.selection.anchorOffset,
            "focusKey": state.selection.focusKey,
            "focusOffset": state.selection.focusOffset,
        }
    }

    public setSelectionPosition(selectionPosition, focus) {
        let state = this.getActualState();

        if (focus) {
            state = state.transform().select(selectionPosition).focus().apply();
        }
        else {
            state = state.transform().select(selectionPosition).apply();
        }
        if (this.getMyself()) {
            this.getMyself().setState({ state });
        }
        else {
            this.setState({ state })
        }

        this.getMyself().forceUpdate();
    }

    public addSelectionChangeListener(callback): void {
        let selectionChangeListeners = this.state.selectionChangeListeners;

        selectionChangeListeners.push(callback);

        this.getMyself().setState({ selectionChangeListeners: selectionChangeListeners });
        this.getMyself().forceUpdate();
    }

    public removeSelectionChangeListener(callback): void {
        let selectionChangeListeners = this.state.selectionChangeListeners;

        for (let i = 0; i < selectionChangeListeners.length; i++) {
            if (selectionChangeListeners[i] === callback) {
                selectionChangeListeners.splice(i);
                break;
            }
        }
        this.getMyself().setState({ selectionChangeListeners: selectionChangeListeners });
        this.getMyself().forceUpdate();
    }

    public addDisabledListener(callback): void {
        let { disabledListeners } = this.state;

        disabledListeners.push(callback);

        this.getMyself().setState({ disabledListeners: disabledListeners });
        this.getMyself().forceUpdate();
    }

    public removeDisabledListener(callback): void {
        let { disabledListeners } = this.state;
        for (let i = 0; i < disabledListeners.length; i++) {
            if (disabledListeners[i] === callback) {
                disabledListeners.splice(i);
                break;
            }
        }
        this.getMyself().setState({ disabledListeners: disabledListeners });
        this.getMyself().forceUpdate();
    }

    public addEnabledListener(callback): void {
        let { enabledListeners } = this.state;
        enabledListeners.push(callback);
        this.getMyself().setState({ enabledListeners: enabledListeners });
        this.getMyself().forceUpdate();
    }

    public removeEnabledListener(callback): void {
        let { enabledListeners } = this.state;
        for (let i = 0; i < enabledListeners.length; i++) {
            if (enabledListeners[i] === callback) {
                enabledListeners.splice(i);
                break;
            }
        }
        this.getMyself().setState({ enabledListeners: enabledListeners });
        this.getMyself().forceUpdate();
    }

    public notifyListeners(listeners): void {
        for (let i = 0; i < listeners.length; i++) {
            listeners[i]();
        }
    }

    public addOpenLinkEditorListener(callback): void {
        this.getMyself().setState({ getHrefData: callback });
        this.getMyself().forceUpdate();
    }

    public getSelectionState(): SelectionState {
        const state = {
            bold: this.hasMark("bold"),
            italic: this.hasMark("italic"),
            underlined: this.hasMark("underlined"),
            hyperlink: this.findInlineNode("link"),
            h1: this.hasBlock("heading-one"),
            h2: this.hasBlock("heading-two"),
            h3: this.hasBlock("heading-three"),
            h4: this.hasBlock("heading-four"),
            h5: this.hasBlock("heading-five"),
            h6: this.hasBlock("heading-six"),
            quote: this.hasBlock("block-quote"),
            code: this.hasBlock("code"),
            ol: this.hasBlock("numbered-list"),
            ul: this.hasBlock("bulleted-list"),
            intentions: this.getIntentions(),
            normal: false
        }

        state.normal = !(state.h1 || state.h2 || state.h3 || state.h4 || state.h4 || state.h5 || state.h6 || state.quote || state.code);

        return state;
    }

    private getIntentions(): IBag<string> {
        const result = {};
        const state = this.getActualState();

        state.blocks.forEach(block => {
            const categories = block.data.get("categories");
            Object.assign(result, categories);
        });

        state.marks.forEach(mark => {
            const categories = mark.data.get("categories");
            Object.assign(result, categories);
        })

        return result;
    }

    public toggleBold(): void {
        this.toggleMark("bold");
        this.getMyself().forceUpdate();
    }

    public toggleItalic(): void {
        this.toggleMark("italic");
        this.getMyself().forceUpdate();
    }

    public toggleUnderlined(): void {
        this.toggleMark("underlined");
        this.getMyself().forceUpdate();
    }

    public toggleUl(): void {
        this.toggleBlock("bulleted-list");
        this.getMyself().forceUpdate();
    }

    public toggleOl(): void {
        this.toggleBlock("numbered-list");
        this.getMyself().forceUpdate();
    }

    public toggleH1(): void {
        this.toggleBlock("heading-one");
        this.getMyself().forceUpdate();
    }

    public toggleH2(): void {
        this.toggleBlock("heading-two");
        this.getMyself().forceUpdate();
    }

    public toggleH3(): void {
        this.toggleBlock("heading-three");
        this.getMyself().forceUpdate();
    }

    public toggleH4(): void {
        this.toggleBlock("heading-four");
        this.getMyself().forceUpdate();
    }

    public toggleH5(): void {
        this.toggleBlock("heading-five");
        this.getMyself().forceUpdate();
    }

    public toggleH6(): void {
        this.toggleBlock("heading-six");
        this.getMyself().forceUpdate();
    }

    public toggleQuote(): void {
        this.toggleBlock("block-quote");
        this.getMyself().forceUpdate();
    }

    public toggleCode(): void {
        this.toggleBlock("code");
        this.getMyself().forceUpdate();
    }

    public toggleCategory(category: string, intentionFn: string, type: string): void {
        let nodes;
        let toggle;
        let state = this.getActualState();
        const expand = state.isExpanded;
        const selection = state.selection;

        switch (type) {
            case "block":
                nodes = state.blocks;
                toggle = this.toggleBlockCategory
                break
            case "inline":
                nodes = state.texts;
                toggle = this.toggleInlineCategory
                break
            default:
                throw new Error("Unexpected type value: " + type)
        }

        nodes.forEach(function (node) {
            state = state.transform().moveToRangeOf(node).apply();

            if (state.selection.startKey == selection.startKey &&
                state.selection.startOffset < selection.startOffset ||
                state.selection.endKey == selection.endKey &&
                state.selection.endOffset > selection.endOffset) {

                const newSelection = {
                    anchorKey: state.selection.startKey,
                    anchorOffset: state.selection.startOffset,
                    focusKey: state.selection.endKey,
                    focusOffset: state.selection.endOffset
                }

                if (state.selection.startKey == selection.startKey && state.selection.startOffset < selection.startOffset) {
                    newSelection.anchorKey = selection.startKey
                    newSelection.anchorOffset = selection.startOffset
                }

                if (state.selection.endKey == selection.endKey && state.selection.endOffset > selection.endOffset) {
                    newSelection.focusKey = selection.endKey
                    newSelection.focusOffset = selection.endOffset
                }

                state = state.transform().select(newSelection).apply();
            }
            state = toggle(state, node, category, intentionFn, type);
        }, this);

        if (expand) {
            state = state
                .transform()
                .select(selection)
                .focus()
                .apply();
        }

        this.getMyself() ? this.getMyself().setState({ state: state }) : this.setState({ state: state });
        this.getMyself().forceUpdate();
    }

    public toggleInlineCategory(state, node, category: string, intentionFn: string) {
        let data;

        if (state.marks.some(m => m.type == "custom")) {
            state.marks.forEach(mark => {
                if (mark) {
                    data = mark.data
                }

                let newData = this.createOrUpdateCategory(data, category, intentionFn);

                state = this.updateCustomMark(state, data, newData, mark);
            })
        }
        else {
            const newData = this.createOrUpdateCategory(null, category, intentionFn);

            state = this.updateCustomMark(state, data, newData);
        }
        return state;
    }

    public toggleBlockCategory(state, node, category: string, intentionFn: string) {
        const data = node.data;
        const newData = this.createOrUpdateCategory(data, category, intentionFn);

        return this.updateCustomBlock(state, newData);
    }

    public createOrUpdateCategory(data, category: string, intentionFn: string) {
        if (!data) {
            if (!intentionFn) {
                return null;
            }

            let categories = {};
            categories[category] = intentionFn

            return Data.create({ categories: categories });
        }

        let categories = data.get("categories");

        if (!categories) {
            if (!intentionFn) {
                return data;
            }

            categories = {};
            categories[category] = intentionFn

            return data.set("categories", categories)
        }

        if (!categories[category]) {
            if (!intentionFn) {
                return data;
            }

            categories = JSON.parse(JSON.stringify(categories))
            categories[category] = intentionFn
            return data.set("categories", categories)
        }

        if ((categories[category] == intentionFn || !intentionFn)) {
            categories = JSON.parse(JSON.stringify(categories))
            delete categories[category]
            return data.set("categories", categories)
        }

        categories = JSON.parse(JSON.stringify(categories))
        categories[category] = intentionFn

        return data.set("categories", categories);
    }

    private updateCustomMark(state, data, newData, mark?): any {
        if (mark) {
            state = state
                .transform()
                .removeMarkAtRange(state.selection, { type: "custom", data: data })
                .toggleMarkAtRange(state.selection, { type: "custom", data: newData })
                .apply();
        }
        else {
            state = state
                .transform()
                .toggleMarkAtRange(state.selection, { type: "custom", data: newData })
                .apply();
        }
        return state;
    }

    private updateCustomBlock(state, newData) {
        let block = state.blocks.find(_ => true);

        state = state.transform()
            .setBlock({
                type: block.type,
                nodes: block.nodes,
                data: newData,
                isVoid: block.isVoid,
                key: block.key
            })
            .apply()

        return state;
    }

    public toggleAlignment(intentionFn): void {
        this.toggleCategory("alignment", intentionFn, "block")
    }

    public toggleColor(intentionFn): void {
        this.toggleCategory("color", intentionFn, "inline")
    }

    public resetToNormal(): void {
        this.hasBlock("heading-one") && this.toggleH1(),
            this.hasBlock("heading-two") && this.toggleH2(),
            this.hasBlock("heading-three") && this.toggleH3(),
            this.hasBlock("heading-four") && this.toggleH4(),
            this.hasBlock("heading-five") && this.toggleH5(),
            this.hasBlock("heading-six") && this.toggleH6(),
            this.hasBlock("block-quote") && this.toggleQuote(),
            this.hasBlock("code") && this.toggleCode();

        let state = this.getActualState();

        state.blocks.forEach(block => {
            if (block.type == "custom") {
                state = state.transform().unwrapBlock(block.type, block.data).apply()
            }
        })

        state.marks.forEach(mark => {
            if (mark.type == "custom") {
                state = state.transform().removeMark(mark).apply()
            }
        })


        if (this.getMyself()) {
            this.getMyself().setState({ state });
        }
        else {
            this.setState({ state })
        }

        this.getMyself().forceUpdate();
    }

    public enable(): void {
        this.readOnly = false;
        this.getMyself().forceUpdate();
    }

    public disable(): void {
        this.readOnly = true;
        this.clearSelection();
    }

    private getActualState(): State {
        let { state } = this.getMyself() ? this.getMyself().state : this.state;

        return state;
    }

    public clearSelection(): void {
        let state = this.getActualState();

        state = state.transform().blur().apply();

        this.applyState(state);
    }

    public getSelectionText(): string {
        const state = this.getActualState();
        return state.texts._tail.array.map(x => x.text).join("");
    }

    public expandSelection(): void {
        let state = this.getActualState();

        const linkNode = this.findInlineNode("link");

        if (linkNode) {
            state = state
                .transform()
                .moveToRangeOf(linkNode)
                .focus()
                .apply();

            this.applyState(state);
        }
    }

    public setSelection(selection): void {
        if (!selection.anchorNode || !selection.focusNode) {
            return;
        }

        let anchorKey = selection.anchorNode.parentElement.parentElement.attributes.getNamedItem("data-key");
        let focusKey = selection.focusNode.parentElement.parentElement.attributes.getNamedItem("data-key");

        if (!anchorKey || !focusKey) {
            return;
        }

        let newSelection = {
            anchorKey: anchorKey.value,
            anchorOffset: selection.anchorOffset,
            focusKey: focusKey.value,
            focusOffset: selection.focusOffset,
            isFocused: true
        }

        let state = this.getActualState();

        state = state.transform().select(newSelection).apply();

        this.applyState(state);
    }

    public setHyperlink(hyperlink: IHyperlink): void {
        let state = this.getActualState();

        const hasLink = this.findInlineNode("link");

        let selection = state.selection;

        if (!selection.isExpanded) {
            return;
        }

        if (hasLink) {
            state = state
                .transform()
                .unwrapInlineAtRange(selection, "link")
                .apply();
        }

        state = state.transform()
            .wrapInline(
            {
                type: "link",
                data: {
                    href: hyperlink.href,
                    target: hyperlink.target,
                    permalinkKey: hyperlink.permalinkKey
                }
            })
            .apply();

        let link = state.inlines.find(node => node.type == "link");

        if (link) {
            state = state.transform()
                .moveToRangeOf(link)
                .focus()
                .apply();
        }

        this.applyState(state);
    }

    public getHyperlink(): IHyperlink {
        const state = this.getActualState();
        const hasInline = this.findInlineNode("link");
        const link = state.inlines.find(node => node.type == "link");

        if (!link) {
            return null;
        }

        const hyperlink: any = {};
        const dataEntries = link.data._root.entries;

        for (let i = 0; i < dataEntries.length; i++) {
            hyperlink[dataEntries[i][0]] = dataEntries[i][1];
        }

        return hyperlink;
    }

    public removeHyperlink(): void {
        let state = this.getActualState();
        const linkNode = this.findInlineNode("link");

        if (linkNode) {
            state = state
                .transform()
                .unwrapInline("link")
                .apply();

            this.applyState(state);
        }
    }

    /**
     * Check if the current selection has a mark with `type` in it.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private hasMark(type): boolean {
        let state = this.getActualState();
        return state.marks.some(mark => mark.type == type)
    }

    private getMarkData(type) {
        const state = this.getActualState();
        const mark = state.marks.first(function (e) {
            return e.type == type
        });

        if (mark) {
            var style = mark.data.get("style");
            return style ? style : null
        }
        return null
    }

    /**
     * Check if the any of the currently selected blocks are of `type`.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private hasBlock(type): boolean {
        let state = this.getActualState();
        return state.blocks.some(node => node.type == type)
    }

    /**
     * Check if the any of the currently selected blocks have the same data.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private has(type): boolean {
        const state = this.getActualState();
        return state.blocks.some(node => node.type == type)
    }

    /**
     * Check if the any of the currently selected blocks has alignment of `type`.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private isAligned(type): boolean {
        const state = this.getActualState();
        return state.blocks.some(node => node.data.get("alignment") == type)
    }

    /**
     * Check if the any of the currently selected inlines are of `type`.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private findInlineNode(type): any {
        const state = this.getActualState();
        return state.inlines.find(node => node.type == type)
    }

    private onSelectionChange(selection, state): void {
        this.getMyself().setState({ state });
        this.getMyself().state.state = state;
        this.getMyself().forceUpdate();
        this.notifyListeners(this.getMyself().state.selectionChangeListeners);
    }

    /**
     * On change, save the new state.
     *
     * @param {State} state
     */
    public onChange(state): void {
        this.setState({ state });
    }

    /**
     * On key down, if it"s a formatting command toggle a mark.
     *
     * @param {Event} e
     * @param {Object} data
     * @param {State} state
     * @return {State}
     */
    private onKeyDown(e, data, state) {
        if (!data.isMod)
            return;

        let mark;

        switch (data.key) {
            case "b":
                mark = "bold";
                break;
            case "i":
                mark = "italic";
                break;
            case "u":
                mark = "underlined";
                break;
            case "`":
                mark = "code";
                break;
            default:
                return;
        }

        state = state
            .transform()
            .toggleMark(mark)
            .apply();

        e.preventDefault();

        return state;
    }

    public toggleMark(type: string): void {
        let state = this.getActualState();
        const expand = state.isExpanded;
        const selection = state.selection

        state = state
            .transform()
            .toggleMark(type)
            .apply();

        if (expand) {
            state = state
                .transform()
                .select(selection)
                .apply();
        }

        if (this.getMyself()) {
            this.getMyself().setState({ state });
        }
        else {
            this.setState({ state })
        }
    }

    private toggleBlock(type: string): void {
        let state = this.getActualState();
        let transform = state.transform();

        const { document } = state;

        // Handle everything but list buttons.
        if (type != "bulleted-list" && type != "numbered-list") {
            const isActive = this.hasBlock(type);
            const isList = this.hasBlock("list-item");

            if (isList) {
                transform = transform
                    .setBlock({ type: isActive ? SlateReactComponent.DEFAULT_NODE : type })
                    .unwrapBlock("bulleted-list")
                    .unwrapBlock("numbered-list")
            }
            else {
                transform = transform
                    .setBlock({ type: isActive ? SlateReactComponent.DEFAULT_NODE : type })
            }
        }

        // Handle the extra wrapping required for list buttons.
        else {
            const isList = this.hasBlock("list-item");
            const isType = state.blocks.some((block) => {
                return !!document.getClosest(block, parent => parent.type == type)
            });

            if (isList && isType) {
                transform = transform
                    .setBlock({ type: SlateReactComponent.DEFAULT_NODE })
                    .unwrapBlock("bulleted-list")
                    .unwrapBlock("numbered-list")
            }
            else if (isList) {
                transform = transform
                    .unwrapBlock(type == "bulleted-list" ? "numbered-list" : "bulleted-list")
                    .wrapBlock(type)
            }
            else {
                transform = transform
                    .setBlock({ type: "list-item" })
                    .wrapBlock(type)
            }
        }

        state = transform.apply();

        if (this.getMyself()) {
            this.getMyself().setState({ state });
        }
        else {
            this.setState({ state })
        }
    }

    /**
     * On paste, if the text is a link, wrap the selection in a link.
     *
     * @param {Event} e
     * @param {Object} data
     * @param {State} state
     */
    public onPaste(e, data, state) {
        if (state.isCollapsed) {
            return;
        }

        if (data.type != "text" && data.type != "html") {
            return;
        }

        let transform = state.transform();
        let { anchorOffset } = state.selection;

        return transform
            .wrapInline({
                type: "link",
                data: {
                    href: data.text
                }
            })
            .moveToOffsets(anchorOffset, anchorOffset + data.text.length)
            .apply()
    }

    public onClickLink(): void {
        let state = this.getActualState();

        if (!state.isExpanded) {
            return;
        }

        let { anchorOffset, focusOffset } = state.selection;

        const hasLink = this.findInlineNode("link");

        if (hasLink) {
            state = state
                .transform()
                .unwrapInline("link")
                .apply()
        }

        const hrefData = this.getMyself().state.getHrefData();

        state = state
            .transform()
            .wrapInline({
                type: "link",
                data: hrefData
            })
            .moveToOffsets(anchorOffset, focusOffset)
            .apply();

        this.setState({ state })
    }

    /**
     * Render.
     *
     * @return {Element}
     */
    public render(): JSX.Element {
        return this.renderEditor();
    }

    /**
     * Render the Slate editor.
     *
     * @return {Element}
     */
    public renderEditor(): JSX.Element {
        let editor = <Editor
            placeholder={"Enter some rich text..."}
            state={this.state.state}
            schema={this.Configuration.Schema}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            onPaste={this.onPaste}
            readOnly={this.readOnly}
            spellCheck={false}
            onSelectionChange={this.onSelectionChange}
        />;

        return editor
    }











    private createReactElement(tagName) {
        return properties => {
            return this.createReactElementInternal(tagName, properties);
        }
    }

    private createReactElementInternal(tagName: string, properties: any): JSX.Element {
        const data = properties.mark ? properties.mark.data : properties.node.data;
        const categories = data.get("categories");

        if (!categories) {
            return React.createElement(tagName, properties.attributes, properties.children);
        }

        const attributes = properties.attributes || {};

        // TODO: Make universal!!!
        const classNameCategoryKeys = Object.keys(categories).filter(x => x !== "anchorKey" && x !== "anchorId");

        if (classNameCategoryKeys.length > 0) {
            const className = classNameCategoryKeys
                .map(category => categories[category])
                .map(intentionKey => {
                    const intentionFunc = SlateReactComponent.intentionsMap[intentionKey];

                    if (!intentionFunc) {
                        console.warn(`Could not find intention with key ${intentionKey}`);
                        return "";
                    }

                    return intentionFunc();
                })
                .join(" ");

            Object.assign(attributes, { className: className });
        }

        // TODO: Switch to node.data
        const anchorCategoryKey = Object.keys(categories).find(x => x === "anchorId");

        if (anchorCategoryKey) {
            const id = categories[anchorCategoryKey];

            Object.assign(attributes, { id: id });
        }

        return properties.children ? React.createElement(tagName, attributes, properties.children) : React.createElement(tagName, attributes);
    }

    private createLinkElement() {
        return properties => {
            const { data } = properties.node;
            const href = data.get("href");
            const target = data.get("target");

            Object.assign(properties.attributes, { href: href, target: target });

            return this.createReactElementInternal("a", properties);
        }
    }

    private Configuration = {
        IntentionsMap: {},
        Schema: {
            nodes: {
                "block-quote": this.createReactElement("blockquote"),
                "bulleted-list": this.createReactElement("ul"),
                "heading-one": this.createReactElement("h1"),
                "heading-two": this.createReactElement("h2"),
                "heading-three": this.createReactElement("h3"),
                "heading-four": this.createReactElement("h4"),
                "heading-five": this.createReactElement("h5"),
                "heading-six": this.createReactElement("h6"),
                "list-item": this.createReactElement("li"),
                "numbered-list": this.createReactElement("ol"),
                "link": this.createLinkElement(),
                "code": this.createReactElement("pre"),
                "paragraph": this.createReactElement("p"),
                "custom": this.createReactElement("div")
            },
            marks: {
                bold: this.createReactElement("b"),
                italic: this.createReactElement("i"),
                underlined: this.createReactElement("u"),
                custom: this.createReactElement("span")
            }
        }
    }
}