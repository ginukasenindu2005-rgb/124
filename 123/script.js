/* =========================================================================
   PITIGALA GEO-PLATFORM — script.js
   Sections:
   1. Navigation (mobile toggle + active link highlighting)
   2. Scroll-reveal animation for content blocks
   3. Education bar-chart animation on scroll into view
   4. Leaflet.js Geo-Portal (map, markers, layer toggles, data export)
   5. Community forum (dummy comment submission)
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  initNav();
  initScrollReveal();
  initEducationBars();
  initGeoPortal();
  initCommunityForm();
});

/* -------------------------------------------------------------------------
   1. NAVIGATION
   ------------------------------------------------------------------------- */
function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close the mobile menu after a link is tapped
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Highlight the nav link matching the section currently in view
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = links.querySelectorAll('a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach(sec => observer.observe(sec));
}

/* -------------------------------------------------------------------------
   2. SCROLL REVEAL
   ------------------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(item => observer.observe(item));
}

/* -------------------------------------------------------------------------
   3. EDUCATION BAR CHART — animates bar widths once visible
   ------------------------------------------------------------------------- */
function initEducationBars() {
  const rows = document.querySelectorAll('#educationBars .bar-row');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector('.bar-fill');
        const value = entry.target.getAttribute('data-value');
        // Set width on next frame so the CSS transition actually plays
        requestAnimationFrame(() => { fill.style.width = value + '%'; });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  rows.forEach(row => observer.observe(row));
}

/* -------------------------------------------------------------------------
   4. GEO-PORTAL — Leaflet.js map, landmark layers, data export
   ------------------------------------------------------------------------- */
function initGeoPortal() {
  // Approximate centre of Pitigala, Galle District, Sri Lanka (WGS84)
  const PITIGALA_CENTER = [6.3517, 80.2161];

  const map = L.map('map', {
    scrollWheelZoom: false,
    center: PITIGALA_CENTER,
    zoom: 14,
  });

  // Basemap — OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Enable scroll-zoom only once the user has clicked into the map,
  // so the page can still scroll normally over it.
  map.on('focus', () => map.scrollWheelZoom.enable());
  map.on('blur', () => map.scrollWheelZoom.disable());

  /* Mock landmark dataset — coordinates are approximate/illustrative,
     offset around the village centre point for demonstration. Replace
     with surveyed coordinates for production use. */
  const landmarkData = {
    nature: [
      { name: 'Kalu Dola', desc: 'Forest stream, popular walking & bathing spot.', coords: [6.3562, 80.2098] },
      { name: 'Kaludiya Pokuna', desc: 'Tranquil, tree-shaded natural pond.', coords: [6.3471, 80.2233] },
    ],
    factory: [
      { name: 'Athukorala Tea Factory Tea Centre', desc: 'Main landmark — tea plucking & factory tour.', coords: [6.3517, 80.2161] },
    ],
    services: [
      { name: 'Pitigala Post Office', desc: 'Public postal service.', coords: [6.3529, 80.2149] },
      { name: 'Pitigala Bus Stand', desc: 'Central transport hub.', coords: [6.3505, 80.2172] },
      { name: 'Public Library', desc: 'Community reading & resource centre.', coords: [6.3540, 80.2130] },
      { name: 'Police Station', desc: 'Public safety & administration.', coords: [6.3486, 80.2151] },
    ],
    banks: [
      { name: 'Bank of Ceylon (BOC)', desc: 'Branch office.', coords: [6.3523, 80.2178] },
      { name: 'HNB', desc: 'Hatton National Bank branch.', coords: [6.3512, 80.2190] },
      { name: "People's Bank", desc: 'Branch office.', coords: [6.3499, 80.2160] },
      { name: 'Co-op Rural Bank', desc: 'Community banking services.', coords: [6.3534, 80.2168] },
      { name: 'RDB', desc: 'Regional Development Bank.', coords: [6.3491, 80.2185] },
      { name: 'Commercial Bank', desc: 'Branch office.', coords: [6.3548, 80.2185] },
    ],
  };

  // Colour-coded circle markers, grouped into Leaflet layer groups
  const layerColors = { nature: '#3F6B45', factory: '#A13E2B', services: '#D9A441', banks: '#1E3626' };

  function buildLayer(key) {
    const markers = landmarkData[key].map(place => {
      const marker = L.circleMarker(place.coords, {
        radius: key === 'factory' ? 10 : 7,
        color: '#F3ECDB',
        weight: 2,
        fillColor: layerColors[key],
        fillOpacity: 0.95,
      });
      marker.bindPopup(`<b>${place.name}</b><br>${place.desc}`);
      return marker;
    });
    return L.layerGroup(markers);
  }

  const layers = {
    nature: buildLayer('nature'),
    factory: buildLayer('factory'),
    services: buildLayer('services'),
    banks: buildLayer('banks'),
  };

  Object.values(layers).forEach(layer => layer.addTo(map));

  // Wire the UI toggle switches to show/hide each layer group
  const toggleMap = {
    layerNature: 'nature',
    layerFactory: 'factory',
    layerServices: 'services',
    layerBanks: 'banks',
  };

  Object.entries(toggleMap).forEach(([inputId, layerKey]) => {
    const input = document.getElementById(inputId);
    input.addEventListener('change', () => {
      if (input.checked) {
        map.addLayer(layers[layerKey]);
      } else {
        map.removeLayer(layers[layerKey]);
      }
    });
  });

  // Format chip selection (visual state for the export format radios)
  const formatRow = document.getElementById('formatRow');
  formatRow.addEventListener('change', () => {
    formatRow.querySelectorAll('.format-chip').forEach(chip => {
      chip.classList.toggle('active', chip.querySelector('input').checked);
    });
  });

  // --- Extract / Download Geospatial Data -------------------------------
  const exportBtn = document.getElementById('exportBtn');
  const exportStatus = document.getElementById('exportStatus');

  exportBtn.addEventListener('click', () => {
    const format = formatRow.querySelector('input[name="format"]:checked').value;

    // Flatten every landmark from every layer into one feature list
    const allPlaces = Object.entries(landmarkData).flatMap(([category, places]) =>
      places.map(p => ({ ...p, category }))
    );

    let fileContent, mimeType, extension;

    if (format === 'GeoJSON') {
      const geojson = {
        type: 'FeatureCollection',
        features: allPlaces.map(p => ({
          type: 'Feature',
          properties: { name: p.name, description: p.desc, category: p.category },
          geometry: { type: 'Point', coordinates: [p.coords[1], p.coords[0]] } // [lon, lat]
        }))
      };
      fileContent = JSON.stringify(geojson, null, 2);
      mimeType = 'application/geo+json';
      extension = 'geojson';
    } else if (format === 'CSV') {
      const header = 'name,category,latitude,longitude,description\n';
      const rows = allPlaces.map(p =>
        `"${p.name}","${p.category}",${p.coords[0]},${p.coords[1]},"${p.desc}"`
      ).join('\n');
      fileContent = header + rows;
      mimeType = 'text/csv';
      extension = 'csv';
    } else { // KML
      const placemarks = allPlaces.map(p => `
    <Placemark>
      <name>${p.name}</name>
      <description>${p.desc}</description>
      <Point><coordinates>${p.coords[1]},${p.coords[0]},0</coordinates></Point>
    </Placemark>`).join('');
      fileContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Pitigala Landmarks</name>${placemarks}
  </Document>
</kml>`;
      mimeType = 'application/vnd.google-earth.kml+xml';
      extension = 'kml';
    }

    // Trigger a real browser download of the generated file
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pitigala-landmarks.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    exportStatus.textContent = `Exported ${allPlaces.length} landmark points as ${format}.`;
  });
}

/* -------------------------------------------------------------------------
   5. COMMUNITY FORUM — dummy comment submission
   ------------------------------------------------------------------------- */
function initCommunityForm() {
  const form = document.getElementById('commentForm');
  const list = document.getElementById('commentsList');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('cName').value.trim();
    const topic = document.getElementById('cTopic').value;
    const message = document.getElementById('cMessage').value.trim();

    if (!name || !message) return;

    const comment = document.createElement('article');
    comment.className = 'comment new-comment';
    comment.innerHTML = `
      <div class="avatar">${name.charAt(0).toUpperCase()}</div>
      <div class="comment-body">
        <div class="comment-head"><b>${escapeHTML(name)}</b><time>Just now</time></div>
        <p>${escapeHTML(message)}</p>
        <span class="comment-tag">${escapeHTML(topic)}</span>
      </div>`;

    // Newest comment appears first
    list.insertBefore(comment, list.firstChild);
    form.reset();

    comment.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

// Basic HTML-escaping so user-submitted text can't break markup
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
