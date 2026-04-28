// ============================================================
// DROP-IN REPLACEMENT — paste this entire <script> block into
// the portfolio HTML, replacing the existing one.
// ============================================================

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
        const chars = line.dataset.text.split('');
        line.innerHTML = chars.map(char =>
            char === ' '
                ? `<span style="display:inline-block;width:0.3em">&nbsp;</span>`
                : `<span data-char="${char}" style="display:inline-block;color:var(--fg)">${char}</span>`
        ).join('');
    });

    const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
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

    // 2. Touch (Mobile — fallback when gyro absent)
    window.addEventListener('touchmove', e => {
        if (e.touches.length > 0) {
            cursor.x = e.touches[0].clientX;
            cursor.y = e.touches[0].clientY;
        }
    }, { passive: true });

    // ===== 3. GYROSCOPE — IMPROVED =====
    let gyroActive = false;

    // Baseline: collect N readings and average them for a stable neutral position
    const BASELINE_COUNT = 25;
    let baselineSamples = [];
    let baselineBeta = null;
    let baselineGamma = null;

    // Low-pass filter state — smooths raw sensor noise before mapping
    let filteredRawX = 0;
    let filteredRawY = 0;
    const GYRO_LPF = 0.25; // 0 = frozen, 1 = raw (0.20–0.30 is the sweet spot)

    // Dead zone in degrees — don't move the virtual cursor for tiny tremors
    const DEAD_ZONE_DEG = 0.6;

    // Tilt range in degrees that maps to full screen edge-to-edge
    const TILT_RANGE = 16;

    function resetBaseline() {
        baselineSamples = [];
        baselineBeta = null;
        baselineGamma = null;
    }

    // Double-tap anywhere to recalibrate (useful if user picks up phone at a new angle)
    let lastTap = 0;
    document.addEventListener('touchend', () => {
        const now = Date.now();
        if (now - lastTap < 300) resetBaseline();
        lastTap = now;
    }, { passive: true });

    function handleOrientation(e) {
        if (e.beta === null || e.gamma === null) return;
        gyroActive = true;

        // Phase 1: accumulate baseline samples
        if (baselineSamples.length < BASELINE_COUNT) {
            baselineSamples.push({ beta: e.beta, gamma: e.gamma });
            if (baselineSamples.length === BASELINE_COUNT) {
                baselineBeta = baselineSamples.reduce((s, v) => s + v.beta, 0) / BASELINE_COUNT;
                baselineGamma = baselineSamples.reduce((s, v) => s + v.gamma, 0) / BASELINE_COUNT;
            }
            return; // don't move cursor yet — baseline not ready
        }

        // Phase 2: compute delta from neutral position
        let dBeta = e.beta - baselineBeta;
        let dGamma = e.gamma - baselineGamma;

        // Unwrap discontinuities near ±180°
        if (dBeta > 180) dBeta -= 360;
        if (dBeta < -180) dBeta += 360;
        if (dGamma > 180) dGamma -= 360;
        if (dGamma < -180) dGamma += 360;

        // Map axes correctly for all screen orientations
        const angle = (typeof screen !== 'undefined' && screen.orientation?.angle)
            ?? window.orientation ?? 0;

        let rawX, rawY;
        switch (Math.round(angle / 90) * 90) {
            case 90: rawX = dBeta; rawY = -dGamma; break;
            case -90: case 270: rawX = -dBeta; rawY = dGamma; break;
            case 180: rawX = -dGamma; rawY = -dBeta; break;
            default: rawX = dGamma; rawY = dBeta; break;
        }

        // Dead zone — kill micro-jitter when phone is stationary
        if (Math.abs(rawX) < DEAD_ZONE_DEG) rawX = 0;
        if (Math.abs(rawY) < DEAD_ZONE_DEG) rawY = 0;

        // Low-pass filter on raw values (removes remaining sensor noise)
        filteredRawX += (rawX - filteredRawX) * GYRO_LPF;
        filteredRawY += (rawY - filteredRawY) * GYRO_LPF;

        // Normalise to [-1, 1]
        const nx = Math.max(-1, Math.min(1, filteredRawX / TILT_RANGE));
        const ny = Math.max(-1, Math.min(1, filteredRawY / TILT_RANGE));

        // Quadratic ease: fast response near centre, tapers off at extremes
        // This mimics how a real cursor feel at the edge vs the middle of the screen
        const ex = nx * (2 - Math.abs(nx)) * 0.7; // slight dampening at edges
        const ey = ny * (2 - Math.abs(ny)) * 0.7;

        // Map to screen coordinates
        cursor.x = ((ex + 1) / 2) * window.innerWidth;
        cursor.y = ((ey + 1) / 2) * window.innerHeight;
    }

    function startGyro() {
        window.addEventListener('deviceorientation', handleOrientation, true);
    }

    // iOS 13+ requires permission on a user gesture
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        const requestGyro = () => {
            if (gyroActive) return;
            DeviceOrientationEvent.requestPermission()
                .then(state => { if (state === 'granted') startGyro(); })
                .catch(console.error);
        };
        document.body.addEventListener('click', requestGyro, { once: true });
        document.body.addEventListener('touchstart', requestGyro, { once: true });
    } else {
        startGyro();
    }

    // ===== ANIMATION LOOP =====
    function animateTextPressure() {
        // Gyro: damping 5 = snappy but smooth (was 40 — way too sluggish)
        // Mouse/touch: damping 12 = natural desktop feel
        const damping = gyroActive ? 5 : 12;
        mouse.x += (cursor.x - mouse.x) / damping;
        mouse.y += (cursor.y - mouse.y) / damping;

        const lerpSpeed = targetIntensity > currentIntensity ? 0.08 : 0.04;
        currentIntensity += (targetIntensity - currentIntensity) * lerpSpeed;

        lines.forEach(line => {
            const titleRect = line.getBoundingClientRect();
            if (titleRect.width === 0) return;
            const maxDist = titleRect.width / 2;

            line.querySelectorAll('span').forEach(span => {
                if (!span) return;
                const rect = span.getBoundingClientRect();
                const charCenter = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
                const d = distFn(mouse, charCenter);

                const fullWght = Math.floor(getAttr(d, maxDist, 500, 900));
                const fullWdth = Math.floor(getAttr(d, maxDist, 60, 140));
                const wght = Math.floor(REST_WGHT + (fullWght - REST_WGHT) * currentIntensity);
                const wdth = Math.floor(REST_WDTH + (fullWdth - REST_WDTH) * currentIntensity);

                const newSettings = `'wght' ${wght}, 'wdth' ${wdth}`;
                if (span.style.fontVariationSettings !== newSettings) {
                    span.style.fontVariationSettings = newSettings;
                }
            });
        });

        requestAnimationFrame(animateTextPressure);
    }

    animateTextPressure();

    // ===== KONAMI CODE EASTER EGG =====
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    let konamiIndex = 0, auroraActive = false;
    document.addEventListener('keydown', e => {
        if (e.code === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                konamiIndex = 0;
                auroraActive = !auroraActive;
                document.body.classList.toggle('aurora-active', auroraActive);
                const toast = document.getElementById('easterToast');
                toast.textContent = auroraActive ? '🌌 Aurora mode activated!' : '🌙 Aurora mode deactivated.';
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 3000);
            }
        } else {
            konamiIndex = 0;
        }
    });
});