const https = require('https'); // HTTP 대신 HTTPS 모듈 사용
const fs = require('fs').promises; // 파일 시스템 모듈 (비동기)
const path = require('path'); // 경로 처리 모듈

// 한국관광공사 TourAPI 기본 URL
const API_BASE_URL = 'http://apis.data.go.kr/B551011/DataLabService';
// GitHub Secrets에서 주입될 서비스 키
const SERVICE_KEY = process.env.TOUR_API_KEY;

// API 엔드포인트 설정 (광역 및 기초 지자체 방문자 수 집계)
const ENDPOINTS = {
  metro: 'metcoRegnVisitrDDList',  // 광역 지자체 방문자수 집계 
  local: 'locgoRegnVisitrDDList'   // 기초 지자체 방문자수 집계 
};

/**
 * 한국관광공사 TourAPI에서 관광 데이터를 비동기적으로 가져옵니다.
 */
async function fetchTourismData() {
  const today = new Date();
  // 어제 날짜를 기준으로 데이터 조회 (API가 보통 전날 데이터를 제공)
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  // yyyyMMdd 형식으로 날짜 문자열 생성
  const dateStr = yesterday.toISOString().slice(0, 10).replace(/-/g, '');
  
  for (const [key, endpoint] of Object.entries(ENDPOINTS)) {
    try {
      // API 요청 URL 구성 
      const url = `${API_BASE_URL}/${endpoint}?` + new URLSearchParams({
        serviceKey: SERVICE_KEY,
        numOfRows: '1000', // 한 페이지 결과 수 (최대 1000) 
        pageNo: '1',
        MobileOS: 'ETC', // OS 구분 
        MobileApp: 'GitHubPagesApp', // 서비스명 (필수) 
        startYmd: dateStr, // 조회 시작 연월일 
        endYmd: dateStr,   // 조회 종료 연월일 
        _type: 'json'      // 응답 메시지 형식 JSON으로 요청 
      });

      console.log(`Fetching ${key} data for ${dateStr}...`);
      const data = await fetchWithRetry(url); // 재시도 로직을 포함한 데이터 가져오기
      
      // 가져온 데이터를 JSON 파일로 저장
      await saveData(key, data, dateStr);
      
      // API 호출 간격 (과도한 요청 방지, 특히 개발계정은 일일 1,000건 제한 )
      await sleep(1000); 
      
    } catch (error) {
      console.error(`Error fetching ${key} data:`, error.message);
      // 에러 발생 시에도 나머지 엔드포인트는 시도
    }
  }
}

/**
 * 지정된 URL에서 데이터를 가져오고, 실패 시 재시도합니다.
 * @param {string} url - 요청할 URL.
 * @param {number} maxRetries - 최대 재시도 횟수.
 * @returns {Promise<object>} - JSON 파싱된 데이터.
 */
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchData(url);
    } catch (error) {
      // 서비스 요청 제한 횟수 초과 에러(22) 또는 일시적 사용 불가 서비스 키 에러(21)일 경우
      if (error.message.includes('LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR') || 
          error.message.includes('TEMPORARILY_DISABLE_THE_SERVICEKEY_ERROR') ||
          error.message.includes('SERVICE_ACCESS_DENIED_ERROR')) { // 서비스 접근 거부 에러(20) 추가
        console.error(`API rate limit or access denied. Giving up. Error: ${error.message}`);
        throw error; // 재시도 없이 즉시 종료
      }

      if (i === maxRetries - 1) { // 마지막 재시도에서도 실패하면 에러를 던짐
        console.error(`Max retries reached for ${url}. Last error: ${error.message}`);
        throw error;
      }
      console.log(`Retry ${i + 1}/${maxRetries} for ${url} after error: ${error.message}`);
      await sleep(2000 * (i + 1)); // 지수적 백오프 (2초, 4초, 6초...)
    }
  }
}

/**
 * 실제 API 호출을 수행하고 응답을 JSON으로 파싱합니다.
 * @param {string} url - 요청할 URL.
 * @returns {Promise<object>} - JSON 파싱된 데이터.
 */
function fetchData(url) {
  return new Promise((resolve, reject) => {
    // API_BASE_URL이 HTTP이므로 http.get 사용, 하지만 데이터포털 실제 API는 https를 지원
    // URL이 'http'로 시작하면 http.get, 'https'로 시작하면 https.get 사용
    const client = url.startsWith('https://') ? https : require('http'); // 동적으로 클라이언트 선택

    const request = client.get(url, (response) => {
      let data = '';
      
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          // API 응답에 에러가 포함되어 있는지 확인
          if (jsonData?.response?.header?.resultCode && jsonData.response.header.resultCode !== '0000') {
            const errorMessage = jsonData.response.header.resultMsg || 'Unknown API Error';
            const errorCode = jsonData.response.header.resultCode;
            const returnAuthMsg = jsonData.response.header.returnAuthMsg;
            const fullError = `API Error: [${errorCode}] ${errorMessage} - ${returnAuthMsg || ''}`;
            console.error('Full API response error:', JSON.stringify(jsonData, null, 2));
            return reject(new Error(fullError)); // API 응답 자체에 에러가 있으면 reject
          }
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`JSON parse error or invalid API response format: ${error.message}. Received data: ${data.substring(0, 200)}...`));
        }
      });
    });
    
    request.on('error', reject); // 네트워크 에러 처리
    request.setTimeout(10000, () => { // 10초 타임아웃
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * 가져온 데이터를 JSON 파일로 저장합니다.
 * @param {string} type - 데이터 유형 (metro 또는 local).
 * @param {object} data - 저장할 데이터 객체.
 * @param {string} dateStr - 데이터 기준 날짜 (yyyyMMdd).
 */
async function saveData(type, data, dateStr) {
  const dataDir = path.join(__dirname, '..', 'data');
  
  // data 디렉토리가 없으면 생성 
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // 디렉토리가 이미 존재하는 경우 무시
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
  
  // 현재 데이터 파일 (최신 데이터) 저장
  const currentFile = path.join(dataDir, `${type}-current.json`);
  await fs.writeFile(currentFile, JSON.stringify(data, null, 2));
  
  // 날짜별 히스토리 파일 저장 (선택 사항, 필요 시 활성화)
  const historyFile = path.join(dataDir, `${type}-${dateStr}.json`);
  await fs.writeFile(historyFile, JSON.stringify(data, null, 2));
  
  console.log(`Saved ${type} data to ${currentFile} and ${historyFile}`);
}

/**
 * 지정된 시간(ms) 동안 대기합니다.
 * @param {number} ms - 대기할 시간 (밀리초).
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 스크립트 실행
fetchTourismData().catch(error => {
  console.error('Failed to fetch tourism data:', error);
  process.exit(1); // 에러 발생 시 스크립트 종료 코드 1로 설정
});
