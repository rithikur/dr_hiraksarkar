document.addEventListener('DOMContentLoaded', () => {

    // ===== SCROLL REVEAL =====
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
    els.forEach(el => obs.observe(el));

    // ===== NEWSPAPER BACKGROUND GENERATOR =====
    const newspaperReveal = document.getElementById('newspaperReveal');
    const newspaperBg = document.getElementById('newspaperBg');

    if (newspaperBg) {
        const headings = ['CORE EXPERTISE', 'TECHNICAL PROFICIENCY', 'RESEARCH DOMAINS', 'ROBOTICS & AI', 'ADVANCED PROJECTS', 'PUBLICATIONS', 'SIGNAL PROCESSING', 'SPACE WEATHER', 'EMBEDDED SYSTEMS', 'ACADEMIC FOCUS', 'PATENT PORTFOLIO', 'ENGINEERING LAB', 'MECHATRONICS', 'REMOTE SENSING', 'NEURAL INTERFACES', 'COMMUNICATION SYSTEMS', 'ATMOSPHERIC SCIENCE', 'IoT PLATFORMS', 'MACHINE VISION', 'SOLAR PHYSICS', 'EDUCATION & MENTORING'];
        const fragments = ['Robotics and Automation', 'Brain-Computer Interface Technology', 'Emerging Technologies in Mechatronics', 'Space Weather and Solar System Studies', 'Magnetohydrodynamics Research', 'Embedded Systems Architecture', 'Signal System Sensing', 'Internet of Things Platforms', 'Satellite Communication Networks', 'Atmospheric Science Observation', 'RF Propagation Modeling', 'Remote Sensing Applications', 'Electronics and Communication', 'MATLAB Simulation Environments', 'PSPICE Circuit Analysis', 'Python TensorFlow PyTorch', 'Scikit-learn OpenCV Pipelines', 'Robot Operating System ROS', 'Arduino and Raspberry Pi', 'AutoCAD and Fusion 360', '3D Printing Prototyping', 'Autonomous Obstacle Avoidance', 'Light Following Robot Design', 'Line Following Navigation', 'Robotic Arm Pick-and-Place', 'AI Chatbot NLP Libraries', 'Digital Clock and Calculator', 'Temperature Display Systems', 'Solar Powered Bot Architecture', 'Smart Dustbin Automated Lid', 'Traffic Light Simulation', 'Smart Door Sensor with Buzzer', 'Radar Using Servo Motors', 'Auto Home Cleaner Battery', 'Gear Bot Car Mechanisms', 'Bridge Construction Models', 'TinkerCAD 3D Modeling', 'Interactive Circuit Design', 'Scratch Programming Education', 'Machine Vision Projects', 'Fire Monitoring UAV System', 'High-Resolution Night-Vision', 'Image Processing Algorithms', 'Color Segmentation Analysis', 'Texture Analysis Methods', 'Pattern Recognition Systems', 'Solar Flare Early Detection', 'Cyclonic Formation Prediction', 'Space Weather Remote Sensing', 'ELF and VLF Noise Studies', 'Nor\'wester Characterization', 'Spatiotemporal Hailstorm Analysis', 'IMD Radar Data Processing', 'ML-Based Climate Prediction', 'Big Data Smart Climate Models', 'IoT Wireless Sensor Networks', 'Exoskeleton Physical Therapy', 'VR-ML Personalized Learning', 'Electric and Hybrid Vehicle', 'Microcontroller Design Lab', 'Sensors and Signal Processing', 'SCI/Scopus Indexed Journals', 'IEEE Xplore Publications', 'Springer Research Articles', 'International Conference Papers', 'Best Paper Award IEEE 2017', 'UK Design Patent 6487213', 'University Fellowship Recipient', 'KPR Institute of Engineering', 'Techno India University Kolkata', 'Ph.D. Electronics Communication', 'M.Tech Grade 9.0/10', 'BCI Neural Signal Decoding', 'Wavelet Transform Analysis', 'Fourier Spectral Methods', 'Convolutional Neural Networks', 'Deep Learning Classification', 'Autonomous Navigation Systems', 'Mechatronics Integration', 'Servo Control Algorithms', 'PID Controller Design', 'Wireless Telemetry Systems', 'Data Acquisition Modules', 'Real-Time Processing Units', 'Edge Computing IoT Devices', 'Cloud-Connected Sensors', 'FPGA Digital Design', 'PCB Layout and Fabrication', 'Analog and Digital Circuits', 'Power Electronics Systems', 'Motor Drive Controllers', 'Renewable Energy Systems', 'Solar Panel Optimization', 'Battery Management Systems'];
        const dividers = ['◆ ◆ ◆', '— — —', '• • •', '✦ ✦ ✦', '───────'];

        function shuffle(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

        function generateNewspaperContent() {
            let html = '';
            const shuffledFragments = shuffle(fragments);
            const shuffledHeadings = shuffle(headings);
            let fragIdx = 0, headIdx = 0;

            for (let block = 0; block < 30; block++) {
                html += `<span class="np-heading">${shuffledHeadings[headIdx % shuffledHeadings.length]}</span>`;
                headIdx++;
                const lineCount = 3 + Math.floor(Math.random() * 5);
                for (let l = 0; l < lineCount; l++) {
                    const partsCount = 2 + Math.floor(Math.random() * 3);
                    let line = '';
                    for (let p = 0; p < partsCount; p++) {
                        line += shuffledFragments[fragIdx % shuffledFragments.length];
                        fragIdx++;
                        if (p < partsCount - 1) line += ' · ';
                    }
                    html += `<span class="np-line">${line}.</span>`;
                }
                if (Math.random() > 0.5) html += `<span class="np-divider">${pick(dividers)}</span>`;
            }
            return html;
        }
        newspaperBg.innerHTML = generateNewspaperContent();
    }

    // ===== TEXT PRESSURE EFFECT =====
    const distFn = (a, b) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    const getAttr = (distance, maxDist, minVal, maxVal) => {
        const val = maxVal - Math.abs((maxVal * distance) / maxDist);
        return Math.max(minVal, val + minVal);
    };

    const lines = document.querySelectorAll('.text-pressure-title');
    lines.forEach(line => {
        const text = line.dataset.text || line.textContent.trim();
        line.innerHTML = text.split('').map(char =>
            char === ' ' ? `<span style="display:inline-block;width:0.3em">&nbsp;</span>` : `<span data-char="${char}" style="display:inline-block;color:var(--fg)">${char}</span>`
        ).join('');
    });

    const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: cursor.x, y: cursor.y };
    const heroSection = document.querySelector('.header');
    let targetIntensity = 1.0, currentIntensity = 1.0;
    const REST_WGHT = 800, REST_WDTH = 100;

    if (heroSection) {
        heroSection.addEventListener('mouseenter', () => { if (newspaperReveal) newspaperReveal.classList.add('active'); });
        heroSection.addEventListener('mouseleave', () => { if (newspaperReveal) newspaperReveal.classList.remove('active'); });
    }

    window.addEventListener('mousemove', e => { cursor.x = e.clientX; cursor.y = e.clientY; }, { passive: true });
    window.addEventListener('touchmove', e => { if (e.touches.length > 0) { cursor.x = e.touches[0].clientX; cursor.y = e.touches[0].clientY; } }, { passive: true });

    function animateTextPressure() {
        mouse.x += (cursor.x - mouse.x) * 0.12;
        mouse.y += (cursor.y - mouse.y) * 0.12;
        if (newspaperReveal && heroSection) {
            const rect = heroSection.getBoundingClientRect();
            newspaperReveal.style.setProperty('--mx', `${mouse.x - rect.left}px`);
            newspaperReveal.style.setProperty('--my', `${mouse.y - rect.top}px`);
        }
        lines.forEach(line => {
            const rect = line.getBoundingClientRect();
            if (rect.width === 0) return;
            const maxDist = rect.width / 2;
            line.querySelectorAll('span').forEach(span => {
                const sRect = span.getBoundingClientRect();
                const d = distFn(mouse, { x: sRect.x + sRect.width / 2, y: sRect.y + sRect.height / 2 });
                const wght = Math.floor(REST_WGHT + (getAttr(d, maxDist, 500, 900) - REST_WGHT) * currentIntensity);
                const wdth = Math.floor(REST_WDTH + (getAttr(d, maxDist, 60, 140) - REST_WDTH) * currentIntensity);
                span.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}`;
            });
        });
        requestAnimationFrame(animateTextPressure);
    }
    animateTextPressure();

    // ===== DATA.JSON LOADER =====
    const isSubPage = window.location.pathname.includes('/pages/');
    const dataPath = isSubPage ? '../data.json' : 'data.json';
    let globalSiteData = null;

    fetch(dataPath)
        .then(res => res.json())
        .then(data => {
            if (!data) return;
            globalSiteData = data;

            // 1. Hero Section
            if (data.hero) {
                const titleEls = document.querySelectorAll('.text-pressure-title');
                if (titleEls.length > 0 && !isSubPage) {
                    titleEls[0].dataset.text = data.hero.title;
                    const text = data.hero.title;
                    titleEls[0].innerHTML = text.split('').map(char =>
                        char === ' ' ? `<span style="display:inline-block;width:0.3em">&nbsp;</span>` : `<span data-char="${char}" style="display:inline-block;color:var(--fg)">${char}</span>`
                    ).join('');
                }
                const roleEl = document.querySelector('.role-badge');
                if (roleEl) roleEl.textContent = data.hero.role;
                const deptEl = document.querySelector('.dept-text');
                if (deptEl) deptEl.textContent = data.hero.dept;
                
                const linksContainer = document.querySelector('.hero-links, .footer-links');
                if (linksContainer && data.hero.links) {
                    linksContainer.innerHTML = data.hero.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join('');
                }

                const marqueeTracks = document.querySelectorAll('.marquee-content');
                if (marqueeTracks.length > 0 && data.hero.marquee) {
                    const marqueeHtml = data.hero.marquee.map(s => `<span>${s}</span><span class="sep">◆</span>`).join('');
                    marqueeTracks.forEach(track => track.innerHTML = marqueeHtml);
                }
            }

            // 1.5 Page Subtitles
            if (data.subtitles) {
                const subtitleEl = document.querySelector('.page-subtitle');
                if (subtitleEl) {
                    if (window.location.pathname.includes('projects.html')) subtitleEl.textContent = data.subtitles.projects;
                    if (window.location.pathname.includes('publications.html')) subtitleEl.textContent = data.subtitles.publications;
                    if (window.location.pathname.includes('teaching.html')) subtitleEl.textContent = data.subtitles.teaching;
                }
            }

            // 2. About Section
            if (data.about) {
                const aboutTextContent = document.querySelector('.about-text-content');
                if (aboutTextContent) {
                    const shortBioP = aboutTextContent.querySelector('p.about-text:first-child');
                    if (shortBioP) {
                        let shortText = data.about.shortBio || '';
                        if (data.about.experienceYears) {
                            shortText = shortText.replace(data.about.experienceYears, `<strong>${data.about.experienceYears}</strong>`);
                        }
                        shortBioP.innerHTML = shortText;
                    }
                    const extBioDiv = document.getElementById('extendedBio');
                    if (extBioDiv) {
                        extBioDiv.innerHTML = `
                            <p class="about-text" style="margin-bottom: 1rem;">${data.about.extendedBio1 || ''}</p>
                            <p class="about-text">${data.about.extendedBio2 || ''}</p>
                        `;
                    }
                }
                const aboutImg = document.querySelector('#about img');
                if (aboutImg && data.about.image) aboutImg.src = isSubPage ? '../' + data.about.image : data.about.image;
            }

            // 3. Stats
            const statsGrid = document.querySelector('.stats-grid');
            if (statsGrid && data.stats) {
                statsGrid.innerHTML = data.stats.map(s => {
                    const numPart = s.num.toString().replace(/[^0-9.]/g, '');
                    const plusPart = s.num.toString().replace(/[0-9.]/g, '');
                    return `<div class="stat-item"><div class="stat-num">${numPart}<span class="plus">${plusPart}</span></div><div class="stat-label">${s.label}</div></div>`;
                }).join('');
            }

            // 4. Projects
            const projGrid = document.querySelector('.projects-grid, .proj-list');
            if (projGrid && data.projects) {
                const isProjectsPage = window.location.pathname.includes('projects.html');
                const projectsToShow = isProjectsPage ? data.projects : data.projects.slice(0, 4);
                projGrid.innerHTML = projectsToShow.map(p => {
                    if (isProjectsPage) {
                        return `<div class="proj-entry"><div class="proj-entry-num">${p.id}</div><div class="proj-entry-body"><div class="proj-name">${p.name}</div><div class="proj-desc">${p.desc}</div></div><div class="proj-entry-stack">${(p.tags || []).join(' · ')}</div></div>`;
                    } else {
                        return `<div class="proj-card"><div class="proj-num">${p.id}</div><div class="proj-name">${p.name}</div><div class="proj-desc">${p.desc}</div><div class="proj-stack">${(p.tags || []).map(t => `<span class="proj-stack-tag">${t}</span>`).join('')}</div></div>`;
                    }
                }).join('');
            }

            // 5. Publications & Patents
            const isPubsPage = window.location.pathname.includes('publications.html');
            const makePubHtml = (pub) => {
                const titleHtml = pub.link ? `<a href="${pub.link}" target="_blank" rel="noopener">${pub.title}</a>` : pub.title;
                const ifHtml = pub.impactFactor ? `<span class="pub-if">${pub.impactFactor}</span>` : '';
                return `<div class="pub-entry"><div class="pub-year">${pub.year}</div><div class="pub-body"><div class="pub-title">${titleHtml}</div><div class="pub-venue">${pub.venue} ${ifHtml}</div></div></div>`;
            };

            if (isPubsPage) {
                const journalSection = document.getElementById('journals-section');
                if (journalSection && data.publications) {
                    journalSection.querySelectorAll('.pub-entry').forEach(e => e.remove());
                    journalSection.insertAdjacentHTML('beforeend', data.publications.filter(p => p.type === 'journal').map(makePubHtml).join(''));
                }
                const confSection = document.getElementById('conferences-section');
                if (confSection && data.publications) {
                    confSection.querySelectorAll('.pub-entry').forEach(e => e.remove());
                    confSection.insertAdjacentHTML('beforeend', data.publications.filter(p => p.type === 'conference').map(makePubHtml).join(''));
                }
                const booksPatentsSection = document.getElementById('books-patents');
                if (booksPatentsSection) {
                    booksPatentsSection.querySelectorAll('.pub-entry').forEach(e => e.remove());
                    let html = '';
                    if (data.patents) html += data.patents.map(makePubHtml).join('');
                    if (data.books) html += data.books.map(makePubHtml).join('');
                    booksPatentsSection.insertAdjacentHTML('beforeend', html);
                }
            } else {
                const pubsSection = document.getElementById('publications');
                if (pubsSection && data.publications) {
                    pubsSection.querySelectorAll('.pub-entry').forEach(e => e.remove());
                    const label = pubsSection.querySelector('.section-label');
                    if (label) label.insertAdjacentHTML('afterend', data.publications.slice(0, 4).map(makePubHtml).join(''));
                }
                const patentsSection = document.getElementById('patents');
                if (patentsSection && data.patents) {
                    patentsSection.querySelectorAll('.pub-entry').forEach(e => e.remove());
                    const label = patentsSection.querySelector('.section-label');
                    if (label) label.insertAdjacentHTML('afterend', data.patents.slice(0, 2).map(makePubHtml).join(''));
                }
            }

            // 6. Experience
            const expContainer = document.querySelector('.exp-accordion');
            if (expContainer && data.experience) {
                expContainer.innerHTML = data.experience.map((e, idx) => `
                    <div class="exp-panel ${idx === 0 ? 'active' : ''}">
                        <div class="panel-year-side">${e.duration}</div>
                        <div class="panel-content"><div class="panel-role">${e.role}</div><div class="panel-org">${e.org}</div></div>
                    </div>
                `).join('');
            }

            // 7. Education
            const eduGrid = document.querySelector('.edu-grid');
            if (eduGrid && data.education) {
                eduGrid.innerHTML = data.education.map(e => `
                    <div class="edu-card" data-year="${e.year}">
                        <div class="edu-degree">${e.degree}</div><div class="edu-inst">${e.inst}</div>
                        ${e.note ? `<div class="edu-note">${e.note}</div>` : ''}
                    </div>
                `).join('');
            }

            // 8. Honors
            const honorsContainer = document.querySelector('.honors-badges');
            if (honorsContainer && data.honors) {
                honorsContainer.innerHTML = data.honors.map(h => `<div class="honor-badge"><span class="honor-icon">✦</span> ${h}</div>`).join('');
            }

            // 9. Teaching
            const teachingWrapper = document.getElementById('teaching-content') || document.getElementById('teaching');
            if (teachingWrapper && data.teaching) {
                const isTeachingPage = window.location.pathname.includes('teaching.html');
                const teachingToShow = isTeachingPage ? data.teaching : data.teaching.slice(0, 1);
                const teachingHtml = teachingToShow.map(org => {
                    const coursesHtml = (org.courses || []).map(c => `<div class="teach-card"><div class="teach-course">${c.course}</div><div class="teach-level">${c.level}</div></div>`).join('');
                    return `<div class="teach-group"><div class="teach-org"><div class="teach-org-name">${org.org}</div><div class="teach-org-duration">${org.duration}</div></div><div class="teach-grid">${coursesHtml}</div></div>`;
                }).join('');

                if (isTeachingPage) {
                    teachingWrapper.querySelectorAll('.teach-group').forEach(e => e.remove());
                    teachingWrapper.insertAdjacentHTML('beforeend', teachingHtml);
                } else {
                    const label = teachingWrapper.querySelector('.section-label');
                    teachingWrapper.querySelectorAll('.teach-group').forEach(e => e.remove());
                    if (label) label.insertAdjacentHTML('afterend', teachingHtml);
                }
            }
        });

    // ===== SEARCH LOGIC =====
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    const searchResults = document.getElementById('searchResults');

    if (searchBtn && searchOverlay) {
        searchBtn.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            setTimeout(() => searchInput.focus(), 100);
        });

        searchCloseBtn.addEventListener('click', () => searchOverlay.classList.remove('active'));
        
        window.addEventListener('keydown', e => {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                searchOverlay.classList.remove('active');
            }
        });

        searchInput.addEventListener('input', e => {
            const query = e.target.value.toLowerCase().trim();
            if (!query || !globalSiteData) {
                searchResults.innerHTML = '';
                return;
            }

            let results = [];
            
            // Search Projects
            if (globalSiteData.projects) {
                globalSiteData.projects.forEach(p => {
                    if (p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query) || (p.tags || []).some(t => t.toLowerCase().includes(query))) {
                        results.push({ type: 'Project', title: p.name, desc: p.desc, url: isSubPage ? 'projects.html' : 'pages/projects.html' });
                    }
                });
            }

            // Search Publications/Patents/Books
            const pubCats = ['publications', 'patents', 'books'];
            pubCats.forEach(cat => {
                if (globalSiteData[cat]) {
                    globalSiteData[cat].forEach(p => {
                        if (p.title.toLowerCase().includes(query) || p.venue.toLowerCase().includes(query)) {
                            results.push({ type: cat.slice(0, -1), title: p.title, desc: p.venue, url: isSubPage ? 'publications.html' : 'pages/publications.html' });
                        }
                    });
                }
            });

            // Search Experience/Education
            ['experience', 'education'].forEach(cat => {
                if (globalSiteData[cat]) {
                    globalSiteData[cat].forEach(e => {
                        const searchStr = `${e.role || e.degree} ${e.org || e.inst} ${e.note || ''}`.toLowerCase();
                        if (searchStr.includes(query)) {
                            results.push({ type: cat, title: e.role || e.degree, desc: e.org || e.inst, url: isSubPage ? '../index.html#experience' : '#experience' });
                        }
                    });
                }
            });

            searchResults.innerHTML = results.slice(0, 10).map(r => `
                <a href="${r.url}" class="search-result-item">
                    <div class="result-type">${r.type}</div>
                    <div class="result-title">${r.title}</div>
                    <div class="result-desc">${r.desc}</div>
                </a>
            `).join('') || '<div class="search-no-results">No matches found.</div>';
        });
    }

    // ===== KONAMI CODE =====
    let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIdx = 0;
    window.addEventListener('keydown', e => {
        if (e.key === konamiCode[konamiIdx]) {
            konamiIdx++;
            if (konamiIdx === konamiCode.length) {
                if (newspaperReveal) newspaperReveal.classList.toggle('active');
                konamiIdx = 0;
            }
        } else {
            konamiIdx = 0;
        }
    });
});
