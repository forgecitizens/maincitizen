// Update date and time
function updateDateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const dateString = now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    document.getElementById('datetime').textContent = `${timeString} ${dateString}`;
}

// Update battery level randomly
function updateBattery() {
    const battery = Math.floor(Math.random() * 20) + 70; // 70-90%
    document.getElementById('batteryLevel').textContent = `${battery}%`;
    
    const batteryIcon = document.querySelector('.battery-icon');
    if (battery > 50) {
        batteryIcon.style.background = '#00ff00';
    } else if (battery > 20) {
        batteryIcon.style.background = '#ffff00';
    } else {
        batteryIcon.style.background = '#ff0000';
    }
}

// Start menu functionality
function initializeStartMenu() {
    document.getElementById('startButton').addEventListener('click', function(e) {
        e.stopPropagation();
        const startMenu = document.getElementById('startMenu');
        const startButton = document.getElementById('startButton');
        
        if (startMenu.classList.contains('show')) {
            startMenu.classList.remove('show');
            startButton.classList.remove('active');
        } else {
            startMenu.classList.add('show');
            startButton.classList.add('active');
        }
    });
    
    // Start menu items functionality
    document.querySelectorAll('.start-menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const modalData = this.getAttribute('data-modal');
            
            // Gestion spéciale pour le calendrier
            if (modalData === 'calendar') {
                openModal('calendar-modal', 'components/calendar/calendar-content.html', 'Calendrier', 420, 480);
            } else {
                const modalId = modalData + '-modal';
                openModal(modalId);
            }
            
            // Close start menu
            const startMenu = document.getElementById('startMenu');
            const startButton = document.getElementById('startButton');
            startMenu.classList.remove('show');
            startButton.classList.remove('active');
        });
    });
}

// Global click handler
function initializeGlobalHandlers() {
    // Close start menu and context menu when clicking elsewhere
    document.addEventListener('click', function(e) {
        const startMenu = document.getElementById('startMenu');
        const startButton = document.getElementById('startButton');
        const contextMenu = document.getElementById('contextMenu');
        
        // Close start menu
        if (!startButton.contains(e.target)) {
            startMenu.classList.remove('show');
            startButton.classList.remove('active');
        }
        
        // Close context menu
        if (!contextMenu.contains(e.target)) {
            contextMenu.classList.remove('show');
        }
    });
}

function updateTaskbar() {
    const taskbarWindows = document.getElementById('taskbarWindows');
    taskbarWindows.innerHTML = '';
    
    minimizedWindows.forEach(window => {
        const button = document.createElement('div');
        button.className = 'taskbar-window';
        button.textContent = window.title;
        button.onclick = () => restoreWindow(window.id);
        taskbarWindows.appendChild(button);
    });
}

function restoreWindow(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        bringToFront(modal);
        
        // Remove from minimized windows
        minimizedWindows = minimizedWindows.filter(w => w.id !== modalId);
        updateTaskbar();
    }
}

// Main taskbar initialization function
function initializeTaskbar() {
    initializeStartMenu();
    initializeGlobalHandlers();
    initializeDateTimeClick(); // Ajouter l'événement de clic sur la date/heure
    updateDateTime();
    updateBattery();
    
    // Set up periodic updates
    setInterval(updateDateTime, 1000);
    setInterval(updateBattery, 300000); // Update battery every 5 minutes
}

// Initialize click event on datetime to open calendar
function initializeDateTimeClick() {
    const datetimeElement = document.getElementById('datetime');
    if (datetimeElement) {
        datetimeElement.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Play sound if function is available
            if (typeof playClickSound === 'function') {
                playClickSound();
            }
            
            console.log('🖱️ Ouverture calendrier depuis taskbar');
            openModal('calendar-modal', 'components/calendar/calendar-content.html', '📅 Calendrier', 420, 480);
        });
        
        console.log('✅ Event listener ajouté sur datetime pour calendrier');
    } else {
        console.warn('⚠️ Élément datetime introuvable');
    }
}