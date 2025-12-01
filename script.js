document.addEventListener('DOMContentLoaded', () => {
    // 1. Counter Animation
    const statValue = document.querySelector('.stat-card .value');
    if (statValue) {
        animateValue(statValue, 0, 128, 2000);
    }

    // 2. Intersection Observer for Chart Animation
    const chartBars = document.querySelectorAll('.bar');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                // Restore the height from the inline style
                const targetHeight = entry.target.getAttribute('data-height');
                if (targetHeight) {
                    entry.target.style.height = targetHeight;
                }
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    chartBars.forEach(bar => {
        // Store original height in data attribute and set height to 0 initially
        const height = bar.style.height;
        bar.setAttribute('data-height', height);
        bar.style.height = '0%';
        observer.observe(bar);
    });

    // 3. Smooth Scroll for Buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            const text = e.target.innerText;
            if (text.includes('Get Started') || text.includes('앱 다운로드')) {
                // Scroll to features or signup section
                const featuresSection = document.querySelector('.features');
                if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (text.includes('기능 살펴보기')) {
                const detailedFeatures = document.getElementById('detailed-features');
                if (detailedFeatures) {
                    detailedFeatures.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // 4. Demo Interactions
    const demoToggle = document.getElementById('demo-toggle');
    if (demoToggle) {
        demoToggle.addEventListener('click', () => {
            demoToggle.classList.toggle('active');
        });
    }

    const demoSwipe = document.getElementById('demo-swipe');
    if (demoSwipe) {
        demoSwipe.addEventListener('click', () => {
            demoSwipe.classList.toggle('swiped');
        });
    }

    const widgetItems = document.querySelectorAll('.widget-item');
    widgetItems.forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('completed');
        });
    });

    initKakaoMap();
});

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Ease out quart
        const easeProgress = 1 - Math.pow(1 - progress, 4);

        obj.innerHTML = '+' + Math.floor(progress * (end - start) + start) + '%';

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function initKakaoMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const kakaoKey = mapContainer.dataset.kakaoKey || window.KAKAO_JS_KEY || 'fbc43541e449c8b7aff064e1d14dfb1d';

    if (!kakaoKey) {
        mapContainer.classList.add('map-placeholder');
        mapContainer.textContent = '카카오 지도 API 키를 설정하면 지도가 표시됩니다.';
        return;
    }

    const renderMap = () => {
        const center = new window.kakao.maps.LatLng(35.8769, 128.6290); // Dongdaegu Station
        const map = new window.kakao.maps.Map(mapContainer, {
            center,
            level: 3
        });

        const marker = new window.kakao.maps.Marker({ position: center });
        marker.setMap(map);

        const infoWindow = new window.kakao.maps.InfoWindow({
            content: '<div class="map-info-window">LifeMemo 라운지 (동대구역)</div>'
        });
        infoWindow.open(map, marker);
    };

    const injectScript = () => {
        const existingScript = document.querySelector('script[data-kakao-sdk]');
        if (existingScript) {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(renderMap);
            } else {
                existingScript.addEventListener('load', () => window.kakao.maps.load(renderMap), { once: true });
            }
            return;
        }

        const kakaoScript = document.createElement('script');
        kakaoScript.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${kakaoKey}`;
        kakaoScript.async = true;
        kakaoScript.dataset.kakaoSdk = 'true';
        kakaoScript.onload = () => window.kakao.maps.load(renderMap);
        kakaoScript.onerror = () => {
            mapContainer.classList.add('map-error');
            mapContainer.textContent = '지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
        };
        document.head.appendChild(kakaoScript);
    };

    if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(renderMap);
    } else {
        injectScript();
    }
}
