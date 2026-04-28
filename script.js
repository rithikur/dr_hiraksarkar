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

    // Raw tilt values written by the sensor event, read by rAF
    let rawTiltX = 0;
    let rawTiltY = 0;

    // Previous raw values for velocity calculation
    let prevRawTiltX = 0;
    let prevRawTiltY = 0;

    // Smoothed tilt values — updated every animation frame
    let smoothTiltX = 0;
    let smoothTiltY = 0;

    // Baseline calibration — average first N readings for a solid neutral position
    const BASELINE_COUNT = 15;
    let baselineSamples = [];
    let baselineBeta = null;
    let baselineGamma = null;
    let baselineReady = false;

    // Tilt degrees that map to full screen width/height — lower = more sensitive
    const TILT_RANGE = 12;

    // Frame-rate-independent smoothing: track time between frames
    let lastFrameTime = 0;

    function resetBaseline() {
        baselineSamples = [];
        baselineBeta = null;
        baselineGamma = null;
        baselineReady = false;
        rawTiltX = rawTiltY = smoothTiltX = smoothTiltY = 0;
        prevRawTiltX = prevRawTiltY = 0;
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

        // Unwrap angle wraps to prevent snapping
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
    function animateTextPressure(timestamp) {

        // Delta-time for frame-rate-independent smoothing
        const dt = lastFrameTime ? Math.min((timestamp - lastFrameTime) / 16.667, 3) : 1;
        lastFrameTime = timestamp;

        if (gyroActive && baselineReady) {
            // ---- VELOCITY-ADAPTIVE SMOOTHING ----
            // Measure how fast the raw tilt is changing (°/frame)
            const velX = Math.abs(rawTiltX - prevRawTiltX);
            const velY = Math.abs(rawTiltY - prevRawTiltY);
            prevRawTiltX = rawTiltX;
            prevRawTiltY = rawTiltY;

            // Adaptive alpha: fast motion → alpha near 0.6 (almost raw),
            //                  still/jitter → alpha near 0.12 (filtered)
            // This lets intentional movements pass through instantly while
            // only damping sensor noise when the device is near-stationary
            const alphaX = 0.12 + 0.48 * Math.min(1, velX / 2.0);
            const alphaY = 0.12 + 0.48 * Math.min(1, velY / 2.0);

            // Frame-rate-corrected smoothing
            smoothTiltX += (rawTiltX - smoothTiltX) * (1 - Math.pow(1 - alphaX, dt));
            smoothTiltY += (rawTiltY - smoothTiltY) * (1 - Math.pow(1 - alphaY, dt));

            // ---- CUBIC MICRO-FADE (replaces hard dead zone) ----
            // Instead of killing all movement below a threshold, this uses a
            // cubic curve that gently reduces very small values while preserving
            // the feel of intentional micro-movements
            const FADE_ZONE = 0.5; // degrees — only the tiniest jitter fades
            const cubicFade = (v) => {
                const abs = Math.abs(v);
                if (abs >= FADE_ZONE) return v;
                // Cubic ramp: smooth transition from 0 at center to full at FADE_ZONE edge
                const t = abs / FADE_ZONE;
                return Math.sign(v) * abs * (t * t);
            };
            const dzX = cubicFade(smoothTiltX);
            const dzY = cubicFade(smoothTiltY);

            // ---- CUBIC RESPONSE CURVE ----
            // Normalise to [-1, 1], then apply a 70/30 linear+cubic blend
            // Linear keeps it snappy, cubic softens extremes naturally
            const nx = Math.max(-1, Math.min(1, dzX / TILT_RANGE));
            const ny = Math.max(-1, Math.min(1, dzY / TILT_RANGE));
            const ex = nx * 0.7 + Math.sign(nx) * Math.pow(Math.abs(nx), 3) * 0.3;
            const ey = ny * 0.7 + Math.sign(ny) * Math.pow(Math.abs(ny), 3) * 0.3;

            cursor.x = ((ex + 1) / 2) * window.innerWidth;
            cursor.y = ((ey + 1) / 2) * window.innerHeight;
        }

        // ---- ADAPTIVE DAMPING ON LERP FOLLOWER ----
        // Distance between target and current position determines damping:
        //   Large distance (fast move) → damping 2 (near-instant snap)
        //   Small distance (settled)   → damping 8 (liquid glide)
        // This eliminates the "trailing cursor" feel while keeping micro-movements silky
        if (gyroActive) {
            const dx = cursor.x - mouse.x;
            const dy = cursor.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const screenDiag = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
            const normDist = Math.min(1, dist / (screenDiag * 0.15));
            // Interpolate damping: 2 at full speed, 8 at rest
            const damping = 8 - normDist * 6;
            const step = 1 - Math.pow(1 - (1 / damping), dt);
            mouse.x += dx * step;
            mouse.y += dy * step;
        } else {
            // Desktop mouse — classic smooth follow
            const step = 1 - Math.pow(1 - (1 / 12), dt);
            mouse.x += (cursor.x - mouse.x) * step;
            mouse.y += (cursor.y - mouse.y) * step;
        }

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