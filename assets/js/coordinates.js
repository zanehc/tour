/**
 * 한국 트렌드 관광지 & 맛집 지도 - 좌표 및 지역 정보 관리
 * 
 * 이 파일은 다음과 같은 기능을 제공합니다:
 * 1. 지역 코드와 좌표 매핑
 * 2. 관광지/맛집 카테고리 정보
 * 3. 지도 관련 유틸리티 함수들
 * 4. 트렌드 분석 도우미 함수들
 */

// ==================== 지역 코드 및 좌표 정보 ====================

/**
 * TourAPI 지역 코드와 좌표 매핑
 * API에서 사용하는 지역 코드와 실제 좌표를 연결
 */
const REGION_COORDINATES = {
    // 특별시/광역시
    '1': { name: '서울특별시', coords: [37.5665, 126.9780], zoom: 11 },
    '2': { name: '인천광역시', coords: [37.4563, 126.7052], zoom: 11 },
    '3': { name: '대전광역시', coords: [36.3504, 127.3845], zoom: 11 },
    '4': { name: '대구광역시', coords: [35.8714, 128.6014], zoom: 11 },
    '5': { name: '광주광역시', coords: [35.1595, 126.8526], zoom: 11 },
    '6': { name: '부산광역시', coords: [35.1796, 129.0756], zoom: 11 },
    '7': { name: '울산광역시', coords: [35.5384, 129.3114], zoom: 11 },
    '8': { name: '세종특별자치시', coords: [36.4800, 127.2890], zoom: 12 },
    
    // 도 단위
    '31': { name: '경기도', coords: [37.4138, 127.5183], zoom: 9 },
    '32': { name: '강원특별자치도', coords: [37.8228, 128.1555], zoom: 9 },
    '33': { name: '충청북도', coords: [36.8, 127.7], zoom: 9 },
    '34': { name: '충청남도', coords: [36.5, 126.8], zoom: 9 },
    '35': { name: '경상북도', coords: [36.4919, 128.888], zoom: 9 },
    '36': { name: '경상남도', coords: [35.4606, 128.2132], zoom: 9 },
    '37': { name: '전라북도', coords: [35.7175, 127.153], zoom: 9 },
    '38': { name: '전라남도', coords: [34.8679, 126.991], zoom: 9 },
    '39': { name: '제주특별자치도', coords: [33.4996, 126.5312], zoom: 10 }
};

/**
 * 시군구별 상세 좌표 (주요 관광지역 중심)
 */
const DETAILED_COORDINATES = {
    // 서울특별시 구별
    '1_1': { name: '종로구', coords: [37.5735, 126.9788] },
    '1_2': { name: '중구', coords: [37.5641, 126.9979] },
    '1_3': { name: '용산구', coords: [37.5326, 126.9903] },
    '1_4': { name: '성동구', coords: [37.5635, 127.0369] },
    '1_5': { name: '광진구', coords: [37.5385, 127.0823] },
    // ... 총 25개 서울 구별 좌표
    
    // 경기도 주요 시군
    '31_1': { name: '수원시', coords: [37.2636, 127.0286] },
    '31_2': { name: '성남시', coords: [37.4201, 127.1262] },
    '31_3': { name: '고양시', coords: [37.6584, 126.8320] },
    // ... 주요 경기도 시군 좌표
    
    // 제주도
    '39_1': { name: '제주시', coords: [33.4996, 126.5312] },
    '39_2': { name: '서귀포시', coords: [33.2542, 126.5600] },
    
    // 부산광역시 구별 (14개 구군)
    '6_1': { name: '부산 중구', coords: [35.1040, 129.0324] },
    '6_2': { name: '부산 서구', coords: [35.0971, 129.0243] },
    // ... 부산 전체 구군 좌표
};

// ==================== 카테고리 및 콘텐츠 타입 정보 ====================

/**
 * TourAPI 콘텐츠 타입 정의
 */
const CONTENT_TYPES = {
    TOURIST_SPOT: '12',      // 관광지
    CULTURAL_FACILITY: '14', // 문화시설
    FESTIVAL: '15',          // 축제공연행사
    TRAVEL_COURSE: '25',     // 여행코스
    LEPORTS: '28',           // 레포츠
    ACCOMMODATION: '32',     // 숙박
    SHOPPING: '38',          // 쇼핑
    RESTAURANT: '39'         // 음식점
};

/**
 * 카테고리별 세부 분류 (cat1, cat2, cat3 코드)
 */
const CATEGORY_CODES = {
    // 관광지 대분류 (A01~A05)
    tourist: {
        'A01': {
            name: '자연',
            subcategories: {
                'A0101': '자연관광지',
                'A0102': '관광자원',
                'A0103': '관광단지'
            }
        },
        'A02': {
            name: '문화',
            subcategories: {
                'A0201': '역사관광지',
                'A0202': '휴양관광지',
                'A0203': '체험관광지',
                'A0204': '산업관광지',
                'A0205': '건축/조형물',
                'A0206': '문화시설'
            }
        },
        'A03': {
            name: '레포츠',
            subcategories: {
                'A0301': '레포츠소개',
                'A0302': '육상 레포츠',
                'A0303': '수상 레포츠',
                'A0304': '항공 레포츠',
                'A0305': '복합 레포츠'
            }
        }
        // ... A04, A05 계속
    },
    
    // 음식점 세부 분류
    restaurant: {
        'A05': {
            name: '한식',
            subcategories: {
                'A05010100': '구이류',
                'A05010200': '국수류', 
                'A05010300': '국/탕류',
                'A05010400': '닭요리',
                'A05010500': '족발/보쌈',
                'A05010600': '한정식',
                'A05010700': '죽류',
                'A05010800': '찌개류',
                'A05010900': '찜류',
                'A05011000': '회류',
                'A05011100': '기타'
            }
        },
        'A05020000': {
            name: '서양식',
            subcategories: {
                'A05020100': '일식',
                'A05020200': '중식',
                'A05020300': '경양식',
                'A05020400': '패스트푸드',
                'A05020500': '카페/디저트',
                'A05020600': '이색음식점',
                'A05020700': '기타'
            }
        }
    },
    
    // 숙박 세부 분류
    accommodation: {
        'B02': {
            name: '숙박시설',
            subcategories: {
                'B02010100': '호텔',
                'B02010200': '콘도미니엄',
                'B02010300': '유스호스텔',
                'B02010400': '펜션',
                'B02010500': '민박',
                'B02010600': '모텔',
                'B02010700': '게스트하우스',
                'B02010800': '홈스테이',
                'B02010900': '한옥',
                'B02011000': '캠핑장',
                'B02011100': '기타'
            }
        }
    },
    
    // 축제/행사 세부 분류
    festival: {
        'A02': {
            name: '문화관광축제',
            subcategories: {
                'A02080100': '문화관광축제',
                'A02080200': '일반축제',
                'A02080300': '전통공연',
                'A02080400': '연극',
                'A02080500': '뮤지컬',
                'A02080600': '오페라',
                'A02080700': '전시회',
                'A02080800': '박람회',
                'A02080900': '컨벤션',
                'A02081000': '무용',
                'A02081100': '클래식음악회',
                'A02081200': '대중콘서트',
                'A02081300': '영화',
                'A02081400': '스포츠경기',
                'A02081500': '기타행사'
            }
        }
    }
};

// ==================== 마커 스타일 설정 ====================

/**
 * 카테고리별 마커 스타일 정의
 */
const MARKER_STYLES = {
    tourist: {
        color: '#e74c3c',
        icon: 'fa-mountain',
        name: '관광지'
    },
    restaurant: {
        color: '#f39c12', 
        icon: 'fa-utensils',
        name: '맛집'
    },
    accommodation: {
        color: '#3498db',
        icon: 'fa-bed', 
        name: '숙박'
    },
    festival: {
        color: '#9b59b6',
        icon: 'fa-calendar-alt',
        name: '축제/행사'
    },
    cultural: {
        color: '#1abc9c',
        icon: 'fa-building-columns',
        name: '문화시설'
    },
    shopping: {
        color: '#e67e22',
        icon: 'fa-shopping-bag',
        name: '쇼핑'
    },
    leports: {
        color: '#2ecc71',
        icon: 'fa-bicycle',
        name: '레포츠'
    }
};

/**
 * 조회수 기반 마커 크기 계산
 */
const MARKER_SIZE_CONFIG = {
    small: { min: 0, max: 999, radius: 6 },
    medium: { min: 1000, max: 4999, radius: 9 },
    large: { min: 5000, max: 9999, radius: 12 },
    xlarge: { min: 10000, max: Infinity, radius: 15 }
};

// ==================== 유틸리티 함수들 ====================

/**
 * 지역 코드로 좌표 조회
 * @param {string} regionCode - TourAPI 지역 코드
 * @returns {Object|null} 지역 정보 객체 또는 null
 */
function getRegionInfo(regionCode) {
    return REGION_COORDINATES[regionCode] || null;
}

/**
 * 지역명으로 지역 코드 검색
 * @param {string} regionName - 지역명
 * @returns {string|null} 지역 코드 또는 null
 */
function getRegionCodeByName(regionName) {
    for (const [code, info] of Object.entries(REGION_COORDINATES)) {
        if (info.name === regionName || info.name.includes(regionName)) {
            return code;
        }
    }
    return null;
}

/**
 * 모든 지역 목록 조회
 * @returns {Array} 지역 정보 배열
 */
function getAllRegions() {
    return Object.entries(REGION_COORDINATES).map(([code, info]) => ({
        code,
        ...info
    }));
}

/**
 * 카테고리 코드로 카테고리명 조회
 * @param {string} type - 서비스 타입 (tourist, restaurant, etc.)
 * @param {string} cat1 - 대분류 코드
 * @param {string} cat2 - 중분류 코드 (선택사항)
 * @param {string} cat3 - 소분류 코드 (선택사항)
 * @returns {string} 카테고리명
 */
function getCategoryName(type, cat1, cat2 = '', cat3 = '') {
    const categories = CATEGORY_CODES[type];
    if (!categories) return '기타';
    
    // 가장 세부적인 분류부터 확인
    if (cat3 && categories[cat1] && categories[cat1].subcategories[cat3]) {
        return categories[cat1].subcategories[cat3];
    }
    
    if (cat2 && categories[cat1] && categories[cat1].subcategories[cat2]) {
        return categories[cat1].subcategories[cat2];
    }
    
    if (categories[cat1]) {
        return categories[cat1].name;
    }
    
    return '기타';
}

/**
 * 조회수에 따른 마커 크기 계산
 * @param {number} readcount - 조회수
 * @returns {number} 마커 반지름
 */
function getMarkerRadius(readcount) {
    const count = parseInt(readcount) || 0;
    
    for (const [size, config] of Object.entries(MARKER_SIZE_CONFIG)) {
        if (count >= config.min && count <= config.max) {
            return config.radius;
        }
    }
    
    return MARKER_SIZE_CONFIG.small.radius;
}

/**
 * 타입별 마커 스타일 조회
 * @param {string} type - 서비스 타입
 * @param {number} readcount - 조회수 (선택사항)
 * @returns {Object} 마커 스타일 객체
 */
function getMarkerStyle(type, readcount = 0) {
    const style = MARKER_STYLES[type] || MARKER_STYLES.tourist;
    const radius = getMarkerRadius(readcount);
    
    return {
        ...style,
        radius
    };
}

/**
 * 거리 계산 (두 좌표 간의 직선 거리)
 * @param {Array} coord1 - [위도, 경도]
 * @param {Array} coord2 - [위도, 경도]
 * @returns {number} 거리 (km)
 */
function calculateDistance(coord1, coord2) {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    
    const R = 6371; // 지구 반지름 (km)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // 소수점 2자리
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * 트렌드 점수 계산
 * @param {Object} item - 관광지/맛집 데이터
 * @returns {number} 트렌드 점수 (0-100)
 */
function calculateTrendScore(item) {
    const readcount = parseInt(item.readcount) || 0;
    const baseScore = Math.min(readcount / 1000, 50); // 조회수 기반 점수 (최대 50점)
    
    // 추가 점수 요소들
    let bonusScore = 0;
    
    // 이미지가 있으면 +10점
    if (item.firstimage) bonusScore += 10;
    
    // 전화번호가 있으면 +5점
    if (item.tel) bonusScore += 5;
    
    // 홈페이지가 있으면 +5점
    if (item.homepage) bonusScore += 5;
    
    return Math.min(baseScore + bonusScore, 100);
}

/**
 * 데이터 필터링 헬퍼
 * @param {Array} data - 원본 데이터
 * @param {Object} filters - 필터 조건
 * @returns {Array} 필터링된 데이터
 */
function filterData(data, filters = {}) {
    return data.filter(item => {
        // 지역 필터
        if (filters.regionCode && item.areacode !== filters.regionCode) {
            return false;
        }
        
        // 카테고리 필터
        if (filters.category) {
            const categoryMatches = 
                item.cat1 === filters.category ||
                item.cat2 === filters.category ||
                item.cat3 === filters.category;
            if (!categoryMatches) return false;
        }
        
        // 조회수 최소값 필터
        if (filters.minReadcount) {
            const readcount = parseInt(item.readcount) || 0;
            if (readcount < filters.minReadcount) return false;
        }
        
        // 키워드 필터
        if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase();
            const titleMatch = item.title && item.title.toLowerCase().includes(keyword);
            const addrMatch = item.addr1 && item.addr1.toLowerCase().includes(keyword);
            if (!titleMatch && !addrMatch) return false;
        }
        
        return true;
    });
}

/**
 * 데이터 정렬 헬퍼
 * @param {Array} data - 정렬할 데이터
 * @param {string} sortBy - 정렬 기준 (readcount, distance, title)
 * @param {Array} userLocation - 사용자 위치 [위도, 경도] (거리순 정렬시 필요)
 * @returns {Array} 정렬된 데이터
 */
function sortData(data, sortBy = 'readcount', userLocation = null) {
    const sortedData = [...data];
    
    switch (sortBy) {
        case 'readcount':
            return sortedData.sort((a, b) => {
                const aCount = parseInt(a.readcount) || 0;
                const bCount = parseInt(b.readcount) || 0;
                return bCount - aCount; // 내림차순
            });
            
        case 'distance':
            if (!userLocation) return sortedData;
            return sortedData.sort((a, b) => {
                const aCoords = [parseFloat(a.mapy), parseFloat(a.mapx)];
                const bCoords = [parseFloat(b.mapy), parseFloat(b.mapx)];
                const aDist = calculateDistance(userLocation, aCoords);
                const bDist = calculateDistance(userLocation, bCoords);
                return aDist - bDist; // 오름차순
            });
            
        case 'title':
            return sortedData.sort((a, b) => {
                return (a.title || '').localeCompare(b.title || '');
            });
            
        default:
            return sortedData;
    }
}

// ==================== 내보내기 ====================

// Node.js 환경에서 사용 가능하도록 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        REGION_COORDINATES,
        DETAILED_COORDINATES,
        CONTENT_TYPES,
        CATEGORY_CODES,
        MARKER_STYLES,
        MARKER_SIZE_CONFIG,
        getRegionInfo,
        getRegionCodeByName,
        getAllRegions,
        getCategoryName,
        getMarkerRadius,
        getMarkerStyle,
        calculateDistance,
        calculateTrendScore,
        filterData,
        sortData
    };
}

// 브라우저 환경에서 전역 객체로 노출
if (typeof window !== 'undefined') {
    window.TourMapUtils = {
        REGION_COORDINATES,
        DETAILED_COORDINATES,
        CONTENT_TYPES,
        CATEGORY_CODES,
        MARKER_STYLES,
        MARKER_SIZE_CONFIG,
        getRegionInfo,
        getRegionCodeByName,
        getAllRegions,
        getCategoryName,
        getMarkerRadius,
        getMarkerStyle,
        calculateDistance,
        calculateTrendScore,
        filterData,
        sortData
    };
}
