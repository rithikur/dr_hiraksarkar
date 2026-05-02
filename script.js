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
        // Word pools — drawn from Dr. Sarkar's actual CV data, shuffled randomly
        const headings = [
            'CORE EXPERTISE', 'TECHNICAL PROFICIENCY', 'RESEARCH DOMAINS',
            'ROBOTICS & AI', 'ADVANCED PROJECTS', 'PUBLICATIONS',
            'SIGNAL PROCESSING', 'SPACE WEATHER', 'EMBEDDED SYSTEMS',
            'ACADEMIC FOCUS', 'PATENT PORTFOLIO', 'ENGINEERING LAB',
            'MECHATRONICS', 'REMOTE SENSING', 'NEURAL INTERFACES',
            'COMMUNICATION SYSTEMS', 'ATMOSPHERIC SCIENCE', 'IoT PLATFORMS',
            'MACHINE VISION', 'SOLAR PHYSICS', 'EDUCATION & MENTORING',
        ];

        const fragments = [
            'Robotics and Automation',
            'Brain-Computer Interface Technology',
            'Emerging Technologies in Mechatronics',
            'Space Weather and Solar System Studies',
            'Magnetohydrodynamics Research',
            'Embedded Systems Architecture',
            'Signal System Sensing',
            'Internet of Things Platforms',
            'Satellite Communication Networks',
            'Atmospheric Science Observation',
            'RF Propagation Modeling',
            'Remote Sensing Applications',
            'Electronics and Communication',
            'MATLAB Simulation Environments',
            'PSPICE Circuit Analysis',
            'Python TensorFlow PyTorch',
            'Scikit-learn OpenCV Pipelines',
            'Robot Operating System ROS',
            'Arduino and Raspberry Pi',
            'AutoCAD and Fusion 360',
            '3D Printing Prototyping',
            'Autonomous Obstacle Avoidance',
            'Light Following Robot Design',
            'Line Following Navigation',
            'Robotic Arm Pick-and-Place',
            'AI Chatbot NLP Libraries',
            'Digital Clock and Calculator',
            'Temperature Display Systems',
            'Solar Powered Bot Architecture',
            'Smart Dustbin Automated Lid',
            'Traffic Light Simulation',
            'Smart Door Sensor with Buzzer',
            'Radar Using Servo Motors',
            'Auto Home Cleaner Battery',
            'Gear Bot Car Mechanisms',
            'Bridge Construction Models',
            'TinkerCAD 3D Modeling',
            'Interactive Circuit Design',
            'Scratch Programming Education',
            'Machine Vision Projects',
            'Fire Monitoring UAV System',
            'High-Resolution Night-Vision',
            'Image Processing Algorithms',
            'Color Segmentation Analysis',
            'Texture Analysis Methods',
            'Pattern Recognition Systems',
            'Solar Flare Early Detection',
            'Cyclonic Formation Prediction',
            'Space Weather Remote Sensing',
            'ELF and VLF Noise Studies',
            'Nor\'wester Characterization',
            'Spatiotemporal Hailstorm Analysis',
            'IMD Radar Data Processing',
            'ML-Based Climate Prediction',
            'Big Data Smart Climate Models',
            'IoT Wireless Sensor Networks',
            'Exoskeleton Physical Therapy',
            'VR-ML Personalized Learning',
            'Electric and Hybrid Vehicle',
            'Microcontroller Design Lab',
            'Sensors and Signal Processing',
            'SCI/Scopus Indexed Journals',
            'IEEE Xplore Publications',
            'Springer Research Articles',
            'International Conference Papers',
            'Best Paper Award IEEE 2017',
            'UK Design Patent 6487213',
            'University Fellowship Recipient',
            'KPR Institute of Engineering',
            'Techno India University Kolkata',
            'Ph.D. Electronics Communication',
            'M.Tech Grade 9.0/10',
            'BCI Neural Signal Decoding',
            'Wavelet Transform Analysis',
            'Fourier Spectral Methods',
            'Convolutional Neural Networks',
            'Deep Learning Classification',
            'Autonomous Navigation Systems',
            'Mechatronics Integration',
            'Servo Control Algorithms',
            'PID Controller Design',
            'Wireless Telemetry Systems',
            'Data Acquisition Modules',
            'Real-Time Processing Units',
            'Edge Computing IoT Devices',
            'Cloud-Connected Sensors',
            'FPGA Digital Design',
            'PCB Layout and Fabrication',
            'Analog and Digital Circuits',
            'Power Electronics Systems',
            'Motor Drive Controllers',
            'Renewable Energy Systems',
            'Solar Panel Optimization',
            'Battery Management Systems',
        ];

        const dividers = ['◆ ◆ ◆', '— — —', '• • •', '✦ ✦ ✦', '───────'];

        // Fisher-Yates shuffle
        function shuffle(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        // Pick random item
        function pick(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        // Build enough content to overflow and fill the entire hero viewport
        function generateNewspaperContent() {
            let html = '';
            const shuffledFragments = shuffle(fragments);
            const shuffledHeadings = shuffle(headings);
            let fragIdx = 0;
            let headIdx = 0;

            // Generate ~200+ lines of randomized content (enough to fill any viewport)
            for (let block = 0; block < 30; block++) {
                // Add a heading
                html += `<span class="np-heading">${shuffledHeadings[headIdx % shuffledHeadings.length]}</span>`;
                headIdx++;

                // Add 3-7 fragment lines per block
                const lineCount = 3 + Math.floor(Math.random() * 5);
                for (let l = 0; l < lineCount; l++) {
                    // Combine 2-4 fragments per line for density
                    const partsCount = 2 + Math.floor(Math.random() * 3);
                    let line = '';
                    for (let p = 0; p < partsCount; p++) {
                        line += shuffledFragments[fragIdx % shuffledFragments.length];
                        fragIdx++;
                        if (p < partsCount - 1) line += ' · ';
                    }
                    html += `<span class="np-line">${line}.</span>`;
                }

                // Occasional divider
                if (Math.random() > 0.5) {
                    html += `<span class="np-divider">${pick(dividers)}</span>`;
                }
            }
            return html;
        }

        newspaperBg.innerHTML = generateNewspaperContent();
    }

    // ===== TEXT PRESSURE EFFECT =====
    const distFn = (a, b) => {
        const dx = b.x - a.x, dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    const getAttr = (distance, maxDist, minVal, maxVal) => {
        const val = maxVal - Math.abs((maxVal * distance) / maxDist);
        return Math.max(minVal, val + minVal);
    };

    const lines = document.querySelectorAll('.text-pressure-title');
    lines.forEach(line => {
        line.innerHTML = line.dataset.text.split('').map(char =>
            char === ' '
                ? `<span style="display:inline-block;width:0.3em">&nbsp;</span>`
                : `<span data-char="${char}" style="display:inline-block;color:var(--fg)">${char}</span>`
        ).join('');
    });

    // Virtual cursor — this is what the text reacts to
    const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    // Lerped follower — smoothly chases cursor each frame
    const mouse = { x: cursor.x, y: cursor.y };

    const heroSection = document.querySelector('.header');

    let targetIntensity = 1.0;
    let currentIntensity = 1.0;
    const REST_WGHT = 800, REST_WDTH = 100;

    // Track whether cursor is inside hero for the newspaper reveal
    let cursorInHero = false;

    if (heroSection) {
        heroSection.addEventListener('mouseenter', () => {
            cursorInHero = true;
            if (newspaperReveal) newspaperReveal.classList.add('active');
        });
        heroSection.addEventListener('mouseleave', () => {
            cursorInHero = false;
            if (newspaperReveal) newspaperReveal.classList.remove('active');
        });
    }

    // 1. Mouse (Desktop)
    window.addEventListener('mousemove', e => {
        cursor.x = e.clientX;
        cursor.y = e.clientY;
    }, { passive: true });

    // 2. Touch (Mobile fallback)
    window.addEventListener('touchmove', e => {
        if (e.touches.length > 0) {
            cursor.x = e.touches[0].clientX;
            cursor.y = e.touches[0].clientY;
        }
    }, { passive: true });

    // ===== 3. GYROSCOPE — HIGH-PERFORMANCE MOBILE TRACKING =====
    let gyroActive = false;

    // Auto-adjusting baseline so it's always centered wherever the user holds it
    let baseBeta = 0;
    let baseGamma = 0;
    let hasBaseline = false;

    // Smoothed delta for fluid motion
    let smoothX = 0;
    let smoothY = 0;
    const MAX_TILT = 25; // Degrees of tilt to reach edge of screen

    function handleOrientation(e) {
        if (e.beta === null || e.gamma === null) return;
        gyroActive = true;

        let b = e.beta;
        let g = e.gamma;

        // Handle screen rotation
        const angle = (screen?.orientation?.angle) ?? window.orientation ?? 0;
        if (angle === 90) {
            b = e.gamma; g = -e.beta;
        } else if (angle === -90 || angle === 270) {
            b = -e.gamma; g = e.beta;
        } else if (angle === 180) {
            b = -e.beta; g = -e.gamma;
        }

        if (!hasBaseline) {
            baseBeta = b;
            baseGamma = g;
            hasBaseline = true;
            return;
        }

        // Calculate difference from baseline
        let diffBeta = b - baseBeta;
        let diffGamma = g - baseGamma;

        // Unwrap to prevent snapping when flipping
        if (diffBeta > 180) diffBeta -= 360;
        if (diffBeta < -180) diffBeta += 360;
        if (diffGamma > 180) diffGamma -= 360;
        if (diffGamma < -180) diffGamma += 360;

        // Auto-center the baseline slowly (drift towards current position)
        // This ensures the cursor naturally returns to center if they hold still
        baseBeta += diffBeta * 0.015;
        baseGamma += diffGamma * 0.015;

        // Current instantaneous tilt
        let tiltX = diffGamma;
        let tiltY = diffBeta;

        // Smooth out the raw tilt data (filters out hand jitter instantly)
        smoothX += (tiltX - smoothX) * 0.2;
        smoothY += (tiltY - smoothY) * 0.2;

        // Map to screen coordinates: tilt of MAX_TILT -> screen edge
        const normX = Math.max(-1, Math.min(1, smoothX / MAX_TILT));
        const normY = Math.max(-1, Math.min(1, smoothY / MAX_TILT));

        cursor.x = (window.innerWidth / 2) + normX * (window.innerWidth * 0.6);
        cursor.y = (window.innerHeight / 2) + normY * (window.innerHeight * 0.6);
    }

    function startGyro() {
        window.addEventListener('deviceorientation', handleOrientation, true);
    }

    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        const requestGyro = () => {
            if (gyroActive) return;
            DeviceOrientationEvent.requestPermission()
                .then(s => { if (s === 'granted') startGyro(); })
                .catch(console.error);
        };
        document.body.addEventListener('click', requestGyro, { once: true });
        document.body.addEventListener('touchstart', requestGyro, { once: true });
    } else {
        startGyro();
    }

    // ===== ANIMATION LOOP =====
    let lastFrameTime = 0;

    function animateTextPressure(timestamp) {
        const dt = lastFrameTime ? Math.min((timestamp - lastFrameTime) / 16.667, 3) : 1;
        lastFrameTime = timestamp;

        // Ultra-smooth follower for both mouse and gyro
        const step = 1 - Math.pow(1 - 0.12, dt);
        mouse.x += (cursor.x - mouse.x) * step;
        mouse.y += (cursor.y - mouse.y) * step;

        const lerpSpeed = targetIntensity > currentIntensity ? 0.08 : 0.04;
        currentIntensity += (targetIntensity - currentIntensity) * lerpSpeed;

        // Update newspaper reveal mask position (relative to hero section)
        if (newspaperReveal && heroSection) {
            const heroRect = heroSection.getBoundingClientRect();
            // Convert viewport coords to hero-local coords
            const localX = mouse.x - heroRect.left;
            const localY = mouse.y - heroRect.top;
            newspaperReveal.style.setProperty('--mx', `${localX}px`);
            newspaperReveal.style.setProperty('--my', `${localY}px`);
        }

        lines.forEach(line => {
            const titleRect = line.getBoundingClientRect();
            if (titleRect.width === 0) return;
            const maxDist = titleRect.width / 2;
            line.querySelectorAll('span').forEach(span => {
                const rect = span.getBoundingClientRect();
                const d = distFn(mouse, { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
                const fullWght = Math.floor(getAttr(d, maxDist, 500, 900));
                const fullWdth = Math.floor(getAttr(d, maxDist, 60, 140));
                const wght = Math.floor(REST_WGHT + (fullWght - REST_WGHT) * currentIntensity);
                const wdth = Math.floor(REST_WDTH + (fullWdth - REST_WDTH) * currentIntensity);
                const s = `'wght' ${wght}, 'wdth' ${wdth}`;
                if (span.style.fontVariationSettings !== s) span.style.fontVariationSettings = s;
            });
        });

        requestAnimationFrame(animateTextPressure);
    }

    animateTextPressure();

    // ===== KONAMI CODE =====
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let konamiIndex = 0, auroraActive = false;
    document.addEventListener('keydown', e => {
        if (e.code === konamiCode[konamiIndex]) {
            if (++konamiIndex === konamiCode.length) {
                konamiIndex = 0;
                auroraActive = !auroraActive;
                document.body.classList.toggle('aurora-active', auroraActive);
                const toast = document.getElementById('easterToast');
                if (toast) {
                    toast.textContent = auroraActive ? '🌌 Aurora mode activated!' : '🌙 Aurora mode deactivated.';
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 3000);
                }
            }
        } else { konamiIndex = 0; }
    });

    // ===== PORTFOLIO SEARCH =====
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchCloseBtn = document.getElementById('searchCloseBtn');

    if (searchBtn && searchOverlay && searchInput && searchResults) {

        // --- Build search index from page content ---
        const localSearchIndex = [];

        // Projects (index page)
        document.querySelectorAll('.proj-card').forEach(card => {
            const name = card.querySelector('.proj-name')?.textContent.trim() || '';
            const desc = card.querySelector('.proj-desc')?.textContent.trim() || '';
            localSearchIndex.push({
                title: name,
                text: `${name} — ${desc}`,
                el: card,
                label: 'Project'
            });
        });

        // Project entries (sub-pages)
        document.querySelectorAll('.proj-entry').forEach(entry => {
            const name = entry.querySelector('.proj-name')?.textContent.trim() || '';
            const desc = entry.querySelector('.proj-desc')?.textContent.trim() || '';
            localSearchIndex.push({
                title: name,
                text: `${name} — ${desc}`,
                el: entry,
                label: 'Project'
            });
        });

        // Publications
        document.querySelectorAll('#publications .pub-entry, .pub-entry').forEach(entry => {
            const title = entry.querySelector('.pub-title')?.textContent.trim() || '';
            localSearchIndex.push({
                title: title,
                text: title,
                el: entry,
                label: 'Publication'
            });
        });

        // Experience
        document.querySelectorAll('.exp-panel').forEach(panel => {
            const title = panel.querySelector('.exp-role')?.textContent.trim() || '';
            const org = panel.querySelector('.exp-org')?.textContent.trim() || '';
            localSearchIndex.push({
                title: title,
                text: `${title} — ${org}`,
                el: panel,
                label: 'Experience'
            });
        });

        // Education
        document.querySelectorAll('.edu-card').forEach(card => {
            const degree = card.querySelector('.edu-degree')?.textContent.trim() || '';
            const inst = card.querySelector('.edu-inst')?.textContent.trim() || '';
            localSearchIndex.push({
                title: degree,
                text: `${degree} — ${inst}`,
                el: card,
                label: 'Education'
            });
        });

        // Honors
        document.querySelectorAll('.honor-badge').forEach(badge => {
            const text = badge.textContent.trim();
            localSearchIndex.push({
                title: text,
                text: text,
                el: badge,
                label: 'Honor'
            });
        });

        // Teaching
        document.querySelectorAll('.teach-card').forEach(card => {
            const course = card.querySelector('.teach-course')?.textContent.trim() || '';
            localSearchIndex.push({
                title: course,
                text: course,
                el: card,
                label: 'Teaching'
            });
        });

        // Skills from marquee
        document.querySelectorAll('.marquee-content:first-child > span:not(.sep)').forEach(span => {
            const text = span.textContent.trim();
            localSearchIndex.push({
                title: text,
                text: text,
                el: span,
                label: 'Skill'
            });
        });

        // Stats
        document.querySelectorAll('.stat-item').forEach(item => {
            const num = item.querySelector('.stat-num')?.textContent.trim() || '';
            const label = item.querySelector('.stat-label')?.textContent.trim() || '';
            localSearchIndex.push({
                title: label,
                text: `${num} ${label}`,
                el: item,
                label: 'Stat'
            });
        });

        // --- Prepare full search index ---
        const searchIndex = [...localSearchIndex];
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isSubPage = window.location.pathname.includes('/pages/');
        const basePath = isSubPage ? '' : 'pages/';
        const indexBasePath = isSubPage ? '../' : '';

        // If on a subpage, add index-exclusive content to the search index
        if (isSubPage) {
            const indexItems = [
                { title: 'Assistant Professor III', text: 'Assistant Professor III — KPR Institute of Engineering and Technology', label: 'Experience' },
                { title: 'Sr. Faculty & Coordinator', text: 'Sr. Faculty & Coordinator — Aces Infotech Pvt. Ltd.', label: 'Experience' },
                { title: 'Robotics & AI-ML Trainer', text: 'Robotics & AI-ML Trainer — BrightChamps', label: 'Experience' },
                { title: 'Assistant Professor · ECE', text: 'Assistant Professor · ECE — Techno India University', label: 'Experience' },
                { title: 'Ph.D.', text: 'Ph.D. — Techno India University', label: 'Education' },
                { title: 'M.Tech', text: 'M.Tech — Techno India University', label: 'Education' },
                { title: 'B.Tech', text: 'B.Tech — MAKAUT', label: 'Education' },
                { title: 'Best Paper Award', text: 'Best Paper Award — IEEE Xplore', label: 'Honor' },
                { title: 'UK Design Patent No. 6487213', text: 'UK Design Patent No. 6487213', label: 'Honor' },
                { title: 'Established 2 Robotics & AI Labs', text: 'Established 2 Robotics & AI Labs', label: 'Honor' },
                { title: 'Faculty-in-Charge', text: 'Faculty-in-Charge, EV Lab Centre', label: 'Honor' },
                { title: 'University Fellowship', text: 'University Fellowship — Techno India', label: 'Honor' },
                { title: 'Ranked 3rd M.Tech batch', text: 'Ranked 3rd M.Tech batch', label: 'Honor' },
                { title: 'Journal Reviewer', text: 'Journal Reviewer', label: 'Honor' },
                { title: 'Editorial Assistant', text: 'Editorial Assistant', label: 'Honor' }
            ];
            indexItems.forEach(item => {
                searchIndex.push({ ...item, url: `${indexBasePath}index.html` });
            });
        }

        // Additional projects not on index
        if (!currentPage.includes('projects.html')) {
            const subProjects = [
                { title: 'Smart Auto Cleaner Bot', text: 'Smart Auto Cleaner Bot — Floor-cleaning robot with obstacle avoidance' },
                { title: 'AI Chatbot', text: 'AI Chatbot — NLP chatbot with contextual understanding' },
                { title: 'Solar Powered Bot', text: 'Solar Powered Bot — Energy-autonomous robot powered by solar panels' },
                { title: 'Mechatronics Robot Collection', text: 'Mechatronics Robot Collection — 20+ robots for education and prototyping' },
                { title: '3D Design & Printing Pipeline', text: '3D Design & Printing Pipeline — CAD and additive manufacturing' },
                { title: 'Raspberry Pi Projects', text: 'Raspberry Pi Projects — Home automation, sensor networks, edge AI' },
                { title: 'Obstacle Avoidance Robot', text: 'Obstacle Avoidance Robot — Autonomous navigation with ultrasonic sensors' },
                { title: 'Line Following Robot', text: 'Line Following Robot — Precision line-tracking with PID control' },
                { title: 'Smart Dustbin', text: 'Smart Dustbin — Automated waste bin with proximity-triggered lid' },
                { title: 'Traffic Light Controller', text: 'Traffic Light Controller — Programmable signal system with timing logic' },
                { title: 'Scratch Programming Environment', text: 'Scratch Programming Environment — Visual programming for robotics' },
            ];
            // If we are on teaching.html or publications.html, we also need the 4 projects from index.html!
            if (isSubPage) {
                subProjects.push(
                    { title: 'Fire Monitoring UAV', text: 'Fire Monitoring UAV — Autonomous drone for real-time forest fire detection' },
                    { title: 'Autonomous Robotic Arm', text: 'Autonomous Robotic Arm — Multi-DOF robotic manipulator' },
                    { title: 'Radar Simulation System', text: 'Radar Simulation System — Ultrasonic-based radar simulator' },
                    { title: 'Machine Vision Suite', text: 'Machine Vision Suite — Object detection, tracking, and image classification' }
                );
            }
            subProjects.forEach(item => {
                searchIndex.push({ ...item, label: 'Project', url: `${basePath}projects.html` });
            });
        }

        // Additional publications and books not on index
        if (!currentPage.includes('publications.html')) {
            const subPubs = [
                { title: 'Neuroimaging and Analyzing Brain Matrices', text: 'Neuroimaging and Analyzing Brain Matrices — Journal of Sustainable Dev. Innovations' },
                { title: 'System II Transit Point Data for Jupiter\'s Rotational Speed Reduction', text: 'System II Transit Point Data for Jupiter\'s Rotational Speed Reduction — Springer' },
                { title: 'Emerging Techniques for Brain-Computer Interfacing', text: 'Emerging Techniques for Brain-Computer Interfacing — JIETE' },
                { title: 'Technologies for Mind Machine Interface', text: 'Technologies for Mind Machine Interface — JSEHM' },
                { title: 'Coupled Log Periodic Dipole Array for Receiving Solar Radio Signal', text: 'Coupled Log Periodic Dipole Array for Receiving Solar Radio Signal — JSEHM' },
                { title: 'Space Weather and Its Effects on Communication Systems via Remote Sensing', text: 'Space Weather and Its Effects on Communication Systems via Remote Sensing — JISRS' },
                { title: 'Solar Modulation of Cosmic Rays', text: 'Solar Modulation of Cosmic Rays — 2nd Intl Conf Energy & Environmental Engg' },
                { title: 'Optimization Techniques for Real-Time Intelligent Systems via ML', text: 'Optimization Techniques for Real-Time Intelligent Systems via ML — ICASCML, BITS Pilani' },
                { title: 'Real-time Forest Fire Monitoring with UAV and Image Processing', text: 'Real-time Forest Fire Monitoring with UAV and Image Processing — RAM\'26, Thailand' },
                { title: 'AI-Based IoT Infrared Flame Detection and Infrasound Fire Suppression', text: 'AI-Based IoT Infrared Flame Detection and Infrasound Fire Suppression — ICRAME 2026' },
                { title: 'Spring Mattress Structural Analysis via AI', text: 'Spring Mattress Structural Analysis via AI — ICRAME 2026' },
                { title: 'Comparative Analysis of AIS and Healthy Subjects Using EMG & GRF', text: 'Comparative Analysis of AIS and Healthy Subjects Using EMG & GRF — ICIRTM, IIT Gandhinagar' },
                { title: 'BER of OTFS vs OFDM in Multipath Fading Channel', text: 'BER of OTFS vs OFDM in Multipath Fading Channel — Engineering Advances 2025' },
                { title: 'Predicting Bike Sharing Demand', text: 'Predicting Bike Sharing Demand — Intl Conf AIEST' },
                { title: 'Cyclonic Storm MORA 2017 via Radio, Satellite, Radar', text: 'Cyclonic Storm MORA 2017 via Radio, Satellite, Radar — Springer Vol. 815' },
                { title: 'Solar Radio Signal Variations in VLF and VHF Bands', text: 'Solar Radio Signal Variations in VLF and VHF Bands — IEEE Xplore ★ Best Paper Award' },
            ];
            if (isSubPage) {
                 subPubs.push(
                    { title: 'Spatiotemporal Analysis of Severe Hailstorms Over Kolkata Using IMD Radar Data', text: 'Spatiotemporal Analysis of Severe Hailstorms Over Kolkata Using IMD Radar Data and ML Approaches' },
                    { title: 'Big Data-Driven Smart Climate Change Prediction', text: 'Big Data-Driven Smart Climate Change Prediction Using ML Framework' },
                    { title: 'Designing an IoT Platform Using Wireless Sensor Network', text: 'Designing an IoT Platform Using Wireless Sensor Network' },
                    { title: 'Comparative Study of ELF and VLF Noise Characteristics of Nor\'wester', text: 'Comparative Study of ELF and VLF Noise Characteristics of Nor\'wester' }
                 );
            }
            subPubs.forEach(item => {
                searchIndex.push({ ...item, label: 'Publication', url: `${basePath}publications.html` });
            });

            const subBooks = [
                { title: 'Beginner\'s Guide to Electronics and Robotics', text: 'Beginner\'s Guide to Electronics and Robotics — LAP Lambert Academic Publishing' },
                { title: 'NeuroLink: Brain-Computer Interaction', text: 'NeuroLink: Brain-Computer Interaction — LAP Lambert Academic Publishing' },
                { title: 'Today\'s Biggest Cosmic Mysteries', text: 'Today\'s Biggest Cosmic Mysteries — LAP Lambert Academic Publishing' },
                { title: 'Predicting Bike Sharing Demand', text: 'Predicting Bike Sharing Demand — Taylor & Francis, CRC Press (Book Chapter)' },
                { title: 'Innovative Approaches to Cloud-Based Standardization', text: 'Innovative Approaches to Cloud-Based Standardization — Taylor & Francis (Book Chapter)' },
            ];
            subBooks.forEach(item => {
                searchIndex.push({ ...item, label: 'Book', url: `${basePath}publications.html#books-patents` });
            });
            
            searchIndex.push({ title: 'Development of Multipurpose Floor Cleaning Bot', text: 'Development of Multipurpose Floor Cleaning Bot — Patent 2020101185', label: 'Patent', url: `${basePath}publications.html#books-patents` });
            searchIndex.push({ title: 'Design & Fabrication of Smart Health Monitoring System', text: 'Design & Fabrication of Smart Health Monitoring System — Patent 2020102142', label: 'Patent', url: `${basePath}publications.html#books-patents` });
            if (isSubPage) {
                searchIndex.push({ title: 'Exoskeleton-Assisted Physical Therapy Suit', text: 'Exoskeleton-Assisted Physical Therapy Suit — UK Design Patent No. 6487213', label: 'Patent', url: `${basePath}publications.html#books-patents` });
                searchIndex.push({ title: 'VR-ML Personalized Classroom Learning Desk', text: 'VR-ML Personalized Classroom Learning Desk — India Design Patent', label: 'Patent', url: `${basePath}publications.html#books-patents` });
            }
        }

        // Additional teaching courses not on index
        if (!currentPage.includes('teaching.html')) {
            const subTeaching = [
                { title: 'Advanced DSP', text: 'Advanced DSP — M.Tech I · Theory & Lab (Techno India University)' },
                { title: 'Satellite Communication', text: 'Satellite Communication — B.Tech IV · Theory & Lab (Techno India University)' },
                { title: 'Analog Communication', text: 'Analog Communication — B.Tech III · Theory & Lab (Techno India University)' },
                { title: 'Circuit Theory', text: 'Circuit Theory — B.Tech II · Theory & Lab (Techno India University)' },
                { title: 'Basic Electronics', text: 'Basic Electronics — B.Tech I · Theory & Lab (Techno India University)' },
                { title: 'Communication Engineering', text: 'Communication Engineering — Diploma III · Theory & Lab (Techno India University)' },
                { title: 'Electronic Devices and Digital Circuits', text: 'Electronic Devices and Digital Circuits — B.E. II · Theory & Lab (KPRIET)' },
                { title: 'Electrical and Electronics for Mechatronics', text: 'Electrical and Electronics for Mechatronics — B.E. I · Theory & Project (KPRIET)' },
                { title: 'Robotics & AI', text: 'Robotics & AI — International · USA & UK (BrightChamps)' },
            ];
            if (isSubPage) {
                subTeaching.push(
                    { title: 'Machine Vision and Image Processing', text: 'Machine Vision and Image Processing — B.E. IV · Theory' },
                    { title: 'Electric and Hybrid Vehicle', text: 'Electric and Hybrid Vehicle — B.E. III · Theory & Lab' },
                    { title: 'Microcontroller and Embedded Systems', text: 'Microcontroller and Embedded Systems — B.E. II · Theory & Lab' },
                    { title: 'Sensors and Signal Processing', text: 'Sensors and Signal Processing — B.E. II · Theory & Lab' }
                );
            }
            subTeaching.forEach(item => {
                searchIndex.push({ ...item, label: 'Teaching', url: `${basePath}teaching.html` });
            });
        }

        // --- Open / Close ---
        let activeResultIdx = -1;

        function openSearch() {
            searchOverlay.classList.add('open');
            searchInput.value = '';
            searchResults.innerHTML = '<div class="search-empty">Type to search across all sections</div>';
            activeResultIdx = -1;
            // Delay to allow CSS display/visibility transitions to kick in before focusing
            setTimeout(() => {
                if (searchInput) searchInput.focus();
            }, 100);
        }

        function closeSearch() {
            searchOverlay.classList.remove('open');
            searchInput.blur();
            activeResultIdx = -1;
        }

        // Button click
        searchBtn.addEventListener('click', openSearch);

        // Cmd/Ctrl + K shortcut
        document.addEventListener('keydown', e => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (searchOverlay.classList.contains('open')) {
                    closeSearch();
                } else {
                    openSearch();
                }
            }
            // ESC to close
            if (e.key === 'Escape' && searchOverlay.classList.contains('open')) {
                closeSearch();
            }
        });

        // Click backdrop to close
        searchOverlay.addEventListener('click', e => {
            if (e.target === searchOverlay) closeSearch();
        });

        // Click X button to close
        if (searchCloseBtn) {
            searchCloseBtn.addEventListener('click', closeSearch);
        }

        // --- Highlight match text ---
        function highlightMatch(text, query) {
            if (!query) return text;
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escaped})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        }

        // --- Navigate to element and highlight ---
        function navigateToResult(item) {
            closeSearch();

            // Cross-page result — navigate to the sub-page
            if (item.url) {
                const separator = item.url.includes('#') ? '&' : '#';
                // Pass the exact item TITLE to ensure perfect matching on the target page
                window.location.href = item.url + separator + 'search=' + encodeURIComponent(item.title);
                return;
            }

            const el = item.el;
            if (!el) return;

            // Remove any previous highlights
            document.querySelectorAll('.search-highlight').forEach(h => {
                h.classList.remove('search-highlight');
            });

            // Scroll to element
            setTimeout(() => {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Add highlight after scroll completes
                setTimeout(() => {
                    el.classList.add('search-highlight');
                    // Remove highlight after animation
                    setTimeout(() => {
                        el.classList.remove('search-highlight');
                    }, 2200);
                }, 400);
            }, 150);
        }

        // --- Render results ---
        function renderResults(query) {
            if (!query || query.length < 1) {
                searchResults.innerHTML = '<div class="search-empty">Type to search across all sections</div>';
                activeResultIdx = -1;
                return;
            }

            const q = query.toLowerCase();
            const matches = searchIndex.filter(item =>
                item.text.toLowerCase().includes(q)
            );

            if (matches.length === 0) {
                searchResults.innerHTML = '<div class="search-no-results">No results found for "' + query + '"</div>';
                activeResultIdx = -1;
                return;
            }

            activeResultIdx = 0;
            searchResults.innerHTML = matches.map((item, i) => `
                <div class="search-result-item${i === 0 ? ' active' : ''}" data-idx="${i}">
                    <span class="search-result-badge">${item.label}</span>
                    <span class="search-result-text">${highlightMatch(item.text, query)}</span>
                </div>
            `).join('');

            // Click handlers
            const resultEls = searchResults.querySelectorAll('.search-result-item');
            resultEls.forEach((el, i) => {
                el.addEventListener('click', () => navigateToResult(matches[i]));
            });

            // Store matches for keyboard nav
            searchResults._matches = matches;
        }

        // --- Live search ---
        searchInput.addEventListener('input', () => {
            renderResults(searchInput.value.trim());
        });

        // --- Keyboard navigation ---
        searchInput.addEventListener('keydown', e => {
            const items = searchResults.querySelectorAll('.search-result-item');
            const matches = searchResults._matches;
            if (!items.length || !matches) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                items[activeResultIdx]?.classList.remove('active');
                activeResultIdx = (activeResultIdx + 1) % items.length;
                items[activeResultIdx]?.classList.add('active');
                items[activeResultIdx]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                items[activeResultIdx]?.classList.remove('active');
                activeResultIdx = (activeResultIdx - 1 + items.length) % items.length;
                items[activeResultIdx]?.classList.add('active');
                items[activeResultIdx]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeResultIdx >= 0 && matches[activeResultIdx]) {
                    navigateToResult(matches[activeResultIdx]);
                }
            }
        });
    }

    // --- Handle cross-page search highlighting on load ---
    const hash = window.location.hash;
    if (hash.includes('search=')) {
        setTimeout(() => {
            const query = decodeURIComponent(hash.split('search=')[1].split('&')[0]).toLowerCase();
            if (query) {
                // Find all potential searchable elements on this page
                const searchableSelectors = ['.proj-card', '.proj-entry', '.pub-entry', '.exp-panel', '.edu-card', '.honor-badge', '.teach-card', '.stat-item'];
                let foundMatch = null;
                for (const selector of searchableSelectors) {
                    const elements = document.querySelectorAll(selector);
                    for (const el of elements) {
                        if (el.textContent.toLowerCase().includes(query)) {
                            foundMatch = el;
                            break;
                        }
                    }
                    if (foundMatch) break;
                }

                if (foundMatch) {
                    foundMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => {
                        foundMatch.classList.add('search-highlight');
                        setTimeout(() => {
                            foundMatch.classList.remove('search-highlight');
                        }, 2200);
                    }, 400);
                }
            }
            // Clean up the URL to remove the search param but keep other hashes if present
            const cleanHash = hash.replace(new RegExp(`[#&]search=[^&]*`), '');
            history.replaceState(null, '', window.location.pathname + (cleanHash.startsWith('&') ? '#' + cleanHash.slice(1) : cleanHash));
        }, 500); // Wait for page to fully render
    }
});
