// 개선된 데이터 로더 - data-loader.js
// 기존 함수들을 오버라이드하여 더 안정적인 데이터 로딩 제공

console.log('🔧 개선된 데이터 로더가 로드되었습니다.');

// 디버깅을 위한 로그 함수
function debugLog(message, data = null) {
    console.log(`[DATA-LOADER] ${message}`, data || '');
}

// Excel 파일의 모든 시트를 확인하고 데이터를 찾는 함수
function findDataInWorkbook(workbook) {
    debugLog('워크북 분석 시작', workbook.SheetNames);
    
    for (let sheetName of workbook.SheetNames) {
        debugLog(`시트 "${sheetName}" 분석 중...`);
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            raw: false,
            blankrows: false
        });
        
        if (jsonData.length > 1) {
            const headers = jsonData[0];
            debugLog(`시트 "${sheetName}" 헤더:`, headers);
            debugLog(`시트 "${sheetName}" 데이터 행 수:`, jsonData.length - 1);
            
            // 위도/경도 관련 컬럼이 있는지 확인
            const hasLocationData = headers.some(header => {
                const h = String(header).toLowerCase();
                return h.includes('위도') || h.includes('경도') || 
                       h.includes('lat') || h.includes('lng') || 
                       h.includes('longitude') || h.includes('latitude');
            });
            
            if (hasLocationData) {
                debugLog(`✅ 시트 "${sheetName}"에서 위치 데이터 발견!`);
                return { sheetName, headers, data: jsonData };
            }
        }
    }
    
    debugLog('❌ 적절한 데이터 시트를 찾을 수 없습니다.');
    return null;
}

// 헤더 매핑 함수 - 다양한 헤더명에 대응
function mapHeaders(headers) {
    const headerMap = {};
    
    headers.forEach((header, index) => {
        const h = String(header).toLowerCase().trim();
        
        // 휴게소명 매핑
        if (h.includes('휴게소명') || h.includes('name') || h.includes('이름') || h.includes('명칭')) {
            headerMap['휴게소명'] = index;
        }
        
        // 위도 매핑
        if (h.includes('위도') || h.includes('lat') || h.includes('latitude')) {
            headerMap['위도'] = index;
        }
        
        // 경도 매핑
        if (h.includes('경도') || h.includes('lng') || h.includes('lon') || h.includes('longitude')) {
            headerMap['경도'] = index;
        }
        
        // 고속도로 매핑
        if (h.includes('고속도로') || h.includes('highway') || h.includes('도로명')) {
            headerMap['고속도로'] = index;
        }
        
        // 휴게소종류 매핑
        if (h.includes('종류') || h.includes('type') || h.includes('구분')) {
            headerMap['휴게소종류'] = index;
        }
        
        // 운영시간 매핑
        if (h.includes('운영시간') || h.includes('시간') || h.includes('time') || h.includes('hours')) {
            headerMap['운영시간'] = index;
        }
        
        // 방향 매핑
        if (h.includes('방향') || h.includes('direction')) {
            headerMap['방향'] = index;
        }
        
        // 편의시설 매핑
        if (h.includes('편의시설') || h.includes('시설') || h.includes('facility')) {
            headerMap['주요편의시설'] = index;
        }
        
        // 전화번호 매핑
        if (h.includes('전화') || h.includes('phone') || h.includes('tel')) {
            headerMap['전화번호'] = index;
        }
        
        // 기준일 매핑
        if (h.includes('기준일') || h.includes('date') || h.includes('날짜')) {
            headerMap['데이터기준일'] = index;
        }
        
        // 매장 매핑
        if (h.includes('매장') || h.includes('프랜차이즈') || h.includes('franchise')) {
            headerMap['프랜차이즈매장'] = index;
        }
    });
    
    debugLog('헤더 매핑 결과:', headerMap);
    return headerMap;
}

// 좌표 검증 함수
function isValidCoordinate(lat, lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    return !isNaN(latitude) && !isNaN(longitude) &&
           latitude >= 33 && latitude <= 39 &&
           longitude >= 124 && longitude <= 132;
}

// 개선된 XLSX 파싱 함수
function parseXLSXDataImproved(xlsxBuffer) {
    try {
        debugLog('XLSX 파일 파싱 시작...');
        
        const workbook = XLSX.read(xlsxBuffer, { 
            type: 'array',
            cellStyles: true,
            cellFormulas: false,
            cellDates: true
        });
        
        debugLog('워크북 로드 완료', `${workbook.SheetNames.length}개 시트`);
        
        const sheetInfo = findDataInWorkbook(workbook);
        if (!sheetInfo) {
            throw new Error('데이터가 포함된 시트를 찾을 수 없습니다.');
        }
        
        const { sheetName, headers, data } = sheetInfo;
        const headerMap = mapHeaders(headers);
        
        // 필수 필드 체크
        if (!headerMap['위도'] || !headerMap['경도']) {
            throw new Error('위도 또는 경도 컬럼을 찾을 수 없습니다.');
        }
        
        const result = [];
        let validCount = 0;
        let invalidCount = 0;
        
        // 데이터 행 처리 (헤더 제외)
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            
            try {
                const lat = row[headerMap['위도']];
                const lng = row[headerMap['경도']];
                
                if (isValidCoordinate(lat, lng)) {
                    const restAreaData = {
                        '휴게소명': row[headerMap['휴게소명']] || `휴게소_${i}`,
                        '위도': parseFloat(lat),
                        '경도': parseFloat(lng),
                        '고속도로': row[headerMap['고속도로']] || '정보없음',
                        '휴게소종류': row[headerMap['휴게소종류']] || '일반형',
                        '운영시간': row[headerMap['운영시간']] || '24시간',
                        '방향': row[headerMap['방향']] || '정보없음',
                        '주요편의시설': row[headerMap['주요편의시설']] || '편의점, 음식점',
                        '전화번호': row[headerMap['전화번호']] || '정보없음',
                        '데이터기준일': row[headerMap['데이터기준일']] || '2024-01-01',
                        '프랜차이즈매장': row[headerMap['프랜차이즈매장']] || '정보없음'
                    };
                    
                    result.push(restAreaData);
                    validCount++;
                } else {
                    invalidCount++;
                    debugLog(`행 ${i}: 잘못된 좌표 (${lat}, ${lng})`);
                }
            } catch (error) {
                invalidCount++;
                debugLog(`행 ${i} 처리 오류:`, error.message);
            }
        }
        
        debugLog(`파싱 완료: 유효 ${validCount}개, 무효 ${invalidCount}개`);
        return result;
        
    } catch (error) {
        debugLog('XLSX 파싱 실패:', error.message);
        throw error;
    }
}

// 개선된 CSV 파싱 함수
function parseCSVDataImproved(csvText) {
    try {
        debugLog('CSV 파일 파싱 시작...');
        
        const lines = csvText.trim().split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            throw new Error('CSV 파일에 충분한 데이터가 없습니다.');
        }
        
        const headers = parseCSVLineImproved(lines[0]);
        debugLog('CSV 헤더:', headers);
        
        const headerMap = mapHeaders(headers);
        
        if (!headerMap['위도'] || !headerMap['경도']) {
            throw new Error('CSV에서 위도 또는 경도 컬럼을 찾을 수 없습니다.');
        }
        
        const result = [];
        let validCount = 0;
        let invalidCount = 0;
        
        for (let i = 1; i < lines.length; i++) {
            try {
                const values = parseCSVLineImproved(lines[i]);
                const lat = values[headerMap['위도']];
                const lng = values[headerMap['경도']];
                
                if (isValidCoordinate(lat, lng)) {
                    const restAreaData = {
                        '휴게소명': values[headerMap['휴게소명']] || `휴게소_${i}`,
                        '위도': parseFloat(lat),
                        '경도': parseFloat(lng),
                        '고속도로': values[headerMap['고속도로']] || '정보없음',
                        '휴게소종류': values[headerMap['휴게소종류']] || '일반형',
                        '운영시간': values[headerMap['운영시간']] || '24시간',
                        '방향': values[headerMap['방향']] || '정보없음',
                        '주요편의시설': values[headerMap['주요편의시설']] || '편의점, 음식점',
                        '전화번호': values[headerMap['전화번호']] || '정보없음',
                        '데이터기준일': values[headerMap['데이터기준일']] || '2024-01-01',
                        '프랜차이즈매장': values[headerMap['프랜차이즈매장']] || '정보없음'
                    };
                    
                    result.push(restAreaData);
                    validCount++;
                } else {
                    invalidCount++;
                }
            } catch (error) {
                invalidCount++;
                debugLog(`CSV 행 ${i} 처리 오류:`, error.message);
            }
        }
        
        debugLog(`CSV 파싱 완료: 유효 ${validCount}개, 무효 ${invalidCount}개`);
        return result;
        
    } catch (error) {
        debugLog('CSV 파싱 실패:', error.message);
        throw error;
    }
}

// 개선된 CSV 라인 파싱
function parseCSVLineImproved(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    let escapeNext = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (escapeNext) {
            current += char;
            escapeNext = false;
            continue;
        }
        
        if (char === '\\') {
            escapeNext = true;
            continue;
        }
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // 다음 따옴표 건너뛰기
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result.map(item => item.replace(/^["']|["']$/g, ''));
}

// 파일 존재 여부 확인 함수
async function checkFileExists(filename) {
    try {
        await window.fs.readFile(filename);
        return true;
    } catch (error) {
        return false;
    }
}

// 개선된 휴게소 데이터 로드 함수
async function loadRestAreaDataImproved() {
    debugLog('개선된 데이터 로딩 시작...');
    
    const loadingMessage = showFloatingMessage('🔧 개선된 로더로 데이터를 불러오는 중...', 'loading');
    
    try {
        let parsedData = null;
        let dataSource = '';
        
        // 파일 존재 여부 확인
        const xlsxExists = await checkFileExists('data_ex.xlsx');
        const csvExists = await checkFileExists('data_ex.csv');
        
        debugLog('파일 존재 여부:', { xlsx: xlsxExists, csv: csvExists });
        
        if (xlsxExists) {
            try {
                debugLog('XLSX 파일 읽기 시도...');
                const xlsxBuffer = await window.fs.readFile('data_ex.xlsx');
                debugLog('XLSX 파일 크기:', xlsxBuffer.length, 'bytes');
                
                if (xlsxBuffer.length > 0) {
                    parsedData = parseXLSXDataImproved(xlsxBuffer);
                    dataSource = 'XLSX';
                    debugLog('✅ XLSX 파일에서 데이터 로드 성공');
                } else {
                    throw new Error('XLSX 파일이 비어있습니다.');
                }
            } catch (xlsxError) {
                debugLog('XLSX 로드 실패:', xlsxError.message);
            }
        }
        
        if (!parsedData && csvExists) {
            try {
                debugLog('CSV 파일 읽기 시도...');
                const csvText = await window.fs.readFile('data_ex.csv', { encoding: 'utf8' });
                debugLog('CSV 파일 크기:', csvText.length, 'characters');
                
                if (csvText.trim().length > 0) {
                    parsedData = parseCSVDataImproved(csvText);
                    dataSource = 'CSV';
                    debugLog('✅ CSV 파일에서 데이터 로드 성공');
                } else {
                    throw new Error('CSV 파일이 비어있습니다.');
                }
            } catch (csvError) {
                debugLog('CSV 로드 실패:', csvError.message);
            }
        }
        
        // 로딩 메시지 제거
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        if (!parsedData || parsedData.length === 0) {
            const errorMsg = !xlsxExists && !csvExists ? 
                '데이터 파일(data_ex.xlsx 또는 data_ex.csv)을 찾을 수 없습니다.' :
                '데이터 파일을 찾았지만 유효한 데이터를 읽을 수 없습니다.';
            
            throw new Error(errorMsg);
        }
        
        // 전역 변수에 데이터 저장
        window.restAreaData = parsedData;
        
        debugLog(`🎉 데이터 로드 완료! ${dataSource}에서 ${parsedData.length}개 휴게소 데이터`);
        
        // 성공 메시지 표시
        showFloatingMessage(
            `🎉 ${dataSource} 파일에서 ${parsedData.length}개 휴게소 데이터를 성공적으로 불러왔습니다!`, 
            'success', 
            4000
        );
        
        // 샘플 데이터 출력 (디버깅용)
        if (parsedData.length > 0) {
            debugLog('첫 번째 데이터 샘플:', parsedData[0]);
        }
        
        return parsedData;
        
    } catch (error) {
        // 로딩 메시지 제거
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        debugLog('❌ 모든 데이터 로드 시도 실패:', error.message);
        
        // 기본 샘플 데이터 사용
        const sampleData = getSampleRestAreaData();
        window.restAreaData = sampleData.map(row => ({
            '휴게소명': row['휴게소명'],
            '고속도로': row['고속도로'],
            '위도': parseFloat(row['위도']),
            '경도': parseFloat(row['경도']),
            '휴게소종류': row['휴게소종류'],
            '운영시간': row['운영시간'],
            '방향': row['방향'],
            '주요편의시설': row['주요편의시설'],
            '전화번호': row['전화번호'],
            '데이터기준일': row['데이터기준일'],
            '프랜차이즈매장': row['프랜차이즈매장']
        }));
        
        showFloatingMessage(
            `⚠️ 실제 파일을 읽을 수 없어 샘플 데이터(${window.restAreaData.length}개)를 사용합니다.\n오류: ${error.message}`, 
            'error', 
            7000
        );
        
        return window.restAreaData;
    }
}

// 기존 함수 오버라이드
if (typeof window !== 'undefined') {
    // 원본 함수 백업
    window.originalLoadRestAreaData = window.loadRestAreaData;
    
    // 개선된 함수로 교체
    window.loadRestAreaData = loadRestAreaDataImproved;
    
    debugLog('✅ loadRestAreaData 함수가 개선된 버전으로 교체되었습니다.');
}

// 개발자 도구용 유틸리티 함수들
window.dataLoaderUtils = {
    // 현재 로드된 데이터 확인
    checkData: () => {
        console.log('현재 휴게소 데이터:', window.restAreaData);
        return window.restAreaData;
    },
    
    // 데이터 재로드
    reloadData: async () => {
        console.log('데이터 재로드 중...');
        return await loadRestAreaDataImproved();
    },
    
    // 데이터 통계
    getDataStats: () => {
        if (!window.restAreaData) {
            console.log('데이터가 없습니다.');
            return null;
        }
        
        const data = window.restAreaData;
        const stats = {
            총개수: data.length,
            고속도로별: {},
            종류별: {},
            방향별: {}
        };
        
        data.forEach(item => {
            // 고속도로별 통계
            const highway = item['고속도로'];
            stats.고속도로별[highway] = (stats.고속도로별[highway] || 0) + 1;
            
            // 종류별 통계
            const type = item['휴게소종류'];
            stats.종류별[type] = (stats.종류별[type] || 0) + 1;
            
            // 방향별 통계
            const direction = item['방향'];
            stats.방향별[direction] = (stats.방향별[direction] || 0) + 1;
        });
        
        console.log('데이터 통계:', stats);
        return stats;
    },
    
    // 특정 휴게소 검색
    searchRestArea: (keyword) => {
        if (!window.restAreaData) {
            console.log('데이터가 없습니다.');
            return [];
        }
        
        const results = window.restAreaData.filter(item => 
            item['휴게소명'].includes(keyword) ||
            item['고속도로'].includes(keyword)
        );
        
        console.log(`"${keyword}" 검색 결과:`, results);
        return results;
    }
};

debugLog('🚀 데이터 로더 초기화 완료! 개발자 도구에서 window.dataLoaderUtils 를 사용하여 데이터를 확인할 수 있습니다.');
