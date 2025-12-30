// Visitor counter functionality
async function updateVisitorCount() {
    const visitorId = 'andreiusedtosay_visitor_' + (localStorage.getItem('visitorId') || generateVisitorId());
    const lastVisit = localStorage.getItem('lastVisit');
    const today = new Date().toDateString();
    
    // Check if this is a unique visit (first time or new day)
    const isUniqueVisit = !lastVisit || lastVisit !== today;
    
    if (isUniqueVisit) {
        // Store visitor ID and last visit date
        localStorage.setItem('visitorId', visitorId.replace('myagiletoolbox_visitor_', ''));
        localStorage.setItem('lastVisit', today);
        
        try {
            // Try multiple CountAPI approaches for better persistence
            let response;
            let data;
            
            // Method 1: Try the more reliable 'get' then 'hit' approach
            try {
                // First get current count
                response = await fetch('https://api.countapi.xyz/get/forgecitizens.github.io/andreiusedtosay-unique');
                data = await response.json();
                
                if (data.value !== undefined) {
                    // Then increment
                    response = await fetch('https://api.countapi.xyz/hit/forgecitizens.github.io/andreiusedtosay-unique');
                    data = await response.json();
                } else {
                    // Create counter if doesn't exist
                    response = await fetch('https://api.countapi.xyz/create?namespace=forgecitizens.github.io&key=andreiusedtosay-unique&value=1');
                    data = await response.json();
                }
            } catch (methodError) {
                // Method 2: Fallback to simple hit
                response = await fetch('https://api.countapi.xyz/hit/forgecitizens.github.io/andreiusedtosay-persistent');
                data = await response.json();
            }
            
            if (data.value) {
                // Store the count locally as backup
                localStorage.setItem('backupVisitorCount', data.value.toString());
                document.getElementById('visitorCount').textContent = data.value.toLocaleString('fr-FR');
            } else {
                throw new Error('No valid data from CountAPI');
            }
        } catch (error) {
            console.log('CountAPI error, using backup:', error);
            // Use backup + local counting
            let backupCount = parseInt(localStorage.getItem('backupVisitorCount') || '0');
            let localIncrement = parseInt(localStorage.getItem('localVisitorIncrement') || '0') + 1;
            localStorage.setItem('localVisitorIncrement', localIncrement.toString());
            
            const totalCount = backupCount + localIncrement;
            document.getElementById('visitorCount').textContent = totalCount.toLocaleString('fr-FR');
        }
    } else {
        // Not a unique visit, just display stored count
        try {
            // Try to get fresh count without incrementing
            const response = await fetch('https://api.countapi.xyz/get/forgecitizens.github.io/andreiusedtosay-unique');
            const data = await response.json();
            
            if (data.value) {
                document.getElementById('visitorCount').textContent = data.value.toLocaleString('fr-FR');
            } else {
                throw new Error('No data from get request');
            }
        } catch (error) {
            // Use last known count
            const lastCount = localStorage.getItem('backupVisitorCount') || '1';
            const localIncrement = parseInt(localStorage.getItem('localVisitorIncrement') || '0');
            const totalCount = parseInt(lastCount) + localIncrement;
            document.getElementById('visitorCount').textContent = totalCount.toLocaleString('fr-FR');
        }
    }
}

// Generate a unique visitor ID
function generateVisitorId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 5);
    const visitorId = timestamp + randomStr;
    return visitorId;
}

// Show visitor details on click
function showVisitorDetails() {
    const visitorId = localStorage.getItem('visitorId') || 'Non défini';
    const lastVisit = localStorage.getItem('lastVisit') || 'Première visite';
    const backupCount = localStorage.getItem('backupVisitorCount') || 'Non disponible';
    
    alert('🎯 Compteur de visiteurs uniques\n\n' + 
          'Ce compteur affiche le nombre total de visiteurs uniques qui ont visité ce site.\n\n' +
          'Chaque visiteur n\'est compté qu\'une seule fois par jour.\n\n' +
          'Le système utilise plusieurs méthodes de persistance :\n' +
          '• Service principal : CountAPI.xyz\n' +
          '• Sauvegarde locale : localStorage\n' +
          '• Identification unique par appareil\n\n' +
          'Votre ID visiteur : ' + visitorId + '\n' +
          'Dernière visite : ' + lastVisit + '\n' +
          'Dernier décompte sauvegardé : ' + backupCount);
}

function initializeVisitorCounter() {
    // Add click event to visitor counter
    document.getElementById('visitorCounter').addEventListener('click', showVisitorDetails);
}