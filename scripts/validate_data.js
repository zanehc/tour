/**
 * 데이터 유효성 검사 스크립트
 * GitHub Actions에서 수집한 관광 데이터의 품질을 검증합니다.
 */

const fs = require('fs').promises;
const path = require('path');

// 한국 행정구역 코드 매핑
const AREA_CODES = {
    '11': '서울특별시',
    '26': '부산광역시', 
    '27': '대구광역시',
    '28': '인천광역시',
    '29': '광주광역시',
    '30': '대전광역시',
    '31': '울산광역시',
    '36': '세종특별자치시',
    '41': '경기도',
    '42': '강원특별자치도',
    '43': '충청북도',
    '44': '충청남도',
    '45': '전라북도',
    '46': '전라남도',
    '47': '경상북도',
    '48': '경상남도',
    '50': '제주특별자치도'
};

// 관광객 구분 코드
const TOURIST_TYPE_CODES = {
    '1': '현지인(a)',
    '2': '외지인(b)', 
    '3': '외국인(c)'
};

// 요일 구분 코드
const DAY_CODES = {
    '1': '월요일',
    '2': '화요일',
    '3': '수요일',
    '4': '목요일',
    '5': '금요일',
    '6': '토요일',
    '7': '일요일'
};

class DataValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.stats = {
            totalRecords: 0,
            validRecords: 0,
            invalidRecords: 0,
            metroRecords: 0,
            localRecords: 0
        };
    }

    /**
     * 메인 검증 함수
     */
    async validateAll() {
        console.log('🔍 관광 데이터 유효성 검사 시작...\n');
        
        try {
            // 현재 데이터 파일 검증
            await this.validateCurrentData();
            
            // 히스토리 데이터 검증
            await this.validateHistoryData();
            
            // 데이터 일관성 검사
            await this.validateDataConsistency();
            
            // 결과 출력
            this.printResults();
            
            // 검증 실패 시 종료 코드 1 반환
            if (this.errors.length > 0) {
                process.exit(1);
            }
            
        } catch (error) {
            console.error('❌ 검증 중 오류 발생:', error);
            process.exit(1);
        }
    }

    /**
     * 현재 데이터 파일 검증
     */
    async validateCurrentData() {
        console.log('📊 현재 데이터 파일 검증 중...');
        
        const dataDir = path.join(__dirname, '..', 'data');
        const currentFiles = ['metro-current.json', 'local-current.json'];
        
        for (const fileName of currentFiles) {
            const filePath = path.join(dataDir, fileName);
            const dataType = fileName.includes('metro') ? 'metro' : 'local';
            
            try {
                const fileContent = await fs.readFile(filePath, 'utf8');
                const data = JSON.parse(fileContent);
                
                await this.validateJsonStructure(data, dataType, fileName);
                await this.validateDataRecords(data, dataType, fileName);
                
                console.log(`✅ ${fileName} 검증 완료`);
                
            } catch (error) {
                if (error.code === 'ENOENT') {
                    this.errors.push(`❌ 파일이 존재하지 않음: ${fileName}`);
                } else if (error instanceof SyntaxError) {
                    this.errors.push(`❌ JSON 파싱 오류: ${fileName}`);
                } else {
                    this.errors.push(`❌ 파일 검증 실패: ${fileName} - ${error.message}`);
                }
            }
        }
    }

    /**
     * JSON 구조 검증
     */
    async validateJsonStructure(data, dataType, fileName) {
        // 기본 응답 구조 검증
        if (!data.response) {
            this.errors.push(`❌ ${fileName}: response 필드가 없습니다`);
            return;
        }

        const response = data.response;

        // 헤더 검증
        if (!response.header) {
            this.errors.push(`❌ ${fileName}: header 필드가 없습니다`);
        } else {
            if (response.header.resultCode !== '0000') {
                this.errors.push(`❌ ${fileName}: API 응답 오류 - ${response.header.resultCode}: ${response.header.resultMsg}`);
            }
        }

        // 바디 검증
        if (!response.body) {
            this.errors.push(`❌ ${fileName}: body 필드가 없습니다`);
            return;
        }

        const body = response.body;

        // 페이징 정보 검증
        if (typeof body.numOfRows !== 'number' || body.numOfRows <= 0) {
            this.warnings.push(`⚠️ ${fileName}: numOfRows 값이 이상합니다 (${body.numOfRows})`);
        }

        if (typeof body.pageNo !== 'number' || body.pageNo <= 0) {
            this.warnings.push(`⚠️ ${fileName}: pageNo 값이 이상합니다 (${body.pageNo})`);
        }

        if (typeof body.totalCount !== 'number' || body.totalCount < 0) {
            this.warnings.push(`⚠️ ${fileName}: totalCount 값이 이상합니다 (${body.totalCount})`);
        }

        // 아이템 데이터 검증
        if (!body.items) {
            if (body.totalCount > 0) {
                this.errors.push(`❌ ${fileName}: totalCount가 0보다 크지만 items가 없습니다`);
            }
        }
    }

    /**
     * 데이터 레코드 검증
     */
    async validateDataRecords(data, dataType, fileName) {
        const items = data.response?.body?.items?.item;
        
        if (!items) {
            this.warnings.push(`⚠️ ${fileName}: 데이터가 없습니다`);
            return;
        }

        // 배열로 변환 (단일 아이템인 경우)
        const records = Array.isArray(items) ? items : [items];
        
        this.stats.totalRecords += records.length;
        
        if (dataType === 'metro') {
            this.stats.metroRecords += records.length;
        } else {
            this.stats.localRecords += records.length;
        }

        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const recordId = `${fileName}[${i}]`;
            
            if (this.validateRecord(record, dataType, recordId)) {
                this.stats.validRecords++;
            } else {
                this.stats.invalidRecords++;
            }
        }
    }

    /**
     * 개별 레코드 검증
     */
    validateRecord(record, dataType, recordId) {
        let isValid = true;

        if (dataType === 'metro') {
            // 광역 지자체 데이터 검증
            if (!this.validateAreaCode(record.areaCode, recordId)) isValid = false;
            if (!this.validateAreaName(record.areaNm, record.areaCode, recordId)) isValid = false;
        } else {
            // 기초 지자체 데이터 검증
            if (!this.validateSignguCode(record.signguCode, recordId)) isValid = false;
            if (!this.validateSignguName(record.signguNm, recordId)) isValid = false;
        }

        // 공통 필드 검증
        if (!this.validateTouristNumber(record.touNum, recordId)) isValid = false;
        if (!this.validateTouristType(record.touDivCd, record.touDivNm, recordId)) isValid = false;
        if (!this.validateDayOfWeek(record.daywkDivCd, record.daywkDivNm, recordId)) isValid = false;
        if (!this.validateBaseDate(record.baseYmd, recordId)) isValid = false;

        return isValid;
    }

    /**
     * 시도 코드 검증
     */
    validateAreaCode(areaCode, recordId) {
        if (!areaCode) {
            this.errors.push(`❌ ${recordId}: areaCode가 없습니다`);
            return false;
        }

        if (!AREA_CODES[areaCode]) {
            this.errors.push(`❌ ${recordId}: 잘못된 areaCode (${areaCode})`);
            return false;
        }

        return true;
    }

    /**
     * 시도명 검증
     */
    validateAreaName(areaNm, areaCode, recordId) {
        if (!areaNm) {
            this.errors.push(`❌ ${recordId}: areaNm이 없습니다`);
            return false;
        }

        if (areaCode && AREA_CODES[areaCode] !== areaNm) {
            this.warnings.push(`⚠️ ${recordId}: areaNm이 areaCode와 일치하지 않음 (${areaNm} vs ${AREA_CODES[areaCode]})`);
        }

        return true;
    }

    /**
     * 시군구 코드 검증
     */
    validateSignguCode(signguCode, recordId) {
        if (!signguCode) {
            this.errors.push(`❌ ${recordId}: signguCode가 없습니다`);
            return false;
        }

        // 시군구 코드는 5자리 숫자여야 함
        if (!/^\d{5}$/.test(signguCode)) {
            this.errors.push(`❌ ${recordId}: signguCode 형식이 잘못됨 (${signguCode})`);
            return false;
        }

        return true;
    }

    /**
     * 시군구명 검증
     */
    validateSignguName(signguNm, recordId) {
        if (!signguNm) {
            this.errors.push(`❌ ${recordId}: signguNm이 없습니다`);
            return false;
        }

        if (signguNm.length < 2) {
            this.warnings.push(`⚠️ ${recordId}: signguNm이 너무 짧음 (${signguNm})`);
        }

        return true;
    }

    /**
     * 관광객 수 검증
     */
    validateTouristNumber(touNum, recordId) {
        if (touNum === undefined || touNum === null) {
            this.errors.push(`❌ ${recordId}: touNum이 없습니다`);
            return false;
        }

        const numValue = parseFloat(touNum);
        
        if (isNaN(numValue)) {
            this.errors.push(`❌ ${recordId}: touNum이 숫자가 아님 (${touNum})`);
            return false;
        }

        if (numValue < 0) {
            this.warnings.push(`⚠️ ${recordId}: touNum이 음수입니다 (${numValue})`);
        }

        if (numValue > 10000000) {
            this.warnings.push(`⚠️ ${recordId}: touNum이 비정상적으로 큽니다 (${numValue})`);
        }

        return true;
    }

    /**
     * 관광객 유형 검증
     */
    validateTouristType(touDivCd, touDivNm, recordId) {
        if (!touDivCd) {
            this.errors.push(`❌ ${recordId}: touDivCd가 없습니다`);
            return false;
        }

        if (!TOURIST_TYPE_CODES[touDivCd]) {
            this.errors.push(`❌ ${recordId}: 잘못된 touDivCd (${touDivCd})`);
            return false;
        }

        if (touDivNm && TOURIST_TYPE_CODES[touDivCd] !== touDivNm) {
            this.warnings.push(`⚠️ ${recordId}: touDivNm이 touDivCd와 일치하지 않음 (${touDivNm} vs ${TOURIST_TYPE_CODES[touDivCd]})`);
        }

        return true;
    }

    /**
     * 요일 검증
     */
    validateDayOfWeek(daywkDivCd, daywkDivNm, recordId) {
        if (!daywkDivCd) {
            this.errors.push(`❌ ${recordId}: daywkDivCd가 없습니다`);
            return false;
        }

        if (!DAY_CODES[daywkDivCd]) {
            this.errors.push(`❌ ${recordId}: 잘못된 daywkDivCd (${daywkDivCd})`);
            return false;
        }

        if (daywkDivNm && DAY_CODES[daywkDivCd] !== daywkDivNm) {
            this.warnings.push(`⚠️ ${recordId}: daywkDivNm이 daywkDivCd와 일치하지 않음 (${daywkDivNm} vs ${DAY_CODES[daywkDivCd]})`);
        }

        return true;
    }

    /**
     * 기준일자 검증
     */
    validateBaseDate(baseYmd, recordId) {
        if (!baseYmd) {
            this.errors.push(`❌ ${recordId}: baseYmd가 없습니다`);
            return false;
        }

        // YYYYMMDD 형식 검증
        if (!/^\d{8}$/.test(baseYmd)) {
            this.errors.push(`❌ ${recordId}: baseYmd 형식이 잘못됨 (${baseYmd})`);
            return false;
        }

        // 날짜 유효성 검증
        const year = parseInt(baseYmd.substring(0, 4));
        const month = parseInt(baseYmd.substring(4, 6));
        const day = parseInt(baseYmd.substring(6, 8));

        const date = new Date(year, month - 1, day);
        
        if (date.getFullYear() !== year || 
            date.getMonth() !== month - 1 || 
            date.getDate() !== day) {
            this.errors.push(`❌ ${recordId}: baseYmd가 유효하지 않은 날짜 (${baseYmd})`);
            return false;
        }

        // 미래 날짜 체크
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date > today) {
            this.warnings.push(`⚠️ ${recordId}: baseYmd가 미래 날짜입니다 (${baseYmd})`);
        }

        // 너무 오래된 날짜 체크 (90일 이전)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        if (date < ninetyDaysAgo) {
            this.warnings.push(`⚠️ ${recordId}: baseYmd가 90일 이전 데이터입니다 (${baseYmd})`);
        }

        return true;
    }

    /**
     * 히스토리 데이터 검증
     */
    async validateHistoryData() {
        console.log('📚 히스토리 데이터 검증 중...');
        
        try {
            const dataDir = path.join(__dirname, '..', 'data');
            const files = await fs.readdir(dataDir);
            
            const historyFiles = files.filter(file => 
                file.match(/^(metro|local)-\d{8}\.json$/)
            );

            if (historyFiles.length === 0) {
                this.warnings.push('⚠️ 히스토리 데이터 파일이 없습니다');
                return;
            }

            console.log(`📁 히스토리 파일 ${historyFiles.length}개 발견`);

            // 최근 7일간의 파일만 검증 (성능 고려)
            const recentFiles = historyFiles
                .sort()
                .slice(-14); // metro + local = 14개

            for (const fileName of recentFiles) {
                const filePath = path.join(dataDir, fileName);
                
                try {
                    const fileContent = await fs.readFile(filePath, 'utf8');
                    const data = JSON.parse(fileContent);
                    
                    // 간단한 구조 검증만 수행
                    if (!data.response || !data.response.header) {
                        this.warnings.push(`⚠️ 히스토리 파일 구조 이상: ${fileName}`);
                    }
                    
                } catch (error) {
                    this.warnings.push(`⚠️ 히스토리 파일 읽기 실패: ${fileName}`);
                }
            }

            console.log('✅ 히스토리 데이터 검증 완료');
            
        } catch (error) {
            this.warnings.push(`⚠️ 히스토리 데이터 검증 중 오류: ${error.message}`);
        }
    }

    /**
     * 데이터 일관성 검사
     */
    async validateDataConsistency() {
        console.log('🔄 데이터 일관성 검사 중...');
        
        try {
            const dataDir = path.join(__dirname, '..', 'data');
            
            // 현재 데이터 파일들 로드
            const metroData = await this.loadJsonFile(path.join(dataDir, 'metro-current.json'));
            const localData = await this.loadJsonFile(path.join(dataDir, 'local-current.json'));

            if (metroData && localData) {
                // 기준일자 일관성 검사
                const metroDates = this.extractBaseDates(metroData);
                const localDates = this.extractBaseDates(localData);

                const commonDates = metroDates.filter(date => localDates.includes(date));
                
                if (commonDates.length === 0) {
                    this.warnings.push('⚠️ 광역과 기초 지자체 데이터의 기준일자가 일치하지 않습니다');
                }

                // 데이터 크기 검사
                const metroCount = this.countRecords(metroData);
                const localCount = this.countRecords(localData);

                if (metroCount === 0 && localCount === 0) {
                    this.errors.push('❌ 모든 데이터가 비어있습니다');
                } else if (metroCount === 0) {
                    this.warnings.push('⚠️ 광역 지자체 데이터가 없습니다');
                } else if (localCount === 0) {
                    this.warnings.push('⚠️ 기초 지자체 데이터가 없습니다');
                }
            }

            console.log('✅ 데이터 일관성 검사 완료');
            
        } catch (error) {
            this.warnings.push(`⚠️ 데이터 일관성 검사 중 오류: ${error.message}`);
        }
    }

    /**
     * JSON 파일 로드 헬퍼
     */
    async loadJsonFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            return null;
        }
    }

    /**
     * 기준일자 추출
     */
    extractBaseDates(data) {
        const items = data?.response?.body?.items?.item;
        if (!items) return [];
        
        const records = Array.isArray(items) ? items : [items];
        return [...new Set(records.map(record => record.baseYmd))];
    }

    /**
     * 레코드 수 계산
     */
    countRecords(data) {
        const items = data?.response?.body?.items?.item;
        if (!items) return 0;
        
        return Array.isArray(items) ? items.length : 1;
    }

    /**
     * 검증 결과 출력
     */
    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 데이터 유효성 검사 결과');
        console.log('='.repeat(60));

        // 통계 정보
        console.log('\n📈 데이터 통계:');
        console.log(`   총 레코드 수: ${this.stats.totalRecords.toLocaleString()}`);
        console.log(`   유효한 레코드: ${this.stats.validRecords.toLocaleString()}`);
        console.log(`   무효한 레코드: ${this.stats.invalidRecords.toLocaleString()}`);
        console.log(`   광역 지자체: ${this.stats.metroRecords.toLocaleString()}`);
        console.log(`   기초 지자체: ${this.stats.localRecords.toLocaleString()}`);

        if (this.stats.totalRecords > 0) {
            const validRate = (this.stats.validRecords / this.stats.totalRecords * 100).toFixed(1);
            console.log(`   유효성 비율: ${validRate}%`);
        }

        // 오류 출력
        if (this.errors.length > 0) {
            console.log(`\n❌ 오류 (${this.errors.length}개):`);
            this.errors.forEach(error => console.log(`   ${error}`));
        }

        // 경고 출력
        if (this.warnings.length > 0) {
            console.log(`\n⚠️ 경고 (${this.warnings.length}개):`);
            this.warnings.forEach(warning => console.log(`   ${warning}`));
        }

        // 전체 결과
        console.log('\n' + '='.repeat(60));
        if (this.errors.length === 0) {
            console.log('✅ 데이터 유효성 검사 통과!');
            if (this.warnings.length > 0) {
                console.log(`⚠️ ${this.warnings.length}개의 경고가 있습니다.`);
            }
        } else {
            console.log('❌ 데이터 유효성 검사 실패!');
            console.log(`❌ ${this.errors.length}개의 오류와 ${this.warnings.length}개의 경고가 있습니다.`);
        }
        console.log('='.repeat(60));
    }
}

// 스크립트 실행
if (require.main === module) {
    const validator = new DataValidator();
    validator.validateAll().catch(error => {
        console.error('❌ 검증 스크립트 실행 중 오류:', error);
        process.exit(1);
    });
}

module.exports = DataValidator;
