declare function checkDeepFake(imageUrl: string): Promise<boolean>;
declare function isNewsFake(news: {
    text?: string;
    image?: string;
}): Promise<boolean>;
declare class AttributeViewer {
    private checkedImages;
    private checkedTitles;
    constructor();
    private setupHoverListeners;
    private isRelevantImage;
    private checkNewsWithImageAndText;
    private checkNewsWithTextOnly;
    private showTitleCheckingMessage;
    private showTitleWarning;
    private checkImageIfNeeded;
    private showCheckingMessage;
    private showWarning;
}
//# sourceMappingURL=index.d.ts.map