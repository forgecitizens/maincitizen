// ScrollArea class for modern scrollbar implementation
class ScrollArea {
    constructor(selector) {
        this.container = document.querySelector(selector);
        if (!this.container) return;
        
        this.init();
    }
    
    init() {
        // Add scrollarea class to container
        this.container.classList.add('scrollarea');
        
        // Get existing content
        const content = this.container.innerHTML;
        
        // Create scrollarea structure
        this.container.innerHTML = `
            <div class="scrollarea-viewport">
                <div class="scrollarea-content">
                    ${content}
                </div>
            </div>
            <div class="scrollarea-scrollbar">
                <div class="scrollarea-thumb"></div>
            </div>
        `;
        
        // Get elements
        this.viewport = this.container.querySelector('.scrollarea-viewport');
        this.content = this.container.querySelector('.scrollarea-content');
        this.scrollbar = this.container.querySelector('.scrollarea-scrollbar');
        this.thumb = this.container.querySelector('.scrollarea-thumb');
        
        // Initialize scrolling
        this.setupScrolling();
        
        // Initial update
        this.updateScrollbar();
        
        // Setup resize observer
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(() => {
                this.updateScrollbar();
            });
            this.resizeObserver.observe(this.viewport);
            this.resizeObserver.observe(this.content);
        }
    }
    
    setupScrolling() {
        let isDragging = false;
        let startY = 0;
        let startScrollTop = 0;
        
        // Mouse wheel scrolling
        this.viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY;
            this.viewport.scrollTop += delta;
            this.updateThumbPosition();
        });
        
        // Thumb dragging
        this.thumb.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.clientY;
            startScrollTop = this.viewport.scrollTop;
            e.preventDefault();
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
        
        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaY = e.clientY - startY;
            const scrollbarHeight = this.scrollbar.clientHeight;
            const thumbHeight = this.thumb.offsetHeight;
            const maxThumbTop = scrollbarHeight - thumbHeight;
            const maxScrollTop = this.content.scrollHeight - this.viewport.clientHeight;
            
            const scrollRatio = deltaY / maxThumbTop;
            const newScrollTop = startScrollTop + (scrollRatio * maxScrollTop);
            
            this.viewport.scrollTop = Math.max(0, Math.min(maxScrollTop, newScrollTop));
            this.updateThumbPosition();
        };
        
        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        // Scrollbar track clicking
        this.scrollbar.addEventListener('click', (e) => {
            if (e.target === this.thumb) return;
            
            const rect = this.scrollbar.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            const scrollbarHeight = this.scrollbar.clientHeight;
            const thumbHeight = this.thumb.offsetHeight;
            const maxScrollTop = this.content.scrollHeight - this.viewport.clientHeight;
            
            const ratio = (clickY - thumbHeight / 2) / (scrollbarHeight - thumbHeight);
            this.viewport.scrollTop = ratio * maxScrollTop;
            this.updateThumbPosition();
        });
        
        // Viewport scroll event
        this.viewport.addEventListener('scroll', () => {
            this.updateThumbPosition();
        });
    }
    
    updateScrollbar() {
        const viewportHeight = this.viewport.clientHeight;
        const contentHeight = this.content.scrollHeight;
        const hasScroll = contentHeight > viewportHeight;
        
        console.log(`📊 ScrollArea update: viewport=${viewportHeight}, content=${contentHeight}, hasScroll=${hasScroll}`);
        
        if (hasScroll) {
            this.scrollbar.style.display = 'block';
            this.updateThumbHeight();
            this.updateThumbPosition();
        } else {
            this.scrollbar.style.display = 'none';
        }
    }
    
    updateThumbHeight() {
        const viewportHeight = this.viewport.clientHeight;
        const contentHeight = this.content.scrollHeight;
        const scrollbarHeight = this.scrollbar.clientHeight - 34; // Account for buttons (17px each)
        
        const thumbHeight = Math.max(20, (viewportHeight / contentHeight) * scrollbarHeight);
        
        this.thumb.style.height = thumbHeight + 'px';
        console.log(`📏 Thumb height: ${thumbHeight}px (scrollbar: ${scrollbarHeight}px)`);
    }
    
    updateThumbPosition() {
        const viewportHeight = this.viewport.clientHeight;
        const contentHeight = this.content.scrollHeight;
        const scrollTop = this.viewport.scrollTop;
        const scrollbarHeight = this.scrollbar.clientHeight - 34; // Account for buttons
        const thumbHeight = this.thumb.offsetHeight;
        
        const maxScrollTop = contentHeight - viewportHeight;
        const maxThumbTop = scrollbarHeight - thumbHeight;
        
        if (maxScrollTop > 0) {
            const thumbTop = 17 + (scrollTop / maxScrollTop) * maxThumbTop; // 17px for top button
            this.thumb.style.top = thumbTop + 'px';
        }
    }
        const maxThumbTop = scrollbarHeight - thumbHeight;
        
        if (maxScrollTop > 0) {
            const thumbTop = (scrollTop / maxScrollTop) * maxThumbTop;
            this.thumb.style.top = thumbTop + 'px';
        }
    }
    
    // Public methods
    scrollTo(position) {
        this.viewport.scrollTop = position;
        this.updateThumbPosition();
    }
    
    scrollBy(delta) {
        this.viewport.scrollTop += delta;
        this.updateThumbPosition();
    }
    
    destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
}