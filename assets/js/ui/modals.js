// Modal functions
function openModal(modalId, htmlFile = null, title = null, width = null, height = null) {
    console.log('🔍 Opening modal:', { modalId, htmlFile, title, width, height });
    
    // Si htmlFile est fourni, créer une modale dynamique
    if (htmlFile) {
        createDynamicModal(modalId, htmlFile, title, width, height);
        return;
    }
    
    // Sinon, utiliser l'ancienne méthode pour les modales HTML statiques
    const modal = document.getElementById(modalId);
    console.log('Attempting to open modal:', modalId, modal); // Debug log
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'block';
        
        // Use provided dimensions or calculate 80% of screen size
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight - 28; // Subtract taskbar height
        const modalWidth = width || Math.floor(screenWidth * 0.8);
        const modalHeight = height || Math.floor(screenHeight * 0.8);
        
        // Center the modal
        const leftPos = Math.floor((screenWidth - modalWidth) / 2);
        const topPos = Math.floor((screenHeight - modalHeight) / 2);
        
        modal.style.left = leftPos + 'px';
        modal.style.top = topPos + 'px';
        modal.style.width = modalWidth + 'px';
        modal.style.height = modalHeight + 'px';
        bringToFront(modal);
        
        // Initialiser ScrollArea pour les modales statiques
        setTimeout(() => {
            console.log(`🔍 Initialisation ScrollArea pour modale ${modalId}...`);
            if (typeof initializeScrollAreas === 'function') {
                initializeScrollAreas();
            }
            
            // Force initialization on the modal content directly
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent && !modalContent.classList.contains('scrollarea')) {
                try {
                    if (!modalContent.id) {
                        modalContent.id = `modal-content-${modalId}`;
                    }
                    new ScrollArea(`#${modalContent.id}`);
                    console.log(`✅ ScrollArea forcé pour #${modalContent.id}`);
                } catch (error) {
                    console.error(`❌ Erreur ScrollArea forcé:`, error);
                }
            }
        }, 200);
        
        console.log('Modal opened successfully'); // Debug log
    } else {
        console.error('Modal not found:', modalId); // Debug log
    }
}

function closeModal(modalId) {
    // Play click sound
    playClickSound();
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        
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
    const allModals = document.querySelectorAll('.modal');
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
        existingModal.style.display = 'block';
        bringToFront(existingModal);
        return;
    }
    
    // Créer la structure HTML de la modale
    const modalHTML = `
        <div class="modal" id="${modalId}">
            <div class="modal-header">
                <div class="modal-title">${title || 'Fenêtre'}</div>
                <div class="modal-controls">
                    <div class="modal-button" onclick="minimizeModal('${modalId}')">_</div>
                    <div class="modal-button" onclick="maximizeModal('${modalId}')">□</div>
                    <div class="modal-button" onclick="closeModal('${modalId}')">×</div>
                </div>
            </div>
            <div class="modal-content" id="${modalId}-content">
                <div style="text-align: center; padding: 20px; color: #808080;">
                    <div style="animation: spin 1s linear infinite; display: inline-block;">⏳</div>
                    <div>Chargement...</div>
                </div>
            </div>
            <div class="resize-handle"></div>
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
                
                // Initialiser la scrollbar personnalisée pour cette modale
                setTimeout(() => {
                    if (typeof initializeScrollAreas === 'function') {
                        initializeScrollAreas();
                        console.log(`📜 ScrollArea initialisé pour modale ${modalId}`);
                    }
                }, 100);
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
    
    // Configurer la modale
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - 28; // Subtract taskbar height
    const modalWidth = Math.min(width, screenWidth * 0.9);
    const modalHeight = Math.min(height, screenHeight * 0.9);
    
    // Center the modal
    const leftPos = Math.floor((screenWidth - modalWidth) / 2);
    const topPos = Math.floor((screenHeight - modalHeight) / 2);
    
    modal.style.left = leftPos + 'px';
    modal.style.top = topPos + 'px';
    modal.style.width = modalWidth + 'px';
    modal.style.height = modalHeight + 'px';
    
    // Afficher et amener au premier plan
    modal.classList.add('show');
    modal.style.display = 'block';
    bringToFront(modal);
    
    console.log(`🪟 Modale dynamique créée: ${modalId} (${modalWidth}x${modalHeight})`);
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