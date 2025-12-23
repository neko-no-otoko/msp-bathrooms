document.addEventListener('DOMContentLoaded', () => {
    // Minneapolis coordinates
    const MSP_COORDS = [44.9778, -93.2650];
    let map;
    let markers = [];
    let locations = [];

    // Initialize Map
    function initMap() {
        map = L.map('map', {
            zoomControl: false // We'll move it or style it if needed
        }).setView(MSP_COORDS, 14);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);
        
        // Add zoom control to top-right
        L.control.zoom({
            position: 'topright'
        }).addTo(map);

        // "Locate Me" functionality
        document.getElementById('locate-me-btn').addEventListener('click', () => {
            map.locate({setView: true, maxZoom: 16});
        });

        // Search functionality
        document.getElementById('search-input').addEventListener('input', (e) => {
            filterLocations(e.target.value);
        });
    }

    // Load Data
    async function loadLocations() {
        try {
            const response = await fetch('data.json');
            locations = await response.json();
            renderLocations(locations);
        } catch (error) {
            console.error('Error loading locations:', error);
            document.getElementById('location-list').innerHTML = '<div class="error">Failed to load locations.</div>';
        }
    }

    // Render Markers and List
    function renderLocations(data) {
        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        // Clear list
        const listContainer = document.getElementById('location-list');
        listContainer.innerHTML = '';

        if (data.length === 0) {
            listContainer.innerHTML = '<div class="no-results">No locations found.</div>';
            return;
        }

        data.forEach(loc => {
            // Add Marker
            const marker = L.marker(loc.coordinates).addTo(map);
            marker.bindPopup(`<b>${loc.name}</b><br>${loc.address}`);
            marker.on('click', () => openDetails(loc));
            markers.push(marker);

            // Add List Item
            const item = document.createElement('div');
            item.className = 'location-item';
            item.innerHTML = `
                <span class="type">${loc.type}</span>
                <h3>${loc.name}</h3>
                <div class="address"><i class="fa-solid fa-location-dot"></i> ${loc.address}</div>
            `;
            item.addEventListener('click', () => {
                map.flyTo(loc.coordinates, 16);
                marker.openPopup();
                openDetails(loc);
            });
            listContainer.appendChild(item);
        });
    }

    // Filter Locations
    function filterLocations(query) {
        const lowerQuery = query.toLowerCase();
        const filtered = locations.filter(loc => 
            loc.name.toLowerCase().includes(lowerQuery) || 
            loc.address.toLowerCase().includes(lowerQuery) ||
            loc.type.toLowerCase().includes(lowerQuery)
        );
        renderLocations(filtered);
    }

    // Details Modal
    const modal = document.getElementById('details-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = modal.querySelector('.close-modal');

    function openDetails(loc) {
        modalBody.innerHTML = `
            <h2>${loc.name}</h2>
            <p class="type" style="color: var(--primary); font-weight: 500; margin-bottom: 1rem;">${loc.type}</p>
            <p><strong><i class="fa-solid fa-location-dot"></i> Address:</strong><br>${loc.address}</p>
            <br>
            <p><strong><i class="fa-solid fa-clock"></i> Hours:</strong><br>${loc.hours}</p>
            <br>
            <p><strong><i class="fa-solid fa-wheelchair"></i> Accessibility:</strong><br>${loc.accessible_restroom ? 'Accessible Restroom Available' : 'Not listed as accessible'}</p>
            <br>
            <p><strong><i class="fa-solid fa-circle-info"></i> Notes:</strong><br>${loc.notes}</p>
        `;
        modal.classList.remove('hidden');
    }

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Suggest Modal
    const suggestBtn = document.getElementById('suggest-btn');
    const suggestModal = document.getElementById('suggest-modal');
    const closeSuggest = suggestModal.querySelector('.close-modal');
    const suggestForm = document.getElementById('suggest-form');

    suggestBtn.addEventListener('click', () => {
        suggestModal.classList.remove('hidden');
    });

    closeSuggest.addEventListener('click', () => {
        suggestModal.classList.add('hidden');
    });
    
    suggestModal.addEventListener('click', (e) => {
        if (e.target === suggestModal) {
            suggestModal.classList.add('hidden');
        }
    });

    suggestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your suggestion! We will review it shortly.');
        suggestModal.classList.add('hidden');
        suggestForm.reset();
    });

    // Start App
    initMap();
    loadLocations();
});
