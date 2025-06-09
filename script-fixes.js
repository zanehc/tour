// 스크립트 수정사항 - script-fixes.js
// 기존 script.js의 문제점들을 수정하는 오버라이드

console.log('🔧 스크립트 수정사항이 로드되었습니다.');

// 기존 DOMContentLoaded 이벤트를 개선된 버전으로 교체
function improvedDOMContentLoaded() {
    console.log('🚀 개선된 페이지 초기화 시작...');
    
    if (typeof L === 'undefined') {
        showFloatingMessage('지도 라이브러리 로딩 실패. 페이지를 새로고침해 주세요.', 'error');
        return;
    }
    
    // 1단계: 지도 초기화
    if (!initializeMap()) {
        showFloatingMessage('지도 초기화에 실패했습니다. 페이지를 새로고침해 주세요.', 'error');
        return;
    }
    
    // 2단계: 기본 설정
    handleResize();
    loadProvinces();
    
    // 3단계: 데이터 로딩 (순차적으로)
    loadDataSequentially();
}

// 순차적 데이터 로딩 함수
async function loadDataSequentially() {
    console.log('📊 순차적 데이터 로딩 시작...');
    
    try {
        // GeoJSON 데이터 로드
        showFloatingMessage('🗺️ 행정구역 경계 데이터 로딩 중...', 'loading');
        await loadSigunguGeoJsonSafe();
        
        // 휴게소 데이터 로드 (마스터 로더 사용)
        showFloatingMessage('🚗 휴게소 데이터 로딩 중...', 'loading');
        
        if (typeof window.loadRestAreaData === 'function') {
            await window.loadRestAreaData();
        } else {
            console.warn('⚠️ loadRestAreaData 함수를 찾을 수 없습니다.');
        }
        
        // 위치 기반 자동 감지 시도
        showFloatingMessage('📍 위치 기반 지역 감지 중...', 'loading');
        
        try {
            const locationDetected = await autoDetectLocationAndZoomSafe();
            if (!locationDetected) {
                selectAdministrativeDivision('전국');
            }
        } catch (error) {
            console.log('위치 감지 실패, 전국 지도 표시:', error.message);
            selectAdministrativeDivision('전국');
        }
        
        // 휴게소 테마가 활성화되어 있으면 표시
        if (window.restAreaData && window.restAreaData.length > 0) {
            // 테마 상태 확인 후 표시
            setTimeout(() => {
                if (typeof window.refreshActiveThemes === 'function') {
                    window.refreshActiveThemes();
                } else if (themeStates && themeStates.restarea) {
                    if (typeof window.showRestAreas === 'function') {
                        window.showRestAreas();
                    }
                }
            }, 1000);
        }
        
        // 환영 메시지
        showFloatingMessage('😊 좋아할지도에 오신 것을 환영합니다! 테마를 선택하거나 행정구역을 선택해주세요.', 'success', 4000);
        
        // 모바일에서 사이드바 자동 닫기
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                if (typeof toggleSidebar === 'function') {
                    toggleSidebar();
                }
            }, 500);
        }
        
    } catch (error) {
        console.error('데이터 로딩 중 오류:', error);
        showFloatingMessage('일부 데이터 로딩에 실패했지만 기본 기능은 사용 가능합니다.', 'warning', 5000);
        
        // 최소한의 기능이라도 작동하도록
        selectAdministrativeDivision('전국');
    }
}

// 안전한 GeoJSON 로딩
async function loadSigunguGeoJsonSafe() {
    try {
        if (typeof window.loadSigunguGeoJson === 'function') {
            await window.loadSigunguGeoJson();
        } else {
            console.warn('⚠️ loadSigunguGeoJson 함수를 찾을 수 없습니다.');
        }
    } catch (error) {
        console.warn('GeoJSON 로딩 실패:', error.message);
        showFloatingMessage('행정구역 경계 데이터를 불러오지 못했습니다.', 'warning', 3000);
    }
}

// 안전한 위치 감지
async function autoDetectLocationAndZoomSafe() {
    if (typeof window.autoDetectLocationAndZoom !== 'function') {
        console.warn('⚠️ autoDetectLocationAndZoom 함수를 찾을 수 없습니다.');
        return false;
    }
    
    try {
        return await window.autoDetectLocationAndZoom();
    } catch (error) {
        console.warn('위치 감지 실패:', error.message);
        return false;
    }
}

// 개선된 샘플 휴게소 데이터 생성 함수 (기존 함수 오버라이드)
function getSampleRestAreaDataImproved() {
    // 기존 샘플 데이터가 있으면 그것을 사용하고, 없으면 data-manager.js의 데이터 사용
    if (typeof window.getSampleRestAreaData === 'function') {
        try {
            return window.getSampleRestAreaData();
        } catch (error) {
            console.warn('기존 샘플 데이터 생성 실패:', error.message);
        }
    }
    
    // data-manager.js의 고품질 데이터 사용
    if (window.ENHANCED_REST_AREA_DATA) {
        return window.ENHANCED_REST_AREA_DATA;
    }
    
    // 최후의 수단: 기본 데이터
    return [
        {
            '휴게소명': '서울만남의광장',
            '고속도로': '경부고속도로',
            '위도': '37.4563',
            '경도': '127.9950',
            '휴게소종류': '일반형',
            '운영시간': '24시간',
            '방향': '서울방향',
            '주요편의시설': '주유소, 편의점, 음식점',
            '전화번호': '054-1234-5678',
            '데이터기준일': '2024-01-01',
            '프랜차이즈매장': 'KFC, 던킨도너츠'
        }
    ];
}

// 안전한 테마 상태 관리
function ensureThemeStates() {
    if (typeof window.themeStates === 'undefined') {
        window.themeStates = {
            restarea: true,
            restaurant: false,
            hotel: false,
            academy: false,
            festival: false,
            hotplace: false,
            kids: false
        };
        console.log('🎯 테마 상태 초기화 완료');
    }
}

// 오류 방지를 위한 함수 존재 여부 확인
function checkRequiredFunctions() {
    const requiredFunctions = [
        'initializeMap',
        'handleResize', 
        'loadProvinces',
        'showFloatingMessage',
        'selectAdministrativeDivision'
    ];
    
    const missingFunctions = requiredFunctions.filter(funcName => 
        typeof window[funcName] !== 'function'
    );
    
    if (missingFunctions.length > 0) {
        console.warn('⚠️ 누락된 필수 함수들:', missingFunctions);
        return false;
    }
    
    return true;
}

// 안전한 플로팅 메시지 함수 (기존 함수가 없을 경우 대체)
function safeShowFloatingMessage(message, type = 'info', duration = 3000) {
    if (typeof window.showFloatingMessage === 'function') {
        return window.showFloatingMessage(message, type, duration);
    }
    
    // 대체 구현
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // 간단한 알림 생성
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1001;
        padding: 15px 20px;
        border-radius: 8px;
        font-size: 14px;
        text-align: center;
        max-width: 500px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        background: ${type === 'error' ? '#fee' : type === 'warning' ? '#fff3cd' : type === 'success' ? '#d4edda' : '#d1ecf1'};
        border: 1px solid ${type === 'error' ? '#fcc' : type === 'warning' ? '#ffeaa7' : type === 'success' ? '#c3e6cb' : '#bee5eb'};
        color: ${type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : type === 'success' ? '#155724' : '#0c5460'};
    `;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    if (duration > 0) {
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, duration);
    }
    
    return alertDiv;
}

// 기존 함수들 오버라이드
if (typeof window !== 'undefined') {
    // 안전한 플로팅 메시지 함수 보장
    if (typeof window.showFloatingMessage !== 'function') {
        window.showFloatingMessage = safeShowFloatingMessage;
        console.log('🔧 showFloatingMessage 함수 대체 구현 등록');
    }
    
    // 샘플 데이터 함수 개선
    if (typeof window.getSampleRestAreaData === 'function') {
        window.originalGetSampleRestAreaData = window.getSampleRestAreaData;
    }
    window.getSampleRestAreaData = getSampleRestAreaDataImproved;
    
    // 테마 상태 보장
    ensureThemeStates();
    
    console.log('✅ 스크립트 수정사항 적용 완료');
}

// 페이지 로드 이벤트 재정의
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOMContentLoaded 이벤트 감지');
    
    // 필수 함수 확인
    if (!checkRequiredFunctions()) {
        console.error('❌ 필수 함수가 누락되어 기본 초기화를 건너뜁니다.');
        showFloatingMessage('일부 기능을 사용할 수 없습니다. 페이지를 새로고침해 주세요.', 'error', 10000);
        return;
    }
    
    // 약간의 지연 후 초기화 (다른 스크립트들이 로드될 시간을 줌)
    setTimeout(() => {
        improvedDOMContentLoaded();
    }, 100);
});

// 개발자 도구용 디버깅 유틸리티
window.scriptFixesUtils = {
    // 강제 재초기화
    forceReinit: () => {
        console.log('🔄 강제 재초기화 시작...');
        improvedDOMContentLoaded();
    },
    
    // 필수 함수 상태 확인
    checkFunctions: () => {
        const functions = [
            'initializeMap', 'handleResize', 'loadProvinces', 'showFloatingMessage',
            'selectAdministrativeDivision', 'loadRestAreaData', 'toggleTheme'
        ];
        
        const status = {};
        functions.forEach(funcName => {
            status[funcName] = typeof window[funcName] === 'function';
        });
        
        console.log('🔍 함수 상태 확인:', status);
        return status;
    },
    
    // 데이터 상태 확인
    checkDataStatus: () => {
        const status = {
            restAreaData: window.restAreaData ? window.restAreaData.length : 0,
            sigunguGeoJsonData: window.sigunguGeoJsonData ? 'loaded' : 'not loaded',
            map: window.map ? 'initialized' : 'not initialized',
            themeStates: window.themeStates || {}
        };
        
        console.log('📊 데이터 상태:', status);
        return status;
    }
};

console.log('🚀 스크립트 수정사항 로드 완료! 개발자 도구에서 window.scriptFixesUtils 사용 가능');
