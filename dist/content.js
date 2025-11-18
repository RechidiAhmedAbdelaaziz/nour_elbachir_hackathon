"use strict";
// if clicked element contains an image, check if it's a deep fake
async function checkDeepFake(imageUrl) {
    const api_user = '16335105';
    const api_secret = 'DptAiwNM3HqmbmciVkjwTiLKZRHrxcCn';
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
    }
    catch (error) {
        console.error('Error checking deep fake:', error);
        return false;
    }
}
// implement image handling in AttributeViewer and add deep fake check functionality
// Basic AttributeViewer with image + deep fake check support
class AttributeViewer {
    constructor() {
        this.panel = null;
        this.currentEl = null;
        this.handleClick = async (e) => {
            const target = e.target;
            if (!target)
                return;
            if (!(target instanceof HTMLElement))
                return;
            if (target.tagName === 'IMG') {
                this.show(target);
                const src = target.currentSrc || target.src;
                if (src) {
                    this.showDeepFakeCheck();
                    try {
                        const isDf = await checkDeepFake(src);
                        this.updateDeepFakeStatus(isDf);
                    }
                    catch {
                        this.updateDeepFakeStatus(false, true);
                    }
                }
            }
        };
        this.ensurePanel();
        document.addEventListener('click', this.handleClick, true);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape')
                this.hide();
        });
    }
    ensurePanel() {
        if (this.panel)
            return;
        this.panel = document.createElement('div');
        Object.assign(this.panel.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: '2147483647',
            minWidth: '400px',
            font: '16px/1.4 system-ui, sans-serif',
            background: '#111',
            color: '#eee',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,.6)',
            pointerEvents: 'auto',
            backdropFilter: 'blur(8px)',
            wordBreak: 'break-word'
        });
        this.panel.addEventListener('click', (e) => e.stopPropagation());
        document.documentElement.appendChild(this.panel);
    }
    updateDeepFakeStatus(isDf, error = false) {
        if (!this.panel)
            return;
        this.panel.innerHTML = '';
        const container = document.createElement('div');
        Object.assign(container.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '10px',
            justifyContent: 'center',
            textAlign: 'center'
        });
        // Icon
        const icon = document.createElement('div');
        Object.assign(icon.style, {
            fontSize: '48px',
            flexShrink: '0'
        });
        // Message
        const message = document.createElement('div');
        Object.assign(message.style, {
            flex: '1',
            fontSize: '20px',
            fontWeight: '600',
            lineHeight: '1.4'
        });
        if (error) {
            icon.textContent = '⚠️';
            message.textContent = 'Unable to verify image';
            message.style.color = '#f87171';
        }
        else if (isDf) {
            icon.textContent = '🤖';
            message.textContent = 'Warning: This image may be AI-generated';
            message.style.color = '#fbbf24';
        }
        else {
            icon.textContent = '✓';
            message.textContent = 'This image appears authentic';
            message.style.color = '#34d399';
        }
        container.appendChild(icon);
        container.appendChild(message);
        this.panel.appendChild(container);
    }
    showDeepFakeCheck() {
        if (!this.panel)
            return;
        this.panel.innerHTML = '';
        const container = document.createElement('div');
        Object.assign(container.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '10px',
            justifyContent: 'center',
            textAlign: 'center'
        });
        const spinner = document.createElement('div');
        spinner.textContent = '🔍';
        spinner.style.fontSize = '48px';
        const message = document.createElement('div');
        message.textContent = 'Checking image...';
        Object.assign(message.style, {
            fontSize: '18px',
            color: '#9ca3af'
        });
        container.appendChild(spinner);
        container.appendChild(message);
        this.panel.appendChild(container);
    }
    clearPanel() {
        if (this.panel)
            this.panel.innerHTML = '';
    }
    show(el) {
        this.currentEl = el;
        this.ensurePanel();
        this.clearPanel();
        // Only show deep fake check for images
        if (el.tagName !== 'IMG') {
            this.panel.style.display = 'none';
            return;
        }
        this.panel.style.display = 'block';
    }
    hide() {
        if (this.panel)
            this.panel.style.display = 'none';
        this.currentEl = null;
    }
}
// Initialize viewer
new AttributeViewer();
//# sourceMappingURL=content.js.map