// Modal/Window functions - Support both old modal and new window systems
function openModal(modalId, htmlFile = null, title = null, width = null, height = null) {
    console.log('🔍 Opening modal:', { modalId, htmlFile, title, width, height });
    
    // Si htmlFile est fourni, créer une modale dynamique
    if (htmlFile) {
        createDynamicModal(modalId, htmlFile, title, width, height);
        return;
    }
    
    // Chercher d'abord dans le nouveau système .window
    let modal = document.getElementById(modalId);
    const isNewWindow = modal && modal.classList.contains('window');
    
    console.log('Modal found:', modalId, modal, 'isNewWindow:', isNewWindow);
    
    if (modal) {
        modal.classList.add('show');
        modal.style.display = isNewWindow ? 'flex' : 'block';
        
        // Sizing moderne pour les nouvelles fenêtres
        if (isNewWindow) {
            applyModernWindowSizing(modal, width, height);
        } else {
            // Ancien système de sizing pour rétrocompatibilité
            applyLegacyModalSizing(modal, width, height);
        }
        
        bringToFront(modal);
        
        // Accessibilité et focus management
        setupModalAccessibility(modal, isNewWindow);
        
        // Initialisation ScrollArea différée
        setTimeout(() => {
            initializeModalScrollArea(modal, modalId, isNewWindow);
        }, 200);
        
        console.log('Modal opened successfully');
    } else {
        console.error('Modal not found:', modalId);
    }
}

// Sizing moderne pour .window
function applyModernWindowSizing(modal, width, height) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - 28; // Subtract taskbar
    
    // Mobile : utilise les règles CSS responsive
    if (screenWidth < 1024) {
        modal.style.left = '8px';
        modal.style.top = '8px';
        return; // CSS gère le reste
    }
    
    // Desktop : sizing intelligent
    const defaultWidth = Math.min(540, Math.floor(screenWidth * 0.92));
    const defaultHeight = Math.min(480, Math.floor(screenHeight * 0.86));
    
    const modalWidth = width || defaultWidth;
    const modalHeight = height || defaultHeight;
    
    // Respecter les contraintes min/max
    const finalWidth = Math.max(320, Math.min(modalWidth, Math.floor(screenWidth * 0.95)));
    const finalHeight = Math.max(240, Math.min(modalHeight, Math.floor(screenHeight * 0.90)));
    
    // Centrage
    const leftPos = Math.floor((screenWidth - finalWidth) / 2);
    const topPos = Math.floor((screenHeight - finalHeight) / 2);
    
    modal.style.left = leftPos + 'px';
    modal.style.top = topPos + 'px';
    modal.style.width = finalWidth + 'px';
    modal.style.height = finalHeight + 'px';
    
    console.log(`🪟 Window moderne: ${finalWidth}x${finalHeight} at (${leftPos},${topPos})`);
}

// Sizing legacy pour .modal (rétrocompatibilité)
function applyLegacyModalSizing(modal, width, height) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - 28;
    const modalWidth = width || Math.floor(screenWidth * 0.8);
    const modalHeight = height || Math.floor(screenHeight * 0.8);
    
    const leftPos = Math.floor((screenWidth - modalWidth) / 2);
    const topPos = Math.floor((screenHeight - modalHeight) / 2);
    
    modal.style.left = leftPos + 'px';
    modal.style.top = topPos + 'px';
    modal.style.width = modalWidth + 'px';
    modal.style.height = modalHeight + 'px';
    
    console.log(`📄 Modal legacy: ${modalWidth}x${modalHeight}`);
}

// Accessibilité et focus management
function setupModalAccessibility(modal, isNewWindow) {
    // Focus trap basique
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
        focusableElements[0].focus();
    }
    
    // Gestion Escape key
    function handleEscape(e) {
        if (e.key === 'Escape') {
            closeModal(modal.id);
            document.removeEventListener('keydown', handleEscape);
        }
    }
    document.addEventListener('keydown', handleEscape);
    
    // Stocker la référence pour cleanup
    modal._escapeHandler = handleEscape;
}

// ScrollArea initialization pour modales/windows
function initializeModalScrollArea(modal, modalId, isNewWindow) {
    console.log(`🔍 Init ScrollArea pour ${modalId} (isNewWindow: ${isNewWindow})`);
    
    if (typeof initializeScrollAreas === 'function') {
        initializeScrollAreas();
    }
    
    // Pour les nouvelles fenêtres, pas de ScrollArea custom - utilise overflow: auto natif
    if (isNewWindow) {
        console.log(`✅ Window moderne: scroll natif activé pour ${modalId}`);
        return;
    }
    
    // Pour les anciennes modales, garde le système ScrollArea custom
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent && !modalContent.classList.contains('scrollarea')) {
        try {
            if (!modalContent.id) {
                modalContent.id = `modal-content-${modalId}`;
            }
            new ScrollArea(`#${modalContent.id}`);
            console.log(`✅ ScrollArea custom pour legacy modal #${modalContent.id}`);
        } catch (error) {
            console.error(`❌ Erreur ScrollArea legacy:`, error);
        }
    }
}

function closeModal(modalId) {
    // Play click sound
    if (typeof playClickSound === 'function') {
        playClickSound();
    }
    
    const modal = document.getElementById(modalId);
    if (modal) {
        // Cas spécial : démontage du calendrier
        if (modalId === 'calendar-modal' && typeof unmountCalendar === 'function') {
            console.log('🧹 Démontage du calendrier...');
            try {
                unmountCalendar();
            } catch (e) {
                console.warn('Erreur démontage calendrier:', e);
            }
        }
        
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        // Cleanup escape handler
        if (modal._escapeHandler) {
            document.removeEventListener('keydown', modal._escapeHandler);
            delete modal._escapeHandler;
        }
        
        // Remove from minimized windows
        minimizedWindows = minimizedWindows.filter(w => w.id !== modalId);
        updateTaskbar();
    }
}

function minimizeModal(modalId) {
    // Play click sound
    playClickSound();
    
    const modal = document.getElementById(modalId);
    if (modal && minimizedWindows.length < 5) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        
        // Get modal title
        const titleElement = modal.querySelector('.modal-title');
        const title = titleElement ? titleElement.textContent : 'Fenêtre';
        
        // Add to minimized windows if not already there
        if (!minimizedWindows.find(w => w.id === modalId)) {
            minimizedWindows.push({ id: modalId, title: title });
            updateTaskbar();
        }
    }
}

function maximizeModal(modalId) {
    // Play click sound
    playClickSound();
    
    const modal = document.getElementById(modalId);
    if (modal) {
        if (modal.style.width === '100vw') {
            modal.style.width = '400px';
            modal.style.height = '300px';
            modal.style.left = '50px';
            modal.style.top = '50px';
        } else {
            modal.style.width = '100vw';
            modal.style.height = 'calc(100vh - 28px)';
            modal.style.left = '0';
            modal.style.top = '0';
        }
    }
}

function bringToFront(modal) {
    // Support both .modal and .window systems
    const allModals = document.querySelectorAll('.modal, .window');
    allModals.forEach(m => m.style.zIndex = '100');
    modal.style.zIndex = '101';
}

/**
 * Crée une modale dynamique avec contenu chargé depuis un fichier HTML externe
 */
function createDynamicModal(modalId, htmlFile, title, width = 400, height = 300) {
    // Vérifier si la modale existe déjà
    let existingModal = document.getElementById(modalId);
    if (existingModal) {
        // Si elle existe déjà, juste la rouvrir
        existingModal.classList.add('show');
        const isNewWindow = existingModal.classList.contains('window');
        existingModal.style.display = isNewWindow ? 'flex' : 'block';
        bringToFront(existingModal);
        
        // Cas spécial : remonter le calendrier s'il a été démonté
        if (modalId === 'calendar-modal') {
            setTimeout(() => {
                const mountPoint = document.getElementById('calendar-mount-point');
                if (mountPoint && typeof mountCalendar === 'function' && !window.retroCalendar) {
                    console.log('🔄 Remontage du calendrier...');
                    mountCalendar(mountPoint, { showClock: true, enableNotes: true, theme: 'retro' });
                }
            }, 100);
        }
        
        return;
    }
    
    // Créer la structure HTML avec nouveau système .window pour meilleure UX
    const modalHTML = `
        <div class="window" id="${modalId}" role="dialog" aria-modal="true" aria-labelledby="${modalId}-title">
            <div class="window-titlebar">
                <div class="window-title" id="${modalId}-title">${title || 'Fenêtre'}</div>
                <div class="window-controls">
                    <div class="window-button" onclick="minimizeModal('${modalId}')" aria-label="Réduire">_</div>
                    <div class="window-button" onclick="maximizeModal('${modalId}')" aria-label="Agrandir">□</div>
                    <div class="window-button" onclick="closeModal('${modalId}')" aria-label="Fermer">×</div>
                </div>
            </div>
            <div class="window-body">
                <div class="window-content" id="${modalId}-content">
                    <div style="text-align: center; padding: 20px; color: #808080;">
                        <div style="animation: spin 1s linear infinite; display: inline-block;">⏳</div>
                        <div>Chargement...</div>
                    </div>
                </div>
            </div>
            <div class="window-resize-handle" aria-hidden="true"></div>
        </div>
    `;
    
    // Ajouter au DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById(modalId);
    
    // Charger le contenu externe
    fetch(htmlFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            const contentDiv = document.getElementById(`${modalId}-content`);
            if (contentDiv) {
                // Injecter le HTML
                contentDiv.innerHTML = html;
                
                // Exécuter les scripts contenus dans le HTML
                const scripts = contentDiv.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    script.parentNode.replaceChild(newScript, script);
                });
                
                console.log(`✅ Contenu chargé pour ${modalId} depuis ${htmlFile}`);
                console.log(`🔧 ${scripts.length} script(s) réexécuté(s)`);
                
                // Pas besoin d'initialiser ScrollArea pour les nouvelles fenêtres
                console.log(`📅 Window moderne: scroll natif activé pour ${modalId}`);
            }
        })
        .catch(error => {
            console.error(`❌ Erreur chargement ${htmlFile}:`, error);
            const contentDiv = document.getElementById(`${modalId}-content`);
            if (contentDiv) {
                contentDiv.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #800000;">
                        <div>❌ Erreur de chargement</div>
                        <div style="font-size: 10px; margin-top: 10px; color: #606060;">
                            ${error.message}
                        </div>
                    </div>
                `;
            }
        });
    
    // Configurer la modale avec sizing moderne
    applyModernWindowSizing(modal, width, height);
    
    // Afficher et amener au premier plan
    modal.classList.add('show');
    modal.style.display = 'flex';
    bringToFront(modal);
    
    // Accessibilité
    setupModalAccessibility(modal, true);
    
    console.log(`🪟 Modale dynamique créée: ${modalId} (${width}x${height})`);
}

function initializeModalDragging() {
    // Modal dragging
    document.querySelectorAll('.modal-header').forEach(header => {
        header.addEventListener('mousedown', function(e) {
            if (e.target.classList.contains('modal-button')) return;
            
            draggedModal = this.parentElement;
            bringToFront(draggedModal);
            
            const rect = draggedModal.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            e.preventDefault();
        });
    });

    // Modal resizing
    document.querySelectorAll('.resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', function(e) {
            resizingModal = this.parentElement;
            bringToFront(resizingModal);
            
            const rect = resizingModal.getBoundingClientRect();
            resizeStart.x = e.clientX;
            resizeStart.y = e.clientY;
            resizeStart.width = rect.width;
            resizeStart.height = rect.height;
            
            e.preventDefault();
            e.stopPropagation();
        });
    });

    // Mouse move events
    document.addEventListener('mousemove', function(e) {
        if (draggedModal) {
            draggedModal.style.left = (e.clientX - dragOffset.x) + 'px';
            draggedModal.style.top = (e.clientY - dragOffset.y) + 'px';
        }
        
        if (resizingModal) {
            const newWidth = resizeStart.width + (e.clientX - resizeStart.x);
            const newHeight = resizeStart.height + (e.clientY - resizeStart.y);
            
            if (newWidth > 200) {
                resizingModal.style.width = newWidth + 'px';
            }
            if (newHeight > 150) {
                resizingModal.style.height = newHeight + 'px';
            }
        }
    });

    document.addEventListener('mouseup', function() {
        draggedModal = null;
        resizingModal = null;
    });

    // Click on modal to bring to front
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('mousedown', function() {
            bringToFront(this);
        });
    });
}

function initializeDesktopIcons() {
    // Desktop icon functionality
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            // Play click sound
            playClickSound();
            
            // Remove selection from other icons
            document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
            // Select this icon
            this.classList.add('selected');
            
            // Open modal immediately on single click
            const modalId = this.getAttribute('data-modal') + '-modal';
            console.log('Opening modal:', modalId); // Debug log
            openModal(modalId);
        });

        // Right click context menu
        icon.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            currentContextIcon = this;
            
            const contextMenu = document.getElementById('contextMenu');
            contextMenu.style.left = e.pageX + 'px';
            contextMenu.style.top = e.pageY + 'px';
            contextMenu.classList.add('show');
        });
    });

    // Deselect icons when clicking on desktop
    document.getElementById('desktop').addEventListener('click', function(e) {
        if (e.target === this) {
            document.querySelectorAll('.desktop-icon').forEach(icon => {
                icon.classList.remove('selected');
            });
        }
    });
}

function initializeContextMenu() {
    // Context menu functions
    window.openFromContext = function() {
        if (currentContextIcon) {
            const modalId = currentContextIcon.getAttribute('data-modal') + '-modal';
            openModal(modalId);
            document.getElementById('contextMenu').classList.remove('show');
        }
    };

    window.showInfo = function() {
        document.getElementById('infoPopup').classList.add('show');
        document.getElementById('contextMenu').classList.remove('show');
    };

    window.closeInfo = function() {
        document.getElementById('infoPopup').classList.remove('show');
    };

    // Close info popup when clicking elsewhere
    document.addEventListener('click', function(e) {
        const infoPopup = document.getElementById('infoPopup');
        if (!infoPopup.contains(e.target) && !e.target.closest('.context-menu-item')) {
            infoPopup.classList.remove('show');
        }
    });
}