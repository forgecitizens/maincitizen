// Accordion functionality

// Legacy function for HTML onclick handlers
function toggleAccordion(sectionId) {
    const section = document.getElementById(sectionId);
    const toggleIcon = document.getElementById(sectionId.replace('-section', '-toggle'));
    
    if (!section) return;
    
    // Play click sound
    playClickSound();
    
    if (section.style.display === 'none' || section.style.display === '') {
        // Open section
        section.style.display = 'block';
        if (toggleIcon) toggleIcon.textContent = '-';
    } else {
        // Close section
        section.style.display = 'none';
        if (toggleIcon) toggleIcon.textContent = '+';
    }
}

function initializeAccordion() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            const accordionItem = this.parentElement;
            const content = accordionItem.querySelector('.accordion-content');
            const icon = this.querySelector('.accordion-icon');
            
            // Play click sound
            playClickSound();
            
            // Toggle active state
            const isActive = accordionItem.classList.contains('active');
            
            // Close all other accordion items in the same container
            const container = accordionItem.closest('.accordion-container') || document;
            container.querySelectorAll('.accordion-item').forEach(item => {
                if (item !== accordionItem) {
                    item.classList.remove('active');
                    const otherContent = item.querySelector('.accordion-content');
                    const otherIcon = item.querySelector('.accordion-icon');
                    if (otherContent) otherContent.style.height = '0px';
                    if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current item
            if (isActive) {
                // Close
                accordionItem.classList.remove('active');
                if (content) content.style.height = '0px';
                if (icon) icon.style.transform = 'rotate(0deg)';
            } else {
                // Open
                accordionItem.classList.add('active');
                if (content) {
                    content.style.height = content.scrollHeight + 'px';
                }
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });
    
    // Handle dynamic content changes
    const resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
            const content = entry.target;
            const accordionItem = content.closest('.accordion-item');
            
            if (accordionItem && accordionItem.classList.contains('active')) {
                content.style.height = content.scrollHeight + 'px';
            }
        });
    });
    
    // Observe all accordion contents
    document.querySelectorAll('.accordion-content').forEach(content => {
        resizeObserver.observe(content);
    });
}

// FAQ specific functions
function searchFAQ() {
    const searchTerm = document.getElementById('faqSearch').value.toLowerCase();
    const accordionItems = document.querySelectorAll('.accordion-item');
    let visibleCount = 0;
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        const headerText = header ? header.textContent.toLowerCase() : '';
        const contentText = content ? content.textContent.toLowerCase() : '';
        
        if (headerText.includes(searchTerm) || contentText.includes(searchTerm)) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
            // Close if hidden
            item.classList.remove('active');
            if (content) content.style.height = '0px';
        }
    });
    
    // Show/hide no results message
    const noResults = document.getElementById('noResults');
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

function clearFAQSearch() {
    const searchInput = document.getElementById('faqSearch');
    if (searchInput) {
        searchInput.value = '';
        searchFAQ(); // Reset display
    }
}

// Skills accordion functions
function filterSkills(category) {
    const skillItems = document.querySelectorAll('.skill-item');
    const filterButtons = document.querySelectorAll('.skill-filter');
    
    // Update active filter button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="filterSkills('${category}')"]`).classList.add('active');
    
    skillItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
    
    playClickSound();
}

// Portfolio accordion functions  
function filterProjects(category) {
    const projectItems = document.querySelectorAll('.project-item');
    const filterButtons = document.querySelectorAll('.project-filter');
    
    // Update active filter button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="filterProjects('${category}')"]`).classList.add('active');
    
    projectItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
    
    playClickSound();
}

function openProject(url) {
    if (url && url !== '#') {
        window.open(url, '_blank');
        playClickSound();
    }
}

// Testimonial carousel
let currentTestimonial = 0;

function showTestimonial(index) {
    const testimonials = document.querySelectorAll('.testimonial-item');
    const indicators = document.querySelectorAll('.testimonial-indicator');
    
    if (testimonials.length === 0) return;
    
    // Hide all testimonials
    testimonials.forEach(testimonial => {
        testimonial.classList.remove('active');
    });
    
    // Update indicators
    indicators.forEach(indicator => {
        indicator.classList.remove('active');
    });
    
    // Show current testimonial
    if (testimonials[index]) {
        testimonials[index].classList.add('active');
    }
    if (indicators[index]) {
        indicators[index].classList.add('active');
    }
    
    currentTestimonial = index;
}

function nextTestimonial() {
    const testimonials = document.querySelectorAll('.testimonial-item');
    const next = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(next);
    playClickSound();
}

function prevTestimonial() {
    const testimonials = document.querySelectorAll('.testimonial-item');
    const prev = currentTestimonial === 0 ? testimonials.length - 1 : currentTestimonial - 1;
    showTestimonial(prev);
    playClickSound();
}

// Auto-advance testimonials
function startTestimonialAutoplay() {
    setInterval(() => {
        const testimonials = document.querySelectorAll('.testimonial-item');
        if (testimonials.length > 1) {
            nextTestimonial();
        }
    }, 5000); // Change every 5 seconds
}