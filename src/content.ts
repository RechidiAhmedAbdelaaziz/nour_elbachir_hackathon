// if clicked element contains an image, check if it's a deep fake


async function checkDeepFake(imageUrl: string): Promise<boolean> {
  const api_user = '923811902';
  const api_secret = 'eSf7HziReSsLcDF7mVgnXzro2Euw8Cd2';

  try {
    const params = new URLSearchParams({
      'url': imageUrl,
      'models': 'genai',
      'api_user': api_user,
      'api_secret': api_secret,
    });

    const response = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    //   {
    // "status": "success",
    // "request": {
    //   "id": "req_jB7EKYCHBK16LH7wbb12a",
    //   "timestamp": 1763484898.985702,
    //   "operations": 5
    // },
    // "type": {
    //   "ai_generated": 0.06
    // },
    // "media": {
    //   "id": "med_jB7Eci3oTpMurCAeYvpBH",
    //   "uri": "https://i.redd.it/08rc2cty8y1g1.png"
    // }
    // }
    if (data && data.type && typeof data.type.ai_generated === 'number') {
      const aiGeneratedScore = data.type.ai_generated;
      return aiGeneratedScore >= 0.6;
    }
    return false;

  } catch (error) {
    console.error('Error checking deep fake:', error);
    return false;
  }
}

async function isNewsFake(news: {
  text?: string;
  image?: string;
}): Promise<boolean> {
  const baseUrl = 'https://abderrahimzeno.app.n8n.cloud/webhook/63979e89-0aa1-4a6d-be82-e691b7cdb7f2';

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(news)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.is_fake === true;
  }
  catch (error) {
    console.error('Error checking news fake:', error);
    return false;
  }
}





class AttributeViewer {
  private checkedImages = new WeakSet<HTMLImageElement>();
  private checkedTitles = new WeakSet<Element>();

  constructor() {
    this.setupHoverListeners();
  }

  private setupHoverListeners() {
    // Use event delegation for better performance
    document.body.addEventListener('mouseover', (e) => {
      const target = e.target as Element;

      if (!(target instanceof HTMLElement)) return;

      // Only process shreddit-post elements
      const shredditPost = target.tagName.toLowerCase() === 'shreddit-post'
        ? target
        : target.closest('shreddit-post');

      if (!shredditPost) return;

      // Avoid checking the same post multiple times
      if (this.checkedTitles.has(shredditPost)) return;

      // Get all images from children
      const images = Array.from(shredditPost.querySelectorAll('img'));

      // Find the first image with "media" or "post" in class or id
      let relevantImage: HTMLImageElement | null = null;
      for (const img of images) {
        if (this.isRelevantImage(img)) {
          relevantImage = img;
          break;
        }
      }

      // Get title from children
      const titleElement = shredditPost.querySelector('[class*="post-title"], [id*="post-title"]');

      // Case 1: Post contains both image and title
      if (relevantImage && titleElement) {
        this.checkImageIfNeeded(relevantImage);
        this.checkNewsWithImageAndText(titleElement, relevantImage);
      }
      // Case 2: Post contains only title (text)
      else if (titleElement && !relevantImage) {
        this.checkNewsWithTextOnly(titleElement);
      }
      // Case 3: Post contains only image
      else if (relevantImage && !titleElement) {
        this.checkImageIfNeeded(relevantImage);
        // Mark as checked to avoid re-processing
        this.checkedTitles.add(shredditPost);
      }
    });
  }

  private isRelevantImage(img: HTMLImageElement): boolean {
    // Check if image has "media" or "post" in class or id
    const className = img.className || '';
    const id = img.id || '';
    return className.toLowerCase().includes('media') ||
      className.toLowerCase().includes('post') ||
      id.toLowerCase().includes('media') ||
      id.toLowerCase().includes('post');
  } private async checkNewsWithImageAndText(titleElement: Element, img: HTMLImageElement) {
    if (this.checkedTitles.has(titleElement)) return;
    this.checkedTitles.add(titleElement);

    const titleText = titleElement.textContent?.trim();
    const imageSrc = img.currentSrc || img.src;

    if (!titleText && !imageSrc) return;

    // Show checking message
    const checkingBadge = this.showTitleCheckingMessage(titleElement);

    try {
      const isFake = await isNewsFake({
        text: titleText,
        image: imageSrc
      });

      // Remove checking message
      if (checkingBadge && checkingBadge.parentElement) {
        checkingBadge.remove();
      }

      if (isFake) {
        this.showTitleWarning(titleElement);
      }
    } catch (error) {
      console.error('Error checking news:', error);
      // Remove checking message on error
      if (checkingBadge && checkingBadge.parentElement) {
        checkingBadge.remove();
      }
    }
  }

  private async checkNewsWithTextOnly(titleElement: Element) {
    if (this.checkedTitles.has(titleElement)) return;
    this.checkedTitles.add(titleElement);

    const titleText = titleElement.textContent?.trim();
    if (!titleText) return;

    // Show checking message
    const checkingBadge = this.showTitleCheckingMessage(titleElement);

    try {
      const isFake = await isNewsFake({ text: titleText });

      // Remove checking message
      if (checkingBadge && checkingBadge.parentElement) {
        checkingBadge.remove();
      }

      if (isFake) {
        this.showTitleWarning(titleElement);
      }
    } catch (error) {
      console.error('Error checking news:', error);
      // Remove checking message on error
      if (checkingBadge && checkingBadge.parentElement) {
        checkingBadge.remove();
      }
    }
  }

  private showTitleCheckingMessage(titleElement: Element): HTMLDivElement | null {
    const checking = document.createElement('div');
    checking.textContent = '🔍 Checking news...';
    Object.assign(checking.style, {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(156, 163, 175, 0.95)',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '700',
      zIndex: '2147483647',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      fontFamily: 'system-ui, sans-serif',
      pointerEvents: 'none',
      backdropFilter: 'blur(4px)'
    });

    const parent = titleElement.parentElement;
    if (parent) {
      const parentStyle = window.getComputedStyle(parent);
      if (parentStyle.position === 'static') {
        parent.style.position = 'relative';
      }
      parent.appendChild(checking);
      return checking;
    }
    return null;
  }

  private showTitleWarning(titleElement: Element) {
    const warning = document.createElement('div');
    warning.textContent = '⚠️ Fake News';
    Object.assign(warning.style, {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(239, 68, 68, 0.95)',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '700',
      zIndex: '2147483647',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      fontFamily: 'system-ui, sans-serif',
      pointerEvents: 'none',
      backdropFilter: 'blur(4px)'
    });

    const parent = titleElement.parentElement;
    if (parent) {
      const parentStyle = window.getComputedStyle(parent);
      if (parentStyle.position === 'static') {
        parent.style.position = 'relative';
      }
      parent.appendChild(warning);
    }
  }

  private async checkImageIfNeeded(img: HTMLImageElement) {
    if (this.checkedImages.has(img)) return;
    this.checkedImages.add(img);

    const src = img.currentSrc || img.src;
    if (!src) return;

    // Show checking message
    const checkingBadge = this.showCheckingMessage(img);

    try {
      const isDf = await checkDeepFake(src);
      // Remove checking message
      if (checkingBadge && checkingBadge.parentElement) {
        checkingBadge.remove();
      }

      if (isDf) {
        this.showWarning(img);
      }
    } catch (error) {
      console.error('Error checking image:', error);
      // Remove checking message on error
      if (checkingBadge && checkingBadge.parentElement) {
        checkingBadge.remove();
      }
    }
  }

  private showCheckingMessage(img: HTMLImageElement): HTMLDivElement | null {
    const checking = document.createElement('div');
    checking.textContent = '🔍 Checking...';
    Object.assign(checking.style, {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(156, 163, 175, 0.95)',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '700',
      zIndex: '2147483647',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      fontFamily: 'system-ui, sans-serif',
      pointerEvents: 'none',
      backdropFilter: 'blur(4px)'
    });

    const parent = img.parentElement;
    if (parent) {
      const parentStyle = window.getComputedStyle(parent);
      if (parentStyle.position === 'static') {
        parent.style.position = 'relative';
      }
      parent.appendChild(checking);
      return checking;
    }
    return null;
  }

  private showWarning(img: HTMLImageElement) {
    // Create warning overlay
    const warning = document.createElement('div');
    warning.textContent = '⚠️ AI-Generated';
    Object.assign(warning.style, {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(239, 68, 68, 0.95)',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '700',
      zIndex: '2147483647',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      fontFamily: 'system-ui, sans-serif',
      pointerEvents: 'none',
      backdropFilter: 'blur(4px)'
    });

    // Make parent position relative if needed
    const parent = img.parentElement;
    if (parent) {
      const parentStyle = window.getComputedStyle(parent);
      if (parentStyle.position === 'static') {
        parent.style.position = 'relative';
      }
      parent.appendChild(warning);
    }
  }
}

// Initialize viewer
new AttributeViewer();


