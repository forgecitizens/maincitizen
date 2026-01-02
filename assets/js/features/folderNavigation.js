/**
 * ========================================================================
 * FOLDER NAVIGATION SYSTEM - Windows 98 Style File Explorer
 * ========================================================================
 * Provides folder navigation with breadcrumb trail, back/up buttons,
 * and a virtual file system structure.
 */

// Virtual file system structure
const fileSystem = {
    'Programmes': {
        type: 'folder',
        icon: '📁',
        children: {
            'Jeux': {
                type: 'folder',
                icon: '🎮',
                children: {
                    // Games will be added here later
                }
            }
        }
    }
};

// Navigation state
let currentPath = [];
let navigationHistory = [];
let historyIndex = -1;

/**
 * Initialize folder navigation system
 */
function initializeFolderNavigation() {
    console.log('📁 Initialisation du système de navigation...');
    
    // Add click handler for desktop icons with folder-path
    document.querySelectorAll('.desktop-icon[data-folder-path]').forEach(icon => {
        icon.addEventListener('dblclick', function(e) {
            e.preventDefault();
            const folderPath = this.dataset.folderPath;
            openFolderExplorer(folderPath);
        });
    });
    
    console.log('✅ Système de navigation initialisé');
}

/**
 * Open the file explorer at a specific path
 */
function openFolderExplorer(path) {
    console.log('📂 Opening folder explorer at:', path);
    
    // Parse path to array
    currentPath = path ? path.split('/').filter(p => p) : [];
    
    // Reset navigation history
    navigationHistory = [currentPath.slice()];
    historyIndex = 0;
    
    // Open the modal
    openModal('file-explorer-modal');
    
    // Render the folder contents after modal is visible
    setTimeout(() => {
        renderFolderContents();
        updateBreadcrumb();
        updateNavigationButtons();
    }, 100);
}

/**
 * Navigate to a specific folder
 */
function navigateToFolder(folderName) {
    if (typeof playClickSound === 'function') {
        playClickSound();
    }
    
    currentPath.push(folderName);
    
    // Add to history
    historyIndex++;
    navigationHistory = navigationHistory.slice(0, historyIndex);
    navigationHistory.push(currentPath.slice());
    
    renderFolderContents();
    updateBreadcrumb();
    updateNavigationButtons();
}

/**
 * Navigate to a specific path (from breadcrumb click)
 */
function navigateToPath(pathString) {
    if (typeof playClickSound === 'function') {
        playClickSound();
    }
    
    currentPath = pathString ? pathString.split('/').filter(p => p) : [];
    
    // Add to history
    historyIndex++;
    navigationHistory = navigationHistory.slice(0, historyIndex);
    navigationHistory.push(currentPath.slice());
    
    renderFolderContents();
    updateBreadcrumb();
    updateNavigationButtons();
}

/**
 * Navigate back in history
 */
function navigateBack() {
    if (historyIndex <= 0) return;
    
    if (typeof playClickSound === 'function') {
        playClickSound();
    }
    
    historyIndex--;
    currentPath = navigationHistory[historyIndex].slice();
    
    renderFolderContents();
    updateBreadcrumb();
    updateNavigationButtons();
}

/**
 * Navigate to parent folder
 */
function navigateUp() {
    if (currentPath.length === 0) return;
    
    if (typeof playClickSound === 'function') {
        playClickSound();
    }
    
    currentPath.pop();
    
    // Add to history
    historyIndex++;
    navigationHistory = navigationHistory.slice(0, historyIndex);
    navigationHistory.push(currentPath.slice());
    
    renderFolderContents();
    updateBreadcrumb();
    updateNavigationButtons();
}

/**
 * Get folder contents at current path
 */
function getFolderContents() {
    let current = fileSystem;
    
    for (const folder of currentPath) {
        if (current[folder] && current[folder].children) {
            current = current[folder].children;
        } else {
            return {};
        }
    }
    
    return current;
}

/**
 * Get folder info at current path
 */
function getCurrentFolderInfo() {
    if (currentPath.length === 0) {
        return { name: 'Bureau', icon: '🖥️' };
    }
    
    let current = fileSystem;
    let info = { name: currentPath[currentPath.length - 1], icon: '📁' };
    
    for (const folder of currentPath) {
        if (current[folder]) {
            info = { name: folder, icon: current[folder].icon || '📁' };
            current = current[folder].children || {};
        }
    }
    
    return info;
}

/**
 * Render folder contents in the explorer
 */
function renderFolderContents() {
    const container = document.getElementById('file-explorer-content');
    const statusBar = document.getElementById('folder-item-count');
    const titleEl = document.getElementById('file-explorer-title');
    
    if (!container) return;
    
    const contents = getFolderContents();
    const folderInfo = getCurrentFolderInfo();
    const items = Object.keys(contents);
    
    // Update title
    if (titleEl) {
        titleEl.textContent = folderInfo.name;
    }
    
    // Update status bar
    if (statusBar) {
        const count = items.length;
        statusBar.textContent = count === 0 ? 'Dossier vide' : 
            count === 1 ? '1 élément' : `${count} éléments`;
    }
    
    // Render items
    if (items.length === 0) {
        container.innerHTML = `
            <div class="folder-empty-message">
                <div class="empty-icon">📂</div>
                <p>Ce dossier est vide</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="folder-grid">';
    
    for (const [name, item] of Object.entries(contents)) {
        const icon = item.icon || (item.type === 'folder' ? '📁' : '📄');
        const itemClass = item.type === 'folder' ? 'folder-item' : 'file-item';
        const onClick = item.type === 'folder' 
            ? `ondblclick="navigateToFolder('${name}')"` 
            : `ondblclick="openFile('${currentPath.join('/')}/${name}')"`;
        
        html += `
            <div class="${itemClass}" ${onClick} tabindex="0" role="button" aria-label="${name}">
                <div class="item-icon">${icon}</div>
                <div class="item-label">${name}</div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
    
    // Add keyboard navigation
    container.querySelectorAll('.folder-item, .file-item').forEach(item => {
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            }
        });
    });
}

/**
 * Update breadcrumb navigation
 */
function updateBreadcrumb() {
    const container = document.getElementById('breadcrumb-container');
    if (!container) return;
    
    let html = `<span class="breadcrumb-item breadcrumb-root" onclick="navigateToPath('')" role="button" tabindex="0">🖥️ Bureau</span>`;
    
    let pathSoFar = '';
    for (let i = 0; i < currentPath.length; i++) {
        const folder = currentPath[i];
        pathSoFar += (pathSoFar ? '/' : '') + folder;
        const isLast = i === currentPath.length - 1;
        
        html += `<span class="breadcrumb-separator">›</span>`;
        html += `<span class="breadcrumb-item ${isLast ? 'breadcrumb-current' : ''}" 
                       onclick="navigateToPath('${pathSoFar}')" 
                       role="button" 
                       tabindex="0">${folder}</span>`;
    }
    
    container.innerHTML = html;
    
    // Add keyboard navigation
    container.querySelectorAll('.breadcrumb-item').forEach(item => {
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

/**
 * Update navigation buttons state
 */
function updateNavigationButtons() {
    const backBtn = document.getElementById('nav-back-btn');
    const upBtn = document.getElementById('nav-up-btn');
    
    if (backBtn) {
        backBtn.disabled = historyIndex <= 0;
    }
    
    if (upBtn) {
        upBtn.disabled = currentPath.length === 0;
    }
}

/**
 * Open a file (placeholder for future functionality)
 */
function openFile(filePath) {
    console.log('📄 Opening file:', filePath);
    // To be implemented when files are added
}

/**
 * Add a folder to the file system
 */
function addFolder(path, name, icon = '📁') {
    const pathParts = path.split('/').filter(p => p);
    let current = fileSystem;
    
    for (const folder of pathParts) {
        if (!current[folder]) {
            current[folder] = { type: 'folder', icon: '📁', children: {} };
        }
        current = current[folder].children;
    }
    
    current[name] = { type: 'folder', icon, children: {} };
}

/**
 * Add a file to the file system
 */
function addFile(path, name, icon = '📄', data = {}) {
    const pathParts = path.split('/').filter(p => p);
    let current = fileSystem;
    
    for (const folder of pathParts) {
        if (!current[folder]) {
            current[folder] = { type: 'folder', icon: '📁', children: {} };
        }
        current = current[folder].children;
    }
    
    current[name] = { type: 'file', icon, ...data };
}

// Expose functions globally for cross-module access IMMEDIATELY
// This runs at script load time, before DOMContentLoaded
console.log('📁 FolderNavigation: Exposing functions to window...');
window.openFolderExplorer = openFolderExplorer;
window.navigateToFolder = navigateToFolder;
window.navigateToPath = navigateToPath;
window.navigateBack = navigateBack;
window.navigateUp = navigateUp;
window.addFolder = addFolder;
window.addFile = addFile;
console.log('✅ FolderNavigation: window.openFolderExplorer =', typeof window.openFolderExplorer);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initializeFolderNavigation);
