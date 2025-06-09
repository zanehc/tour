// 테마 컨트롤러 - theme-controller.js
// 기존 테마 관련 함수들을 개선하여 더 정확한 토글 기능 제공

console.log('🎯 테마 컨트롤러가 로드되었습니다.');

// 디버깅 함수
function themeLog(message, data = null) {
    console.log(`[THEME-CONTROLLER] ${message}`, data || '');
}

// 현재 활성화된 테마들을 추적
let activeThemes = new Set(['restarea']); // 기본적으로 휴게소 활성화

// 휴게소 마커들을 별도로 관리
let restAreaMarkers = new Map(); // 마커 ID -> 마커 객체 매핑

// 개선된 휴게소 표시 함수 (행정구역 설정 유지)
function showRestAreasImproved() {
    themeLog('휴게소 표시 시작...');
    
    if (!window.restAreaData || !Array.isArray(window.restAreaData) || window.restAreaData.length === 0) {
        themeLog('❌ 휴게소 데이터 없음');
        showFloatingMessage('휴게소 데이터가 없습니다. 데이터를 먼저 로드해주세요.', 'error', 3000);
        return false;
    }

    // 기존 휴게소 마커들 제거
    hideRestAreasImproved();
    
    themeLog(`${window.restAreaData.length}개 휴게소 마커 생성 중...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    window.restAreaData.forEach((restArea, index) => {
        try {
            const lat = restArea['위도'];
            const lng = restArea['경도'];
            
            if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
                errorCount++;
                return;
            }
            
            // 마커 스타일 결정
            let markerIcon = 'fas fa-coffee';
            let markerColor = '#28a745';
            
            const restAreaType = restArea['휴게소종류'] || '';
            if (restAreaType.includes('간이')) {
                markerIcon = 'fas fa-store';
                markerColor = '#ffc107';
            }
            
            // 마커 생성
            const marker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'rest-area-marker',
                    html: `<i class="${markerIcon}" style="color: white;"></i>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            });

            // 마커 스타일 적용
            marker.on('add', function() {
                const markerElement = marker.getElement();
                if (markerElement) {
                    markerElement.style.backgroundColor = markerColor;
                }
            });

            // 팝업 내용 생성
            const popupContent = createRestAreaPopup(restArea);
            marker.bindPopup(popupContent, {
                className: 'custom-popup',
                maxWidth: 320,
                minWidth: 280
            });

            // 지도에 마커 추가
            marker.addTo(restAreaLayer);
            
            // 마커 관리 맵에 추가
            const markerId = `restarea_${index}`;
            restAreaMarkers.set(markerId, marker);
            
            successCount++;
            
        } catch (error) {
            errorCount++;
            themeLog(`마커 ${index} 생성 오류:`, error.message);
        }
    });
    
    themeLog(`휴게소 표시 완료: 성공 ${successCount}개, 실패 ${errorCount}개`);
    
    if (successCount > 0) {
        const message = errorCount > 0 
            ? `${successCount}개 휴게소 표시 (${errorCount}개 오류)`
            : `${successCount}개 휴게소를 지도에 표시했습니다.`;
        
        showFloatingMessage(`☕ ${message}`, 'success', 2000);
        return true;
    } else {
        showFloatingMessage('❌ 표시할 수 있는 휴게소가 없습니다.', 'error', 3000);
        return false;
    }
}

// 개선된 휴게소 숨기기 함수
function hideRestAreasImproved() {
    themeLog('휴게소 숨기기 시작...');
    
    let removedCount = 0;
    
    // 개별 마커들 제거
    restAreaMarkers.forEach((marker, markerId) => {
        try {
            if (restAreaLayer && restAreaLayer.hasLayer(marker)) {
                restAreaLayer.removeLayer(marker);
                removedCount++;
            }
        } catch (error) {
            themeLog(`마커 ${markerId} 제거 오류:`, error.message);
        }
    });
    
    // 마커 맵 초기화
    restAreaMarkers.clear();
    
    // 레이어 전체 클리어 (안전장치)
    if (restAreaLayer) {
        restAreaLayer.clearLayers();
    }
    
    themeLog(`휴게소 숨기기 완료: ${removedCount}개 마커 제거`);
    
    if (removedCount > 0) {
        showFloatingMessage(`🚫 ${removedCount}개 휴게소를 숨겼습니다.`, 'success', 1500);
    }
    
    return removedCount;
}

// 개선된 테마 토글 함수
function toggleThemeImproved(themeType) {
    themeLog(`테마 토글: ${themeType}`);
    
    const toggleElement = document.getElementById(`theme-${themeType}`);
    if (!toggleElement) {
        themeLog(`❌ 테마 요소를 찾을 수 없음: theme-${themeType}`);
        return;
    }
    
    // 현재 상태 확인
    const isCurrentlyActive = activeThemes.has(themeType);
    
    themeLog(`${themeType} 현재 상태: ${isCurrentlyActive ? '활성' : '비활성'}`);
    
    // 상태 토글
    if (isCurrentlyActive) {
        activeThemes.delete(themeType);
        toggleElement.classList.remove('active');
        themeLog(`${themeType} 비활성화`);
    } else {
        activeThemes.add(themeType);
        toggleElement.classList.add('active');
        themeLog(`${themeType} 활성화`);
    }
    
    // 테마별 처리
    switch(themeType) {
        case 'restarea':
            if (activeThemes.has('restarea')) {
                // 데이터가 로드되었는지 확인
                if (!window.restAreaData) {
                    themeLog('데이터 없음, 로드 시도...');
                    // 데이터 로드 시도
                    if (typeof window.loadRestAreaData === 'function') {
                        window.loadRestAreaData().then(() => {
                            if (window.restAreaData && window.restAreaData.length > 0) {
                                showRestAreasImproved();
                                updateMapDisplayImproved();
                            } else {
                                // 로드 실패시 상태 되돌리기
                                activeThemes.delete('restarea');
                                toggleElement.classList.remove('active');
                                showFloatingMessage('휴게소 데이터를 로드할 수 없습니다.', 'error', 3000);
                            }
                        }).catch(error => {
                            // 로드 실패시 상태 되돌리기
                            activeThemes.delete('restarea');
                            toggleElement.classList.remove('active');
                            showFloatingMessage('휴게소 데이터 로드 실패', 'error', 3000);
                            themeLog('데이터 로드 실패:', error);
                        });
                    } else {
                        showFloatingMessage('데이터 로더를 찾을 수 없습니다.', 'error', 3000);
                        activeThemes.delete('restarea');
                        toggleElement.classList.remove('active');
                    }
                } else {
                    showRestAreasImproved();
                }
            } else {
                hideRestAreasImproved();
            }
            break;
            
        case 'restaurant':
        case 'hotel':
        case 'academy':
        case 'festival':
        case 'hotplace':
        case 'kids':
            if (activeThemes.has(themeType)) {
                showComingSoon(getThemeDisplayName(themeType));
                // 준비중인 테마는 다시 비활성화
                setTimeout(() => {
                    activeThemes.delete(themeType);
                    toggleElement.classList.remove('active');
                }, 100);
            }
            break;
    }
    
    updateMapDisplayImproved();
}

// 테마 표시명 가져오기
function getThemeDisplayName(themeType) {
    const themeNames = {
        restaurant: '맛집',
        hotel: '숙박',
        academy: '학원',
        festival: '축제',
        hotplace: '핫플',
        kids: '어린이시설'
    };
    return themeNames[themeType] || themeType;
}

// 개선된 지도 표시 업데이트
function updateMapDisplayImproved() {
    const activeThemesList = Array.from(activeThemes);
    
    let locationText = '';
    if (currentSelectedProvince && currentSelectedDistrict) {
        locationText = `${currentSelectedProvince} ${currentSelectedDistrict}`;
    } else if (currentSelectedProvince) {
        locationText = currentSelectedProvince;
    } else {
        locationText = '전국';
    }
    
    if (activeThemesList.length === 0) {
        updateCurrentCategoryDisplay(`지도 영역: ${locationText}`);
    } else if (activeThemesList.length === 1) {
        const themeNames = {
            restarea: '고속도로 휴게소',
            restaurant: '맛집',
            hotel: '숙박',
            academy: '학원',
            festival: '축제',
            hotplace: '핫플',
            kids: '어린이시설'
        };
        const themeName = themeNames[activeThemesList[0]];
        
        if (activeThemesList[0] === 'restarea' && window.restAreaData) {
            const count = restAreaMarkers.size || window.restAreaData.length;
            updateCurrentCategoryDisplay(`${themeName} (${count}개) - ${locationText}`);
        } else {
            updateCurrentCategoryDisplay(`${themeName} - ${locationText}`);
        }
    } else {
        updateCurrentCategoryDisplay(`${activeThemesList.length}개 테마 활성화 - ${locationText}`);
    }
    
    themeLog('지도 표시 업데이트 완료', { activeThemes: activeThemesList, location: locationText });
}

// 모든 테마 비활성화 (행정구역 변경시 사용)
function clearAllThemesImproved() {
    themeLog('모든 테마 클리어...');
    
    // 휴게소만 클리어 (다른 테마는 아직 구현 안됨)
    if (activeThemes.has('restarea')) {
        hideRestAreasImproved();
    }
    
    // UI 상태 유지 (사용자가 선택한 테마 버튼 상태는 그대로)
    // activeThemes는 그대로 두고, 지도에서만 제거
}

// 현재 활성 테마들 다시 표시 (행정구역 변경 후 사용)
function refreshActiveThemesImproved() {
    themeLog('활성 테마 새로고침...', Array.from(activeThemes));
    
    if (activeThemes.has('restarea') && window.restAreaData) {
        showRestAreasImproved();
    }
    
    updateMapDisplayImproved();
}

// 기존 함수들 오버라이드
if (typeof window !== 'undefined') {
    // 원본 함수들 백업
    window.originalToggleTheme = window.toggleTheme;
    window.originalShowRestAreas = window.showRestAreas;
    window.originalHideRestAreas = window.hideRestAreas;
    window.originalUpdateMapDisplay = window.updateMapDisplay;
    
    // 개선된 함수들로 교체
    window.toggleTheme = toggleThemeImproved;
    window.showRestAreas = showRestAreasImproved;
    window.hideRestAreas = hideRestAreasImproved;
    window.updateMapDisplay = updateMapDisplayImproved;
    
    // 새로운 함수들 추가
    window.clearAllThemes = clearAllThemesImproved;
    window.refreshActiveThemes = refreshActiveThemesImproved;
    
    themeLog('✅ 테마 관련 함수들이 개선된 버전으로 교체되었습니다.');
}

// 행정구역 선택 함수들을 개선하여 테마 상태 유지
function wrapAdministrativeFunction(originalFunction, functionName) {
    return function(...args) {
        themeLog(`${functionName} 호출됨`);
        
        // 현재 활성 테마들 저장
        const currentActiveThemes = new Set(activeThemes);
        
        // 지도에서 테마 데이터 클리어
        clearAllThemesImproved();
        
        // 원본 함수 실행
        const result = originalFunction.apply(this, args);
        
        // 활성 테마들 복원
        activeThemes = currentActiveThemes;
        
        // 테마 데이터 다시 표시
        setTimeout(() => {
            refreshActiveThemesImproved();
        }, 500);
        
        return result;
    };
}

// 페이지 로드 후 행정구역 함수들 래핑
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // 행정구역 관련 함수들 래핑
        if (typeof window.selectProvince === 'function') {
            window.originalSelectProvince = window.selectProvince;
            window.selectProvince = wrapAdministrativeFunction(window.selectProvince, 'selectProvince');
        }
        
        if (typeof window.selectDistrict === 'function') {
            window.originalSelectDistrict = window.selectDistrict;
            window.selectDistrict = wrapAdministrativeFunction(window.selectDistrict, 'selectDistrict');
        }
        
        if (typeof window.selectAllDistrict === 'function') {
            window.originalSelectAllDistrict = window.selectAllDistrict;
            window.selectAllDistrict = wrapAdministrativeFunction(window.selectAllDistrict, 'selectAllDistrict');
        }
        
        if (typeof window.selectAdministrativeDivision === 'function') {
            window.originalSelectAdministrativeDivision = window.selectAdministrativeDivision;
            window.selectAdministrativeDivision = wrapAdministrativeFunction(window.selectAdministrativeDivision, 'selectAdministrativeDivision');
        }
        
        themeLog('✅ 행정구역 함수들이 테마 유지 기능과 함께 래핑되었습니다.');
    }, 1000);
});

// 개발자 도구용 유틸리티
window.themeControllerUtils = {
    // 현재 활성 테마 확인
    getActiveThemes: () => {
        console.log('현재 활성 테마:', Array.from(activeThemes));
        return Array.from(activeThemes);
    },
    
    // 휴게소 마커 개수 확인
    getRestAreaMarkerCount: () => {
        const count = restAreaMarkers.size;
        console.log('현재 표시된 휴게소 마커 개수:', count);
        return count;
    },
    
    // 테마 강제 토글
    forceToggleTheme: (themeType) => {
        console.log(`테마 강제 토글: ${themeType}`);
        toggleThemeImproved(themeType);
    },
    
    // 모든 테마 초기화
    resetAllThemes: () => {
        console.log('모든 테마 초기화...');
        clearAllThemesImproved();
        activeThemes.clear();
        document.querySelectorAll('.theme-toggle').forEach(el => {
            el.classList.remove('active');
        });
        // 휴게소만 다시 활성화
        activeThemes.add('restarea');
        document.getElementById('theme-restarea').classList.add('active');
        updateMapDisplayImproved();
    }
};

themeLog('🚀 테마 컨트롤러 초기화 완료! 개발자 도구에서 window.themeControllerUtils 를 사용할 수 있습니다.');
