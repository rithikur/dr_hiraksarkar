document.addEventListener('DOMContentLoaded', () => {

    // ===== SCROLL REVEAL =====
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
    els.forEach(el => obs.observe(el));

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

    let targetIntensity = 1.0;
    let currentIntensity = 1.0;
    const REST_WGHT = 800, REST_WDTH = 100;

    const heroSection = document.querySelector('.header');
    if (heroSection) {
        heroSection.addEventListener('mouseenter', () => { targetIntensity = 1.0; });
        heroSection.addEventListener('mouseleave', () => { targetIntensity = 0.0; });
    }
    targetIntensity = 1.0;

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
                toast.textContent = auroraActive ? '🌌 Aurora mode activated!' : '🌙 Aurora mode deactivated.';
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 3000);
            }
        } else { konamiIndex = 0; }
    });
});