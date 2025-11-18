interface ElementInfo {
    tagName: string;
    attributes: {
        name: string;
        value: string;
    }[];
    computedStyles?: {
        [key: string]: string;
    };
}
declare class AttributeViewer {
    private isActive;
    private lastSelectedElement;
    private infoPanel;
    private overlay;
    constructor();
    private init;
    private injectStyles;
    private createOverlay;
    private activate;
    private deactivate;
    private handleClick;
    private shouldIgnoreElement;
    private showElementInfo;
    private getElementInfo;
    private extractRedditPostData;
    private displayPanel;
    private closePanel;
    private clearHighlight;
    private escapeHtml;
}
//# sourceMappingURL=content.d.ts.map