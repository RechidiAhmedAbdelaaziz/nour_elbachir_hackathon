// Element Attribute Viewer Extension
// This content script runs on all web pages and allows users to inspect element attributes


interface ElementInfo {
  tagName: string;
  attributes: { name: string; value: string }[];
  computedStyles?: { [key: string]: string };
}

class AttributeViewer {
  private isActive: boolean = false;
  private lastSelectedElement: HTMLElement | null = null;
  private infoPanel: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    this.injectStyles();
    this.createOverlay();
    this.activate();
    console.log('Element Attribute Viewer: Initialized');
  }

  private injectStyles(): void {
    if (document.getElementById('attr-viewer-styles')) return;

    const styleEl = document.createElement('style');
    styleEl.id = 'attr-viewer-styles';
    styleEl.textContent = `
      .attr-viewer-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        z-index: 999998;
        display: none;
      }

      .attr-viewer-overlay.active {
        display: block;
      }

      .attr-viewer-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 20px;
        min-width: 400px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 999999;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: white;
      }

      .attr-viewer-panel h2 {
        margin: 0 0 15px 0;
        font-size: 22px;
        font-weight: 600;
        padding-bottom: 10px;
        border-bottom: 2px solid rgba(255, 255, 255, 0.3);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .attr-viewer-panel .tag-name {
        background: rgba(255, 255, 255, 0.2);
        padding: 4px 12px;
        border-radius: 6px;
        font-family: 'Courier New', monospace;
        font-size: 16px;
      }

      .attr-viewer-section {
        margin-top: 15px;
      }

      .attr-viewer-section h3 {
        font-size: 16px;
        margin: 0 0 10px 0;
        opacity: 0.9;
        font-weight: 500;
      }

      .attr-viewer-item {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        margin: 8px 0;
        padding: 12px;
        border-radius: 8px;
        display: flex;
        flex-wrap: wrap;
        word-break: break-word;
      }

      .attr-viewer-name {
        font-weight: 600;
        color: #ffd700;
        font-family: 'Courier New', monospace;
        margin-right: 8px;
      }

      .attr-viewer-value {
        color: rgba(255, 255, 255, 0.95);
        flex: 1;
        font-family: 'Courier New', monospace;
      }

      .attr-viewer-empty {
        color: rgba(255, 255, 255, 0.5);
        font-style: italic;
        padding: 10px;
      }

      .attr-viewer-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        transition: all 0.2s;
      }

      .attr-viewer-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(90deg);
      }

      .attr-viewer-toggle {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        z-index: 999997;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        transition: all 0.3s;
      }

      .attr-viewer-toggle:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
      }

      .attr-viewer-toggle.inactive {
        background: #999;
      }
    `;
    document.head.appendChild(styleEl);
  }

  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.className = 'attr-viewer-overlay';
    this.overlay.addEventListener('click', () => this.closePanel());
    document.body.appendChild(this.overlay);
  }

  private activate(): void {
    this.isActive = true;
    document.addEventListener('click', this.handleClick, true);
  }

  private deactivate(): void {
    this.isActive = false;
    document.removeEventListener('click', this.handleClick, true);
    this.clearHighlight();
    this.closePanel();
  }

  private handleClick = (event: MouseEvent): void => {
    if (!this.isActive) return;

    const target = event.target as HTMLElement;
    if (this.shouldIgnoreElement(target)) return;

    event.preventDefault();
    event.stopPropagation();

    this.showElementInfo(target);
  };

  private shouldIgnoreElement(element: HTMLElement): boolean {
    return element.closest('.attr-viewer-panel, .attr-viewer-overlay, .attr-viewer-toggle') !== null;
  }

  private async showElementInfo(element: HTMLElement): Promise<void> {
    this.clearHighlight();

    this.lastSelectedElement = element;

    const info = await this.getElementInfo(element);
    this.displayPanel(info);
  }

  private async getElementInfo(element: HTMLElement): Promise<ElementInfo> {
    const attributes: { name: string; value: string }[] = [];

    // Check if this is a Reddit post
    const redditPostData = await this.extractRedditPostData(element);

    if (redditPostData) {
      attributes.push({ name: 'JSON_DATA', value: redditPostData });
    } else {
      // Fallback to text content
      const textContent = element.innerText || element.textContent || '';
      if (textContent.trim()) {
        attributes.push({ name: 'TEXT', value: textContent.trim() });
      }
    }

    return {
      tagName: element.tagName.toLowerCase(),
      attributes: attributes
    };
  }

  private async extractRedditPostData(element: HTMLElement): Promise<string | null> {
    // Find the Reddit post container
    let postContainer: HTMLElement | null = element;

    while (postContainer) {
      if (postContainer.hasAttribute('data-testid') &&
        postContainer.getAttribute('data-testid')?.includes('post')) {
        break;
      }
      if (postContainer.tagName === 'ARTICLE' ||
        postContainer.classList.contains('Post') ||
        postContainer.hasAttribute('data-post-id')) {
        break;
      }
      postContainer = postContainer.parentElement;
    }

    if (!postContainer) {
      return null;
    }

    const postData: any = {
      title: '',
      text: '',
      images: [],
      videos: []
    };

    // Extract post title
    const titleElement = postContainer.querySelector('h3, [data-click-id="text"], [slot="title"]');
    if (titleElement) {
      postData.title = titleElement.textContent?.trim() || '';
    }

    // Extract post text/body
    const textElements = postContainer.querySelectorAll('[data-testid="post-content"], [data-click-id="body"]');
    if (textElements.length > 0) {
      postData.text = Array.from(textElements).map(el => el.textContent?.trim()).filter(t => t).join(' ');
    }

    // Extract images
    const images = Array.from(postContainer.querySelectorAll('img'));
    for (const img of images) {
      if (img.src && !img.src.includes('icon') && !img.src.includes('avatar')) {
        postData.images.push(img.src);
      }
    }

    // Extract videos
    const videos = Array.from(postContainer.querySelectorAll('video'));
    for (const video of videos) {
      if (video.src) {
        postData.videos.push(video.src);
      }
    }

    if (postData.title || postData.text || postData.images.length > 0 || postData.videos.length > 0) {
      return JSON.stringify(postData, null, 2);
    }

    return null;
  }



  private displayPanel(info: ElementInfo): void {
    this.closePanel();

    this.infoPanel = document.createElement('div');
    this.infoPanel.className = 'attr-viewer-panel';

    let content = `
      <button class="attr-viewer-close" title="Close">×</button>
      <h2>
        <span>Element Details</span>
        <span class="tag-name">&lt;${info.tagName}&gt;</span>
      </h2>
    `;

    if (info.attributes.length > 0) {
      content += '<div class="attr-viewer-section">';
      info.attributes.forEach(attr => {
        if (attr.name === 'JSON_DATA') {
          content += `
            <div class="attr-viewer-item">
              <pre style="color: white; white-space: pre-wrap; word-break: break-word; font-size: 12px; margin: 0;">${this.escapeHtml(attr.value)}</pre>
            </div>
          `;
        } else {
          content += `
            <div class="attr-viewer-item">
              <span class="attr-viewer-value">${this.escapeHtml(attr.value)}</span>
            </div>
          `;
        }
      });
      content += '</div>';
    } else {
      content += '<div class="attr-viewer-section"><div class="attr-viewer-empty">No Reddit post or text found</div></div>';
    }

    this.infoPanel.innerHTML = content;

    const closeBtn = this.infoPanel.querySelector('.attr-viewer-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closePanel());
    }

    document.body.appendChild(this.infoPanel);
    if (this.overlay) {
      this.overlay.classList.add('active');
    }
  }

  private closePanel(): void {
    if (this.infoPanel) {
      this.infoPanel.remove();
      this.infoPanel = null;
    }
    if (this.overlay) {
      this.overlay.classList.remove('active');
    }
    this.clearHighlight();
  }

  private clearHighlight(): void {
    if (this.lastSelectedElement) {
      this.lastSelectedElement.classList.remove('attr-viewer-highlight');
      this.lastSelectedElement = null;
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the extension
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AttributeViewer();
  });
} else {
  new AttributeViewer();
}
