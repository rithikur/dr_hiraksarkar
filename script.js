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

    // ===== 3. GYROSCOPE =====
    let gyroActive = false;

    // Raw values written by the sensor, read by rAF — decoupled for consistent smoothing
    let rawTiltX = 0;
    let rawTiltY = 0;

    // These are the smoothed values, updated every animation frame at 60fps
    let smoothTiltX = 0;
    let smoothTiltY = 0;

    // Baseline: average first N readings so the neutral position is solid
    const BASELINE_COUNT = 30;
    let baselineSamples = [];
    let baselineBeta = null;
    let baselineGamma = null;
    let baselineReady = false;

    // Low-pass alpha applied per animation frame — lower = silkier, more lag
    // 0.08 at 60fps = ~20 frames to settle, feels like smooth liquid
    const SMOOTH_ALPHA = 0.08;

    // Tilt degrees that cover the full screen width/height
    const TILT_RANGE = 18;

    // Soft dead zone threshold in degrees
    const SOFT_DEAD_ZONE = 1.2;

    // Smoothly fades values near zero to zero — no hard snapping
    function softDeadZone(v) {
        const abs = Math.abs(v);
        if (abs < SOFT_DEAD_ZONE) return 0;
        return Math.sign(v) * (abs - SOFT_DEAD_ZONE);
    }

    function resetBaseline() {
        baselineSamples = [];
        baselineBeta = null;
        baselineGamma = null;
        baselineReady = false;
        rawTiltX = rawTiltY = smoothTiltX = smoothTiltY = 0;
    }

    // Double-tap anywhere to recalibrate
    let lastTap = 0;
    document.addEventListener('touchend', () => {
        const now = Date.now();
        if (now - lastTap < 280) resetBaseline();
        lastTap = now;
    }, { passive: true });

    function handleOrientation(e) {
        if (e.beta === null || e.gamma === null) return;
        gyroActive = true;

        // Phase 1: accumulate baseline samples
        if (!baselineReady) {
            baselineSamples.push({ beta: e.beta, gamma: e.gamma });
            if (baselineSamples.length >= BASELINE_COUNT) {
                baselineBeta = baselineSamples.reduce((s, v) => s + v.beta, 0) / BASELINE_COUNT;
                baselineGamma = baselineSamples.reduce((s, v) => s + v.gamma, 0) / BASELINE_COUNT;
                baselineReady = true;
            }
            return;
        }

        // Phase 2: compute delta from neutral
        let dBeta = e.beta - baselineBeta;
        let dGamma = e.gamma - baselineGamma;

        if (dBeta > 180) dBeta -= 360;
        if (dBeta < -180) dBeta += 360;
        if (dGamma > 180) dGamma -= 360;
        if (dGamma < -180) dGamma += 360;

        // Correct axis mapping for all screen orientations
        const angle = (screen?.orientation?.angle) ?? window.orientation ?? 0;
        switch (Math.round(angle / 90) * 90) {
            case 90: rawTiltX = dBeta; rawTiltY = -dGamma; break;
            case -90: case 270: rawTiltX = -dBeta; rawTiltY = dGamma; break;
            case 180: rawTiltX = -dGamma; rawTiltY = -dBeta; break;
            default: rawTiltX = dGamma; rawTiltY = dBeta; break;
        }
        // Intentionally no filtering here — rAF owns all smoothing at 60fps
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
    function animateTextPressure() {

        if (gyroActive && baselineReady) {
            // Smooth at 60fps — consistent regardless of sensor event frequency
            smoothTiltX += (rawTiltX - smoothTiltX) * SMOOTH_ALPHA;
            smoothTiltY += (rawTiltY - smoothTiltY) * SMOOTH_ALPHA;

            // Soft dead zone — no snapping, just a gentle fade near centre
            const dzX = softDeadZone(smoothTiltX);
            const dzY = softDeadZone(smoothTiltY);

            // Normalise [-1, 1] then apply blended linear+quadratic curve
            // 60% linear keeps it responsive, 40% quadratic softens the edges
            const nx = Math.max(-1, Math.min(1, dzX / TILT_RANGE));
            const ny = Math.max(-1, Math.min(1, dzY / TILT_RANGE));
            const ex = Math.sign(nx) * nx * nx * 0.4 + nx * 0.6;
            const ey = Math.sign(ny) * ny * ny * 0.4 + ny * 0.6;

            cursor.x = ((ex + 1) / 2) * window.innerWidth;
            cursor.y = ((ey + 1) / 2) * window.innerHeight;
        }

        // Lerped follow — gyro uses damping 6 (reactive but gliding)
        const damping = gyroActive ? 6 : 12;
        mouse.x += (cursor.x - mouse.x) / damping;
        mouse.y += (cursor.y - mouse.y) / damping;

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