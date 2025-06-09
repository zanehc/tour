// 전역 변수
let map;
let geojsonLayer;
let restAreaLayer;
let currentSelectedProvince = null;
let currentSelectedDistrict = null;
let sigunguGeoJsonData = null;
let restAreaData = null;
let previousSelectedLayer = null;

// 대한민국 시/도 및 시/군/구 데이터
const KOREA_ADMINISTRATIVE_DIVISIONS = {
    "서울특별시": { lat: 37.5665, lng: 126.9780, zoom: 11, districts: {
        "전체 (서울특별시)": { lat: 37.5665, lng: 126.9780, zoom: 11 },
        "강남구": { lat: 37.4979, lng: 127.0276, zoom: 13 },
        "종로구": { lat: 37.5735, lng: 126.9791, zoom: 13 },
        "마포구": { lat: 37.5601, lng: 126.9079, zoom: 13 },
        "영등포구": { lat: 37.5262, lng: 126.8964, zoom: 13 },
        "서초구": { lat: 37.4839, lng: 127.0329, zoom: 13 },
        "송파구": { lat: 37.5145, lng: 127.1030, zoom: 13 },
        "강서구": { lat: 37.5509, lng: 126.8496, zoom: 13 },
        "관악구": { lat: 37.4784, lng: 126.9517, zoom: 13 },
        "동대문구": { lat: 37.5744, lng: 127.0396, zoom: 13 },
        "성북구": { lat: 37.5894, lng: 127.0167, zoom: 13 },
        "중구": { lat: 37.5638, lng: 126.9976, zoom: 13 },
        "용산구": { lat: 37.5323, lng: 126.9902, zoom: 13 },
        "성동구": { lat: 37.5635, lng: 127.0366, zoom: 13 },
        "광진구": { lat: 37.5385, lng: 127.0826, zoom: 13 },
        "중랑구": { lat: 37.5976, lng: 127.0939, zoom: 13 },
        "도봉구": { lat: 37.6688, lng: 127.0471, zoom: 13 },
        "노원구": { lat: 37.6534, lng: 127.0569, zoom: 13 },
        "은평구": { lat: 37.6027, lng: 126.9328, zoom: 13 },
        "서대문구": { lat: 37.5794, lng: 126.9367, zoom: 13 },
        "양천구": { lat: 37.5173, lng: 126.8665, zoom: 13 },
        "구로구": { lat: 37.4954, lng: 126.8582, zoom: 13 },
        "금천구": { lat: 37.4578, lng: 126.8955, zoom: 13 },
        "동작구": { lat: 37.4988, lng: 126.9570, zoom: 13 },
        "강동구": { lat: 37.5300, lng: 127.1238, zoom: 13 }
    }},
    "부산광역시": { lat: 35.1796, lng: 129.0756, zoom: 11, districts: {
        "전체 (부산광역시)": { lat: 35.1796, lng: 129.0756, zoom: 11 },
        "중구": { lat: 35.1054, lng: 129.0322, zoom: 13 },
        "서구": { lat: 35.0970, lng: 129.0205, zoom: 13 },
        "동구": { lat: 35.1325, lng: 129.0435, zoom: 13 },
        "영도구": { lat: 35.0934, lng: 129.0715, zoom: 13 },
        "부산진구": { lat: 35.1848, lng: 129.0573, zoom: 13 },
        "동래구": { lat: 35.2026, lng: 129.0837, zoom: 13 },
        "남구": { lat: 35.1368, lng: 129.0886, zoom: 13 },
        "북구": { lat: 35.2120, lng: 129.0069, zoom: 13 },
        "해운대구": { lat: 35.1633, lng: 129.1648, zoom: 13 },
        "사하구": { lat: 35.0937, lng: 128.9897, zoom: 13 },
        "금정구": { lat: 35.2505, lng: 129.0911, zoom: 13 },
        "강서구": { lat: 35.1852, lng: 128.9567, zoom: 13 },
        "연제구": { lat: 35.1772, lng: 129.0792, zoom: 13 },
        "수영구": { lat: 35.1524, lng: 129.1171, zoom: 13 },
        "사상구": { lat: 35.1522, lng: 128.9877, zoom: 13 },
        "기장군": { lat: 35.2447, lng: 129.2312, zoom: 12 }
    }},
    "대구광역시": { lat: 35.8714, lng: 128.6014, zoom: 11, districts: {
        "전체 (대구광역시)": { lat: 35.8714, lng: 128.6014, zoom: 11 },
        "중구": { lat: 35.8681, lng: 128.5943, zoom: 13 },
        "동구": { lat: 35.8757, lng: 128.6917, zoom: 13 },
        "서구": { lat: 35.8601, lng: 128.5583, zoom: 13 },
        "남구": { lat: 35.8471, lng: 128.5901, zoom: 13 },
        "북구": { lat: 35.8885, lng: 128.5833, zoom: 13 },
        "수성구": { lat: 35.8457, lng: 128.6277, zoom: 13 },
        "달서구": { lat: 35.8519, lng: 128.5303, zoom: 13 },
        "달성군": { lat: 35.7951, lng: 128.4619, zoom: 12 }
    }},
    "인천광역시": { lat: 37.4563, lng: 126.7052, zoom: 11, districts: {
        "전체 (인천광역시)": { lat: 37.4563, lng: 126.7052, zoom: 11 },
        "중구": { lat: 37.4727, lng: 126.6200, zoom: 13 },
        "동구": { lat: 37.4770, lng: 126.6370, zoom: 13 },
        "미추홀구": { lat: 37.4600, lng: 126.6570, zoom: 13 },
        "연수구": { lat: 37.3995, lng: 126.6601, zoom: 13 },
        "남동구": { lat: 37.4093, lng: 126.7328, zoom: 13 },
        "부평구": { lat: 37.5085, lng: 126.7229, zoom: 13 },
        "계양구": { lat: 37.5450, lng: 126.7380, zoom: 13 },
        "서구": { lat: 37.5400, lng: 126.6670, zoom: 13 },
        "강화군": { lat: 37.7476, lng: 126.4172, zoom: 12 },
        "옹진군": { lat: 37.6047, lng: 125.8456, zoom: 10 }
    }},
    "광주광역시": { lat: 35.1595, lng: 126.8526, zoom: 11, districts: {
        "전체 (광주광역시)": { lat: 35.1595, lng: 126.8526, zoom: 11 },
        "동구": { lat: 35.1450, lng: 126.9200, zoom: 13 },
        "서구": { lat: 35.1500, lng: 126.8569, zoom: 13 },
        "남구": { lat: 35.1200, lng: 126.9000, zoom: 13 },
        "북구": { lat: 35.1824, lng: 126.9079, zoom: 13 },
        "광산구": { lat: 35.1500, lng: 126.7900, zoom: 13 }
    }},
    "대전광역시": { lat: 36.3504, lng: 127.3845, zoom: 11, districts: {
        "전체 (대전광역시)": { lat: 36.3504, lng: 127.3845, zoom: 11 },
        "동구": { lat: 36.3380, lng: 127.4330, zoom: 13 },
        "중구": { lat: 36.3260, lng: 127.4200, zoom: 13 },
        "서구": { lat: 36.3510, lng: 127.3870, zoom: 13 },
        "유성구": { lat: 36.3700, lng: 127.3500, zoom: 13 },
        "대덕구": { lat: 36.3900, lng: 127.4200, zoom: 13 }
    }},
    "울산광역시": { lat: 35.5384, lng: 129.3114, zoom: 11, districts: {
        "전체 (울산광역시)": { lat: 35.5384, lng: 129.3114, zoom: 11 },
        "중구": { lat: 35.5600, lng: 129.3370, zoom: 13 },
        "남구": { lat: 35.5390, lng: 129.3300, zoom: 13 },
        "동구": { lat: 35.4950, lng: 129.4100, zoom: 13 },
        "북구": { lat: 35.6000, lng: 129.3500, zoom: 13 },
        "울주군": { lat: 35.5600, lng: 129.2100, zoom: 12 }
    }},
    "세종특별자치시": { lat: 36.4800, lng: 127.2890, zoom: 11, districts: {
        "전체 (세종특별자치시)": { lat: 36.4800, lng: 127.2890, zoom: 11 }
    }},
    "경기도": { lat: 37.4138, lng: 127.5183, zoom: 9, districts: {
        "전체 (경기도)": { lat: 37.4138, lng: 127.5183, zoom: 9 },
        "수원시": { lat: 37.2871, lng: 127.0097, zoom: 12 },
        "고양시": { lat: 37.6580, lng: 126.8322, zoom: 12 },
        "용인시": { lat: 37.2410, lng: 127.1770, zoom: 12 },
        "성남시": { lat: 37.4190, lng: 127.1268, zoom: 12 },
        "화성시": { lat: 37.2000, lng: 126.8333, zoom: 12 },
        "안산시": { lat: 37.3175, lng: 126.8309, zoom: 12 },
        "부천시": { lat: 37.5030, lng: 126.7661, zoom: 12 },
        "남양주시": { lat: 37.6360, lng: 127.2180, zoom: 11 },
        "안양시": { lat: 37.3943, lng: 126.9568, zoom: 12 },
        "평택시": { lat: 36.9928, lng: 127.1082, zoom: 11 },
        "시흥시": { lat: 37.3800, lng: 126.8000, zoom: 12 },
        "파주시": { lat: 37.7600, lng: 126.7700, zoom: 11 },
        "의정부시": { lat: 37.7370, lng: 127.0490, zoom: 12 },
        "김포시": { lat: 37.6200, lng: 126.7100, zoom: 12 },
        "광주시": { lat: 37.4100, lng: 127.2600, zoom: 12 },
        "하남시": { lat: 37.5300, lng: 127.2700, zoom: 12 },
        "오산시": { lat: 37.1400, lng: 127.0700, zoom: 13 },
        "이천시": { lat: 37.2800, lng: 127.4400, zoom: 12 },
        "안성시": { lat: 37.0000, lng: 127.2700, zoom: 11 },
        "구리시": { lat: 37.5900, lng: 127.1400, zoom: 13 },
        "군포시": { lat: 37.3500, lng: 126.9400, zoom: 13 },
        "의왕시": { lat: 37.3400, lng: 127.0000, zoom: 13 },
        "양주시": { lat: 37.7800, lng: 127.0500, zoom: 12 },
        "포천시": { lat: 37.8900, lng: 127.2000, zoom: 11 },
        "동두천시": { lat: 37.9100, lng: 127.0600, zoom: 12 },
        "가평군": { lat: 37.8300, lng: 127.5100, zoom: 11 },
        "양평군": { lat: 37.4900, lng: 127.4900, zoom: 11 },
        "여주시": { lat: 37.3000, lng: 127.6300, zoom: 12 },
        "연천군": { lat: 38.0800, lng: 127.0700, zoom: 11 }
    }},
    "강원특별자치도": { lat: 37.8283, lng: 128.2815, zoom: 9, districts: {
        "전체 (강원특별자치도)": { lat: 37.8283, lng: 128.2815, zoom: 9 },
        "춘천시": { lat: 37.8813, lng: 127.7298, zoom: 12 },
        "강릉시": { lat: 37.7519, lng: 128.8761, zoom: 12 },
        "속초시": { lat: 38.2000, lng: 128.5917, zoom: 12 },
        "원주시": { lat: 37.3444, lng: 127.9200, zoom: 12 },
        "동해시": { lat: 37.5250, lng: 129.1170, zoom: 12 },
        "태백시": { lat: 37.1650, lng: 128.9870, zoom: 12 },
        "삼척시": { lat: 37.4470, lng: 129.1670, zoom: 12 },
        "홍천군": { lat: 37.6970, lng: 127.8800, zoom: 11 },
        "횡성군": { lat: 37.4970, lng: 127.9890, zoom: 12 },
        "영월군": { lat: 37.1850, lng: 128.4680, zoom: 11 },
        "평창군": { lat: 37.3700, lng: 128.3900, zoom: 11 },
        "정선군": { lat: 37.3870, lng: 128.6630, zoom: 11 },
        "철원군": { lat: 38.1400, lng: 127.3100, zoom: 11 },
        "화천군": { lat: 38.1000, lng: 127.4600, zoom: 11 },
        "양구군": { lat: 38.1000, lng: 127.5500, zoom: 12 },
        "인제군": { lat: 38.0600, lng: 128.1700, zoom: 11 },
        "고성군": { lat: 38.3700, lng: 128.4600, zoom: 11 },
        "양양군": { lat: 38.0700, lng: 128.6200, zoom: 12 }
    }},
    "충청북도": { lat: 36.6361, lng: 127.8100, zoom: 9, districts: {
        "전체 (충청북도)": { lat: 36.6361, lng: 127.8100, zoom: 9 },
        "청주시": { lat: 36.6433, lng: 127.4913, zoom: 12 },
        "충주시": { lat: 36.9912, lng: 127.9250, zoom: 12 },
        "제천시": { lat: 37.1326, lng: 128.1910, zoom: 12 },
        "보은군": { lat: 36.4800, lng: 127.7200, zoom: 12 },
        "옥천군": { lat: 36.3000, lng: 127.5800, zoom: 12 },
        "영동군": { lat: 36.1700, lng: 127.7800, zoom: 12 },
        "증평군": { lat: 36.7800, lng: 127.5800, zoom: 13 },
        "진천군": { lat: 36.8500, lng: 127.4300, zoom: 12 },
        "괴산군": { lat: 36.8100, lng: 127.8000, zoom: 11 },
        "음성군": { lat: 36.9400, lng: 127.6900, zoom: 12 },
        "단양군": { lat: 36.9800, lng: 128.3700, zoom: 11 }
    }},
    "충청남도": { lat: 36.5184, lng: 126.8000, zoom: 9, districts: {
        "전체 (충청남도)": { lat: 36.5184, lng: 126.8000, zoom: 9 },
        "천안시": { lat: 36.8140, lng: 127.1139, zoom: 12 },
        "공주시": { lat: 36.4500, lng: 127.1200, zoom: 12 },
        "보령시": { lat: 36.3300, lng: 126.6100, zoom: 11 },
        "아산시": { lat: 36.7871, lng: 127.0020, zoom: 12 },
        "서산시": { lat: 36.7800, lng: 126.4400, zoom: 12 },
        "논산시": { lat: 36.1900, lng: 127.1000, zoom: 12 },
        "계룡시": { lat: 36.2500, lng: 127.2400, zoom: 13 },
        "당진시": { lat: 36.8900, lng: 126.6300, zoom: 12 },
        "금산군": { lat: 36.1000, lng: 127.4900, zoom: 12 },
        "부여군": { lat: 36.2700, lng: 126.9200, zoom: 12 },
        "서천군": { lat: 36.0800, lng: 126.6900, zoom: 12 },
        "청양군": { lat: 36.3900, lng: 126.8000, zoom: 12 },
        "홍성군": { lat: 36.6000, lng: 126.6600, zoom: 12 },
        "예산군": { lat: 36.6700, lng: 126.8400, zoom: 12 },
        "태안군": { lat: 36.7500, lng: 126.3000, zoom: 11 }
    }},
    "전라북도": { lat: 35.7175, lng: 127.1530, zoom: 9, districts: {
        "전체 (전라북도)": { lat: 35.7175, lng: 127.1530, zoom: 9 },
        "전주시": { lat: 35.8200, lng: 127.1087, zoom: 12 },
        "군산시": { lat: 35.9904, lng: 126.7000, zoom: 12 },
        "익산시": { lat: 35.9400, lng: 126.9500, zoom: 12 },
        "정읍시": { lat: 35.5600, lng: 126.8500, zoom: 12 },
        "남원시": { lat: 35.4100, lng: 127.3900, zoom: 12 },
        "김제시": { lat: 35.8000, lng: 126.8900, zoom: 12 },
        "완주군": { lat: 35.8800, lng: 127.2000, zoom: 11 },
        "진안군": { lat: 35.7800, lng: 127.5500, zoom: 12 },
        "무주군": { lat: 36.0000, lng: 127.7000, zoom: 12 },
        "장수군": { lat: 35.6500, lng: 127.5300, zoom: 12 },
        "임실군": { lat: 35.6300, lng: 127.2700, zoom: 12 },
        "순창군": { lat: 35.3700, lng: 127.1300, zoom: 12 },
        "고창군": { lat: 35.4300, lng: 126.6900, zoom: 12 },
        "부안군": { lat: 35.7200, lng: 126.7300, zoom: 12 }
    }},
    "전라남도": { lat: 34.8679, lng: 126.9910, zoom: 9, districts: {
        "전체 (전라남도)": { lat: 34.8679, lng: 126.9910, zoom: 9 },
        "목포시": { lat: 34.7891, lng: 126.3980, zoom: 12 },
        "여수시": { lat: 34.7600, lng: 127.6600, zoom: 12 },
        "순천시": { lat: 34.9450, lng: 127.5020, zoom: 12 },
        "나주시": { lat: 34.9800, lng: 126.7100, zoom: 12 },
        "광양시": { lat: 34.9400, lng: 127.6900, zoom: 12 },
        "담양군": { lat: 35.3100, lng: 126.9800, zoom: 12 },
        "곡성군": { lat: 35.2800, lng: 127.2900, zoom: 12 },
        "구례군": { lat: 35.2000, lng: 127.4600, zoom: 12 },
        "고흥군": { lat: 34.6000, lng: 127.2800, zoom: 11 },
        "보성군": { lat: 34.7700, lng: 127.0800, zoom: 12 },
        "화순군": { lat: 35.0900, lng: 126.9700, zoom: 12 },
        "장흥군": { lat: 34.6800, lng: 126.8900, zoom: 12 },
        "강진군": { lat: 34.5900, lng: 126.7600, zoom: 12 },
        "해남군": { lat: 34.5700, lng: 126.5800, zoom: 11 },
        "영암군": { lat: 34.7800, lng: 126.6800, zoom: 12 },
        "무안군": { lat: 34.9900, lng: 126.4700, zoom: 12 },
        "함평군": { lat: 35.0700, lng: 126.5200, zoom: 12 },
        "영광군": { lat: 35.2700, lng: 126.5000, zoom: 12 },
        "장성군": { lat: 35.3000, lng: 126.7900, zoom: 12 },
        "완도군": { lat: 34.3100, lng: 126.7600, zoom: 11 },
        "진도군": { lat: 34.4800, lng: 126.2700, zoom: 11 },
        "신안군": { lat: 34.8000, lng: 126.0800, zoom: 10 }
    }},
    "경상북도": { lat: 36.5760, lng: 128.5050, zoom: 8, districts: {
        "전체 (경상북도)": { lat: 36.5760, lng: 128.5050, zoom: 8 },
        "포항시": { lat: 36.0312, lng: 129.3519, zoom: 12 },
        "경주시": { lat: 35.8562, lng: 129.2247, zoom: 12 },
        "김천시": { lat: 36.1100, lng: 128.1100, zoom: 12 },
        "안동시": { lat: 36.5700, lng: 128.7200, zoom: 12 },
        "구미시": { lat: 36.1100, lng: 128.3300, zoom: 12 },
        "영주시": { lat: 36.8100, lng: 128.6200, zoom: 12 },
        "영천시": { lat: 35.9700, lng: 128.9400, zoom: 12 },
        "상주시": { lat: 36.4100, lng: 128.1600, zoom: 12 },
        "문경시": { lat: 36.6000, lng: 128.2100, zoom: 12 },
        "경산시": { lat: 35.8200, lng: 128.7300, zoom: 12 },
        "군위군": { lat: 36.2400, lng: 128.5600, zoom: 12 },
        "의성군": { lat: 36.3600, lng: 128.6900, zoom: 11 },
        "청송군": { lat: 36.4300, lng: 129.0500, zoom: 11 },
        "영양군": { lat: 36.6600, lng: 129.2000, zoom: 11 },
        "영덕군": { lat: 36.3800, lng: 129.3500, zoom: 11 },
        "청도군": { lat: 35.6300, lng: 128.7300, zoom: 12 },
        "고령군": { lat: 35.7300, lng: 128.2800, zoom: 12 },
        "성주군": { lat: 35.9100, lng: 128.2800, zoom: 12 },
        "칠곡군": { lat: 36.0000, lng: 128.4000, zoom: 12 },
        "예천군": { lat: 36.6500, lng: 128.4500, zoom: 12 },
        "봉화군": { lat: 36.9000, lng: 128.9200, zoom: 11 },
        "울진군": { lat: 36.9900, lng: 129.4100, zoom: 11 },
        "울릉군": { lat: 37.4800, lng: 130.8600, zoom: 10 }
    }},
    "경상남도": { lat: 35.2598, lng: 128.6647, zoom: 9, districts: {
        "전체 (경상남도)": { lat: 35.2598, lng: 128.6647, zoom: 9 },
        "창원시": { lat: 35.2384, lng: 128.6925, zoom: 12 },
        "진주시": { lat: 35.1920, lng: 128.0964, zoom: 12 },
        "통영시": { lat: 34.8500, lng: 128.4200, zoom: 12 },
        "사천시": { lat: 34.9200, lng: 128.0400, zoom: 12 },
        "김해시": { lat: 35.2280, lng: 128.8820, zoom: 12 },
        "밀양시": { lat: 35.4900, lng: 128.7400, zoom: 12 },
        "거제시": { lat: 34.8800, lng: 128.6200, zoom: 11 },
        "양산시": { lat: 35.3300, lng: 129.0200, zoom: 12 },
        "의령군": { lat: 35.3400, lng: 128.2700, zoom: 12 },
        "함안군": { lat: 35.2800, lng: 128.4200, zoom: 12 },
        "창녕군": { lat: 35.5400, lng: 128.5000, zoom: 12 },
        "고성군": { lat: 34.9800, lng: 128.3200, zoom: 12 },
        "남해군": { lat: 34.8200, lng: 127.9200, zoom: 12 },
        "하동군": { lat: 35.0600, lng: 127.7500, zoom: 11 },
        "산청군": { lat: 35.4200, lng: 127.8700, zoom: 12 },
        "함양군": { lat: 35.5200, lng: 127.7200, zoom: 12 },
        "거창군": { lat: 35.6800, lng: 127.9300, zoom: 12 },
        "합천군": { lat: 35.5800, lng: 128.1700, zoom: 11 }
    }},
    "제주특별자치도": { lat: 33.4890, lng: 126.5219, zoom: 10, districts: {
        "전체 (제주특별자치도)": { lat: 33.4890, lng: 126.5219, zoom: 10 },
        "제주시": { lat: 33.5097, lng: 126.5219, zoom: 12 },
        "서귀포시": { lat: 33.2500, lng: 126.5600, zoom: 12 }
    }}
};

// 시군구 개수에 따른 동적 높이 계산
function calculateDistrictsContainerHeight(districtCount) {
    const allDistrictBtnHeight = 50;
    const buttonHeight = 34;
    const gap = 6;
    const padding = 16;
    const headerHeight = 37;
    const gridMarginTop = 8;
    
    const actualDistrictCount = Math.max(0, districtCount - 1);
    const rows = Math.ceil(actualDistrictCount / 3);
    const gridHeight = rows > 0 ? (rows * buttonHeight) + ((rows - 1) * gap) : 0;
    const contentHeight = allDistrictBtnHeight + gridMarginTop + gridHeight + padding;
    const totalHeight = headerHeight + contentHeight;
    
    return Math.max(totalHeight, 130);
}

// 시군구 버튼들을 그리드로 생성하는 함수
function createDistrictsGrid(provinceName, container) {
    const provinceInfo = KOREA_ADMINISTRATIVE_DIVISIONS[provinceName];
    if (!provinceInfo || !provinceInfo.districts) {
        return 0;
    }

    // 전체 버튼 먼저 생성
    const allDistrictBtn = document.createElement('button');
    allDistrictBtn.className = 'district-btn all-district';
    allDistrictBtn.innerHTML = `<i class="fas fa-map-marked-alt"></i> 전체 (${provinceName})`;
    allDistrictBtn.onclick = () => selectAllDistrict(provinceName);
    container.appendChild(allDistrictBtn);

    // 나머지 시군구들을 정렬하여 그리드 컨테이너에 추가
    const sortedDistricts = Object.keys(provinceInfo.districts)
        .filter(d => d !== `전체 (${provinceName})`)
        .sort();

    if (sortedDistricts.length > 0) {
        const gridContainer = document.createElement('div');
        gridContainer.className = 'districts-grid';
        
        sortedDistricts.forEach(districtName => {
            const districtBtn = document.createElement('button');
            districtBtn.className = 'district-btn';
            districtBtn.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${districtName}`;
            districtBtn.setAttribute('data-district', districtName);
            districtBtn.onclick = () => selectDistrict(provinceName, districtName);
            gridContainer.appendChild(districtBtn);
        });
        
        container.appendChild(gridContainer);
    }
    
    return sortedDistricts.length + 1;
}

// 모든 시군구 컨테이너를 강제로 숨기는 헬퍼 함수
function hideAllDistrictsContainers(caller = '') {
    const allDistrictsContainers = document.querySelectorAll('.row-districts-container');
    
    allDistrictsContainers.forEach((container) => {
        container.classList.remove('show');
        container.style.display = 'none';
        container.style.visibility = 'hidden';
    });
}

// 특정 시군구 컨테이너만 표시하는 헬퍼 함수
function showDistrictsContainer(rowIndex, caller = '') {
    const rowContainer = document.getElementById(`row-districts-${rowIndex}`);
    if (!rowContainer) {
        return false;
    }
    
    rowContainer.style.display = 'block';
    rowContainer.style.visibility = 'visible';
    rowContainer.classList.add('show');
    
    return true;
}

// 지도 초기화
function initializeMap() {
    try {
        if (map) { 
            map.remove(); 
        }
        
        map = L.map('map', {
            center: [36.5, 127.5],
            zoom: 7,
            zoomControl: false
        });
        
        L.control.zoom({
            position: 'topright'
        }).addTo(map);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 5
        }).addTo(map);
        
        geojsonLayer = L.layerGroup().addTo(map);
        restAreaLayer = L.layerGroup().addTo(map);
        
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 200);
        
        return true;
    } catch (error) {
        console.error('지도 초기화 실패:', error);
        showFloatingMessage('지도 초기화에 실패했습니다.', 'error');
        return false;
    }
}

// 사이드바 토글
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContainer = document.querySelector('.main-container');
    const toggleBtn = document.querySelector('.menu-toggle i');
    const isMobile = window.innerWidth <= 768;
    
    if (sidebar.classList.contains('closed')) {
        sidebar.classList.remove('closed');
        if (!isMobile) {
            mainContainer.classList.remove('sidebar-closed');
        }
        toggleBtn.classList.remove('fa-bars');
        toggleBtn.classList.add('fa-times');
    } else {
        sidebar.classList.add('closed');
        if (!isMobile) {
            mainContainer.classList.add('sidebar-closed');
        }
        toggleBtn.classList.remove('fa-times');
        toggleBtn.classList.add('fa-bars');
    }
    
    setTimeout(() => {
        if (map) {
            map.invalidateSize();
        }
    }, 350);
}

// 지도 클릭 핸들러 (사이드바 자동 닫기)
function handleMapClick() {
    const sidebar = document.getElementById('sidebar');
    const mainContainer = document.querySelector('.main-container');
    const toggleBtn = document.querySelector('.menu-toggle i');
    const isMobile = window.innerWidth <= 768;
    
    if (!sidebar.classList.contains('closed')) {
        sidebar.classList.add('closed');
        if (!isMobile) {
            mainContainer.classList.add('sidebar-closed');
        }
        toggleBtn.classList.remove('fa-times');
        toggleBtn.classList.add('fa-bars');
        
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 350);
    }
}

// 카테고리 섹션 토글
function toggleCategorySection(sectionId) {
    const content = document.getElementById(`${sectionId}-content`);
    const toggle = document.getElementById(`${sectionId}-toggle`);
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        toggle.classList.remove('collapsed');
    } else {
        content.classList.add('collapsed');
        toggle.classList.add('collapsed');
    }
}

// 내 위치로 이동
function moveToMyLocation() {
    const locationBtn = document.querySelector('.location-btn');
    locationBtn.disabled = true;
    locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    if (!navigator.geolocation) {
        showFloatingMessage('이 브라우저에서는 위치 서비스를 지원하지 않습니다.', 'error');
        resetLocationButton();
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            
            if (map) {
                map.setView([latitude, longitude], 15);
                
                // 경계만 클리어하고 테마 데이터는 유지
                clearBoundariesOnly();

                const currentLocationMarker = L.marker([latitude, longitude], {
                    icon: L.divIcon({
                        className: 'current-location-marker',
                        html: `
                            <div style="
                                background-color: #007bff; 
                                color: white; 
                                border-radius: 50%; 
                                width: 20px; 
                                height: 20px; 
                                display: flex; 
                                align-items: center; 
                                justify-content: center; 
                                border: 3px solid white; 
                                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            ">
                                <i class="fas fa-dot-circle" style="font-size: 8px;"></i>
                            </div>
                        `,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })
                });
                
                currentLocationMarker.addTo(map);
                currentLocationMarker.bindPopup('<div style="text-align: center; font-size: 12px;"><i class="fas fa-location-arrow"></i><br>현재 위치</div>');
                
                showFloatingMessage('현재 위치로 이동했습니다!', 'success', 3000);
            }
            resetLocationButton();
        },
        (error) => {
            let errorMessage = '위치를 가져올 수 없습니다.';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = '위치 권한이 거부되었습니다.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = '위치 정보를 사용할 수 없습니다.';
                    break;
                case error.TIMEOUT:
                    errorMessage = '위치 요청 시간이 초과되었습니다.';
                    break;
            }
            showFloatingMessage(errorMessage, 'error', 5000);
            resetLocationButton();
        }
    );
}

// 위치 버튼 초기화
function resetLocationButton() {
    const locationBtn = document.querySelector('.location-btn');
    if (locationBtn) {
        locationBtn.disabled = false;
        locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
    }
}

// 플로팅 메시지 표시
function showFloatingMessage(message, type = 'loading', duration = 5000) {
    const existingMsg = document.querySelector('.floating-message');
    if (existingMsg) existingMsg.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `floating-message ${type}`;
    
    if (type === 'loading') {
        messageDiv.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${message}`;
    } else if (type === 'error') {
        messageDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    } else if (type === 'success') {
        messageDiv.innerHTML = `<i class="fas fa-check"></i> ${message}`;
    }
    
    document.body.appendChild(messageDiv);
    
    if (type !== 'loading' && duration > 0) {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, duration);
    }
    
    return messageDiv;
}

// 로딩 스피너 표시
function showLoadingSpinner(message) {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.id = 'loadingSpinner';
    spinner.innerHTML = `
        <div class="spinner"></div>
        <div style="text-align: center; color: #666; font-size: 14px;">${message}</div>
    `;
    document.body.appendChild(spinner);
}

// 로딩 스피너 숨기기
function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.remove();
    }
}

// 창 크기 변경 처리
function handleResize() {
    window.addEventListener('resize', () => {
        if (map) {
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
        
        const sidebar = document.getElementById('sidebar');
        const mainContainer = document.querySelector('.main-container');
        const toggleBtn = document.querySelector('.menu-toggle i');
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            sidebar.classList.add('closed');
            mainContainer.classList.remove('sidebar-closed');
            toggleBtn.classList.remove('fa-times');
            toggleBtn.classList.add('fa-bars');
        } else {
            if (sidebar.classList.contains('closed')) {
                mainContainer.classList.add('sidebar-closed');
            } else {
                mainContainer.classList.remove('sidebar-closed');
            }
            toggleBtn.classList.remove('fa-times');
            toggleBtn.classList.add('fa-bars');
            if (!sidebar.classList.contains('closed')) {
                toggleBtn.classList.remove('fa-bars');
                toggleBtn.classList.add('fa-times');
            }
        }
    });
}

// 자동 위치 감지 및 시군구 줌인
async function autoDetectLocationAndZoom() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(false);
            return;
        }

        showFloatingMessage('📍 위치 기반 지역을 찾고 있습니다...', 'loading');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const nearestDistrict = findNearestDistrict(latitude, longitude);
                    
                    if (nearestDistrict) {
                        const { provinceName, districtName, distance } = nearestDistrict;
                        
                        const allRegions = ['전국', ...Object.keys(KOREA_ADMINISTRATIVE_DIVISIONS)];
                        const provinceIndex = allRegions.indexOf(provinceName);
                        const rowIndex = Math.floor(provinceIndex / 3);
                        
                        hideAllDistrictsContainers('autoDetectLocationAndZoom');
                        
                        selectProvince(provinceName, rowIndex);
                        
                        setTimeout(() => {
                            selectDistrict(provinceName, districtName);
                            showFloatingMessage(`📍 현재 위치 기반으로 ${provinceName} ${districtName}을(를) 표시했습니다.`, 'success', 4000);
                        }, 500);
                        
                        resolve(true);
                    } else {
                        showFloatingMessage('위치 기반 지역을 찾을 수 없어 전국 지도를 표시합니다.', 'success', 3000);
                        resolve(false);
                    }
                } catch (error) {
                    showFloatingMessage('위치 기반 지역을 찾을 수 없어 전국 지도를 표시합니다.', 'success', 3000);
                    resolve(false);
                }
            },
            (error) => {
                let message = '위치 접근이 거부되어 전국 지도를 표시합니다.';
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = '위치 권한이 거부되어 전국 지도를 표시합니다.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = '위치 정보를 사용할 수 없어 전국 지도를 표시합니다.';
                        break;
                    case error.TIMEOUT:
                        message = '위치 요청 시간이 초과되어 전국 지도를 표시합니다.';
                        break;
                }
                
                showFloatingMessage(message, 'success', 3000);
                resolve(false);
            },
            {
                timeout: 10000,
                enableHighAccuracy: false,
                maximumAge: 300000
            }
        );
    });
}

// 현재 위치에서 가장 가까운 시군구 찾기
function findNearestDistrict(lat, lng) {
    let nearest = null;
    let minDistance = Infinity;

    Object.entries(KOREA_ADMINISTRATIVE_DIVISIONS).forEach(([provinceName, provinceInfo]) => {
        if (provinceInfo.districts) {
            Object.entries(provinceInfo.districts).forEach(([districtName, districtInfo]) => {
                if (districtName.startsWith('전체 (')) return;
                
                const distance = calculateDistance(lat, lng, districtInfo.lat, districtInfo.lng);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = {
                        provinceName,
                        districtName,
                        distance
                    };
                }
            });
        }
    });

    return minDistance <= 100 ? nearest : null;
}

// 두 좌표 간의 거리 계산 (km)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
             Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// GeoJSON 데이터 로드
async function loadSigunguGeoJson() {
    showLoadingSpinner('행정구역 경계 데이터를 불러오는 중...');
    try {
        let geoJsonText;
        try {
            geoJsonText = await window.fs.readFile('sigun_boundraies.json', { encoding: 'utf8' });
        } catch (error) {
            throw new Error('행정구역 경계 파일을 읽을 수 없습니다.');
        }
        
        sigunguGeoJsonData = JSON.parse(geoJsonText);
        hideLoadingSpinner();
    } catch (error) {
        hideLoadingSpinner();
        showFloatingMessage('행정구역 경계 데이터를 불러오지 못했습니다.', 'error', 5000);
    }
}

// 휴게소 데이터 로드
async function loadRestAreaData() {
    try {
        showLoadingSpinner('휴게소 데이터를 불러오는 중...');
        
        let parsedData = null;
        let dataSource = '';
        
        try {
            const xlsxBuffer = await window.fs.readFile('data_ex.xlsx');
            console.log('XLSX 파일 크기:', xlsxBuffer.length, '바이트');
            parsedData = parseXLSXData(xlsxBuffer);
            dataSource = 'XLSX';
            console.log('XLSX 파싱 완료, 행 수:', parsedData.length);
        } catch (xlsxError) {
            console.warn('XLSX 파일 로드 실패:', xlsxError.message);
            try {
                const csvText = await window.fs.readFile('data_ex.csv', { encoding: 'utf8' });
                console.log('CSV 파일 크기:', csvText.length, '문자');
                parsedData = parseCSVData(csvText);
                dataSource = 'CSV';
                console.log('CSV 파싱 완료, 행 수:', parsedData.length);
            } catch (csvError) {
                console.warn('CSV 파일 로드 실패:', csvError.message);
                throw new Error('실제 데이터 파일을 찾을 수 없습니다.');
            }
        }
        
        restAreaData = [];
        let validCount = 0;
        let invalidCount = 0;
        let missingColumns = new Set();
        
        console.log('원본 데이터 샘플:', parsedData.slice(0, 3));
        
        parsedData.forEach((row, index) => {
            try {
                // 다양한 컬럼명 시도
                const lat = parseFloat(
                    row['위도'] || row['lat'] || row['latitude'] || 
                    row['Latitude'] || row['LAT'] || row['y'] || row['Y']
                );
                const lng = parseFloat(
                    row['경도'] || row['lng'] || row['longitude'] || 
                    row['Longitude'] || row['LNG'] || row['x'] || row['X']
                );
                
                if (isNaN(lat) || isNaN(lng)) {
                    invalidCount++;
                    if (index < 5) { // 처음 5개 행만 로깅
                        console.log(`행 ${index + 1} - 좌표 누락:`, {
                            availableKeys: Object.keys(row),
                            lat: row['위도'] || row['lat'] || row['latitude'],
                            lng: row['경도'] || row['lng'] || row['longitude']
                        });
                        Object.keys(row).forEach(key => missingColumns.add(key));
                    }
                    return;
                }
                
                if (lat < 33 || lat > 39 || lng < 124 || lng > 132) {
                    invalidCount++;
                    return;
                }
                
                const standardizedRow = {
                    '휴게소명': row['휴게소명'] || row['name'] || row['Name'] || row['명칭'] || `휴게소${index + 1}`,
                    '고속도로': row['고속도로'] || row['highway'] || row['Highway'] || row['도로명'] || '정보없음',
                    '위도': lat,
                    '경도': lng,
                    '휴게소종류': row['휴게소종류'] || row['type'] || row['Type'] || '일반형',
                    '운영시간': row['운영시간'] || row['hours'] || row['Hours'] || '24시간',
                    '방향': row['방향'] || row['direction'] || row['Direction'] || '정보없음',
                    '주요편의시설': row['주요편의시설'] || row['facilities'] || row['Facilities'] || '편의점',
                    '전화번호': row['전화번호'] || row['phone'] || row['Phone'] || '정보없음',
                    '데이터기준일': row['데이터기준일'] || row['date'] || row['Date'] || '2024-01-01',
                    '프랜차이즈매장': row['프랜차이즈매장'] || row['franchise'] || row['Franchise'] || ''
                };
                
                restAreaData.push(standardizedRow);
                validCount++;
                
            } catch (e) {
                invalidCount++;
                if (index < 5) {
                    console.warn(`행 ${index + 1} 파싱 에러:`, e.message);
                }
            }
        });

        hideLoadingSpinner();
        
        console.log('데이터 로드 결과:', {
            source: dataSource,
            total: parsedData.length,
            valid: validCount,
            invalid: invalidCount,
            availableColumns: Array.from(missingColumns).slice(0, 10)
        });
        
        if (restAreaData.length === 0) {
            throw new Error(`유효한 휴게소 데이터가 없습니다. 파일에서 발견된 컬럼: ${Array.from(missingColumns).slice(0, 5).join(', ')}`);
        }
        
        showFloatingMessage(`🎉 ${dataSource} 파일에서 휴게소 데이터 ${validCount}개를 성공적으로 로드했습니다!`, 'success', 4000);
        
    } catch (error) {
        hideLoadingSpinner();
        console.error('데이터 로드 에러:', error);
        
        const sampleData = getSampleRestAreaData();
        restAreaData = sampleData.map(row => ({
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
        
        showFloatingMessage(`⚠️ 실제 파일 데이터를 로드할 수 없어 샘플 데이터(${restAreaData.length}개)를 사용합니다. 에러: ${error.message}`, 'error', 7000);
    }
}

// 샘플 휴게소 데이터 생성
function getSampleRestAreaData() {
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
        },
        {
            '휴게소명': '금강휴게소',
            '고속도로': '경부고속도로',
            '위도': '36.4500',
            '경도': '127.3800',
            '휴게소종류': '일반형',
            '운영시간': '24시간',
            '방향': '부산방향',
            '주요편의시설': '주유소, 정비소, 화물차쉼터',
            '전화번호': '041-1234-5678',
            '데이터기준일': '2024-01-01',
            '프랜차이즈매장': '롯데리아, 투썸플레이스'
        },
        {
            '휴게소명': '안성휴게소',
            '고속도로': '경부고속도로',
            '위도': '37.0100',
            '경도': '127.2700',
            '휴게소종류': '일반형',
            '운영시간': '24시간',
            '방향': '서울방향',
            '주요편의시설': '주유소, 편의점, 음식점',
            '전화번호': '031-1234-5678',
            '데이터기준일': '2024-01-01',
            '프랜차이즈매장': '버거킹, 탐앤탐스'
        },
        {
            '휴게소명': '기흥휴게소',
            '고속도로': '영동고속도로',
            '위도': '37.2750',
            '경도': '127.1169',
            '휴게소종류': '일반형',
            '운영시간': '24시간',
            '방향': '강릉방향',
            '주요편의시설': '주유소, 정비소, 화물차쉼터',
            '전화번호': '031-2234-5678',
            '데이터기준일': '2024-01-01',
            '프랜차이즈매장': '맥도날드, 이디야커피'
        },
        {
            '휴게소명': '여주휴게소',
            '고속도로': '영동고속도로',
            '위도': '37.3000',
            '경도': '127.6300',
            '휴게소종류': '일반형',
            '운영시간': '24시간',
            '방향': '서울방향',
            '주요편의시설': '주유소, 편의점, 음식점',
            '전화번호': '031-3234-5678',
            '데이터기준일': '2024-01-01',
            '프랜차이즈매장': '롯데리아, 할리스커피'
        },
        {
            '휴게소명': '덕평휴게소',
            '고속도로': '영동고속도로',
            '위도': '37.3400',
            '경도': '127.4800',
            '휴게소종류': '일반형',
            '운영시간': '24시간',
            '방향': '강릉방향',
            '주요편의시설': '주유소, 정비소, 화물차쉼터',
            '전화번호': '031-4234-5678',
            '데이터기준일': '2024-01-01',
            '프랜차이즈매장': 'KFC, 공차'
        },
        {
            '휴게소명': '망향휴게소',
            '고속도로': '남해고속도로',
            '위도': '35.8200',
            '경도': '127.1500',
            '휴게소종류': '일반형',
            '운영시간': '24시간',
            '방향': '순천방향',
            '주요편의시설': '주유소, 편의점, 음식점',
            '전화번호': '063-1234-5678',
            '데이터기준일': '2024-01-01',
            '프랜차이즈매장': '버거킹, 스타벅스'
        },
        {
            '휴게소명': '함안휴게소',
            '고속도로': '남해고속도로',
            '위도': '35.2800',
            '경도': '128.4200',
            '휴게소종류': '일반형',
            '운영시간': '24시간',
            '방향': '부산방향',
            '주요편의시설': '주유소, 정비소, 화물차쉼터',
            '전화번호': '055-1234-5678',
            '데이터기준일': '2024-01-01',
            '프랜차이즈매장': '맥도날드, 파스쿠찌'
        },
        {
            '휴게소명': '통영휴게소',
            '고속도로': '남해고속도로',
            '위도': '34.8500',
            '경도': '128.4200',
            '휴게소종류': '일반형',
            '운영시간': '24시간',
            '방향': '통영방향',
            '주요편의시설': '주유소, 편의점, 음식점',
            '전화번호': '055-2234-5678',
            '데이터기준일': '2024-01-01',
            '프랜차이즈매장': '롯데리아, 카페베네'
        },
        {
            '휴게소명': '진영휴게소',
            '고속도로': '남해고속도로',
            '위도': '35.3200',
            '경도': '128.7800',
            '휴게소종류': '일반형',
            '운영시간': '24시간',
            '방향': '서울방향',
            '주요편의시설': '주유소, 정비소, 화물차쉼터',
            '전화번호': '055-3234-5678',
            '데이터기준일': '2024-01-01',
            '프랜차이즈매장': 'KFC, 엔젤리너스'
        },
        {
            '휴게소명': '춘천휴게소',
            '고속도로': '서울춘천고속도로',
            '위도': '37.8813',
            '경도': '127.7298',
            '휴게소종류': '일반형',
            '운영시간': '24시간',
            '방향': '춘천방향',
            '주요편의시설': '주유소, 편의점, 음식점',
            '전화번호': '033-1234-5678',
            '데이터기준일': '2024-01-01',
            '프랜차이즈매장': '버거킹, 투썸플레이스'
        },
        {
            '휴게소명': '마장휴게소',
            '고속도로': '서울춘천고속도로',
            '위도': '37.7500',
            '경도': '127.2000',
            '휴게소종류': '일반형',
            '운영시간': '24시간',
            '방향': '서울방향',
            '주요편의시설': '주유소, 정비소, 화물차쉼터',
            '전화번호': '031-5234-5678',
            '데이터기준일': '2024-01-01',
            '프랜차이즈매장': '맥도날드, 빽다방'
        },
        {
            '휴게소명': '강릉휴게소',
            '고속도로': '영동고속도로',
            '위도': '37.7519',
            '경도': '128.8761',
            '휴게소종류': '일반형',
            '운영시간': '24시간',
            '방향': '강릉방향',
            '주요편의시설': '주유소, 편의점, 음식점',
            '전화번호': '033-2234-5678',
            '데이터기준일': '2024-01-01',
            '프랜차이즈매장': '롯데리아, 이디야커피'
        },
        {
            '휴게소명': '부산휴게소',
            '고속도로': '경부고속도로',
            '위도': '35.1796',
            '경도': '129.0756',
            '휴게소종류': '일반형',
            '운영시간': '24시간',
            '방향': '부산방향',
            '주요편의시설': '주유소, 정비소, 화물차쉼터',
            '전화번호': '051-1234-5678',
            '데이터기준일': '2024-01-01',
            '프랜차이즈매장': 'KFC, 스타벅스, 파리바게뜨'
        }
    ];
}

// CSV 데이터 파싱 함수
function parseCSVData(csvText) {
    const result = [];
    const lines = csvText.split('\n');
    
    if (lines.length === 0) {
        throw new Error('CSV 파일이 비어있습니다.');
    }
    
    const headers = parseCSVLine(lines[0]);
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            try {
                const values = parseCSVLine(line);
                if (values.length >= Math.min(headers.length, 3)) {
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });
                    result.push(row);
                }
            } catch (e) {
                console.warn(`CSV 라인 ${i + 1} 파싱 실패:`, e.message);
            }
        }
    }
    
    return result;
}

// XLSX 데이터 파싱 함수 (강화된 버전)
function parseXLSXData(xlsxBuffer) {
    try {
        console.log('XLSX 파일 크기:', xlsxBuffer.length, '바이트');
        
        const workbook = XLSX.read(xlsxBuffer, { 
            type: 'array',
            cellStyles: true,
            cellFormulas: true,
            cellDates: true,
            cellNF: true,
            sheetStubs: true
        });
        
        console.log('워크북 시트 개수:', workbook.SheetNames.length);
        console.log('시트 이름들:', workbook.SheetNames);
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        console.log('시트 범위:', worksheet['!ref']);
        
        // 다양한 방법으로 데이터 추출 시도
        let jsonData = [];
        
        try {
            // 방법 1: 기본 방법
            jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                header: 1,
                defval: '',
                raw: false,
                dateNF: 'yyyy-mm-dd'
            });
            console.log('방법 1 성공: 총', jsonData.length, '행');
        } catch (e1) {
            console.warn('방법 1 실패:', e1.message);
            
            try {
                // 방법 2: 객체 형태로 직접
                jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                    defval: '',
                    raw: false
                });
                console.log('방법 2 성공: 총', jsonData.length, '행 (객체 형태)');
                
                // 객체를 배열로 변환
                if (jsonData.length > 0) {
                    const headers = Object.keys(jsonData[0]);
                    const arrayData = [headers];
                    jsonData.forEach(row => {
                        arrayData.push(headers.map(header => row[header] || ''));
                    });
                    jsonData = arrayData;
                }
            } catch (e2) {
                console.warn('방법 2 실패:', e2.message);
                
                // 방법 3: 수동 셀 읽기
                const range = XLSX.utils.decode_range(worksheet['!ref']);
                jsonData = [];
                for (let R = range.s.r; R <= range.e.r; ++R) {
                    const row = [];
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const cellAddress = XLSX.utils.encode_cell({c: C, r: R});
                        const cell = worksheet[cellAddress];
                        row.push(cell ? (cell.v || '') : '');
                    }
                    jsonData.push(row);
                }
                console.log('방법 3 성공: 총', jsonData.length, '행 (수동 읽기)');
            }
        }
        
        if (jsonData.length === 0) {
            throw new Error('데이터를 추출할 수 없습니다.');
        }
        
        console.log('첫 5행 데이터:');
        jsonData.slice(0, 5).forEach((row, index) => {
            console.log(`행 ${index + 1}:`, row);
        });
        
        // 헤더가 첫 번째 행인지 확인
        const headers = jsonData[0];
        console.log('헤더:', headers);
        
        // 객체 형태로 변환
        const result = [];
        for (let i = 1; i < jsonData.length; i++) {
            const row = {};
            headers.forEach((header, index) => {
                if (header) {
                    row[String(header).trim()] = jsonData[i][index] || '';
                }
            });
            result.push(row);
        }
        
        console.log('변환된 객체 개수:', result.length);
        if (result.length > 0) {
            console.log('첫 번째 객체:', result[0]);
            console.log('첫 번째 객체 키들:', Object.keys(result[0]));
        }
        
        return result;
        
    } catch (error) {
        console.error('XLSX 파싱 상세 에러:', error);
        throw new Error(`XLSX 파일 파싱 실패: ${error.message}`);
    }
}

// CSV 라인 파싱 함수
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
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
    return result;
}

// GeoJSON 레이어 기본 스타일
function defaultStyle() {
    return {
        fillColor: '#667eea',
        weight: 2,
        opacity: 0.8,
        color: '#4a5cbb',
        fillOpacity: 0.2
    };
}

// GeoJSON 레이어 선택 시 스타일
function selectedStyle() {
    return {
        fillColor: '#764ba2',
        color: '#764ba2',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.4
    };
}

// 시/도 목록 로드 (전국 버튼을 첫 줄에 포함)
function loadProvinces() {
    const containerDiv = document.getElementById('administrative-container');
    containerDiv.innerHTML = '';

    const allRegions = ['전국', ...Object.keys(KOREA_ADMINISTRATIVE_DIVISIONS)];
    const rowSize = 3;
    
    for (let i = 0; i < allRegions.length; i += rowSize) {
        const rowRegions = allRegions.slice(i, i + rowSize);
        const rowIndex = Math.floor(i / rowSize);
        
        const provinceRow = document.createElement('div');
        provinceRow.className = 'provinces-row';
        provinceRow.id = `province-row-${rowIndex}`;
        provinceRow.style.marginBottom = '0px';
        
        const rowButtons = document.createElement('div');
        rowButtons.className = 'provinces-row-buttons';
        
        rowRegions.forEach(regionName => {
            const regionBtn = document.createElement('button');
            regionBtn.className = 'province-btn';
            
            if (regionName === '전국') {
                regionBtn.innerHTML = '<i class="fas fa-globe"></i> 전국';
                regionBtn.classList.add('korea-btn');
                regionBtn.onclick = () => selectAdministrativeDivision('전국');
            } else {
                regionBtn.textContent = regionName;
                regionBtn.setAttribute('data-province', regionName);
                regionBtn.setAttribute('data-row', rowIndex);
                regionBtn.onclick = () => selectProvince(regionName, rowIndex);
            }
            
            rowButtons.appendChild(regionBtn);
        });
        
        const hasProvinces = rowRegions.some(region => region !== '전국');
        if (hasProvinces) {
            const rowDistrictsContainer = document.createElement('div');
            rowDistrictsContainer.className = 'row-districts-container';
            rowDistrictsContainer.id = `row-districts-${rowIndex}`;
            
            const districtsHeader = document.createElement('div');
            districtsHeader.className = 'row-districts-header';
            districtsHeader.id = `row-districts-header-${rowIndex}`;
            
            const districtsContent = document.createElement('div');
            districtsContent.className = 'row-districts-content';
            districtsContent.id = `row-districts-content-${rowIndex}`;
            
            rowDistrictsContainer.appendChild(districtsHeader);
            rowDistrictsContainer.appendChild(districtsContent);
            provinceRow.appendChild(rowButtons);
            provinceRow.appendChild(rowDistrictsContainer);
        } else {
            provinceRow.appendChild(rowButtons);
        }
        
        containerDiv.appendChild(provinceRow);
    }
}

// 모든 시도 행의 마진을 기본값으로 리셋 (0px)
function resetAllProvinceRowMargins() {
    document.querySelectorAll('.provinces-row').forEach(row => {
        row.style.marginBottom = '0px';
    });
}

// 테마 지도 상태 관리
const themeStates = {
    restarea: true,
    restaurant: false,
    hotel: false,
    academy: false,
    festival: false,
    hotplace: false,
    kids: false
};

// 테마 토글 함수
function toggleTheme(themeType) {
    themeStates[themeType] = !themeStates[themeType];
    
    const toggleElement = document.getElementById(`theme-${themeType}`);
    if (themeStates[themeType]) {
        toggleElement.classList.add('active');
    } else {
        toggleElement.classList.remove('active');
    }
    
    switch(themeType) {
        case 'restarea':
            if (themeStates[themeType]) {
                showRestAreas();
            } else {
                hideRestAreas();
            }
            break;
        case 'restaurant':
            if (themeStates[themeType]) {
                showComingSoon('맛집');
            }
            break;
        case 'hotel':
            if (themeStates[themeType]) {
                showComingSoon('숙박');
            }
            break;
        case 'academy':
            if (themeStates[themeType]) {
                showComingSoon('학원');
            }
            break;
        case 'festival':
            if (themeStates[themeType]) {
                showComingSoon('축제');
            }
            break;
        case 'hotplace':
            if (themeStates[themeType]) {
                showComingSoon('핫플');
            }
            break;
        case 'kids':
            if (themeStates[themeType]) {
                showComingSoon('어린이');
            }
            break;
    }
    
    updateMapDisplay();
}

// 준비 중 메시지
function showComingSoon(themeName) {
    showFloatingMessage(`🚧 ${themeName || '해당'} 테마는 준비 중입니다. 곧 서비스될 예정이에요!`, 'success', 3000);
}

// 휴게소 숨기기
function hideRestAreas() {
    if (restAreaLayer) {
        restAreaLayer.clearLayers();
        updateCurrentCategoryDisplay('지도 영역을 선택해주세요');
    }
}

// 지도 표시 업데이트 (테마 상태에 따른)
function updateMapDisplay() {
    const activeThemes = Object.keys(themeStates).filter(theme => themeStates[theme]);
    
    let locationText = '';
    if (currentSelectedProvince && currentSelectedDistrict) {
        locationText = `${currentSelectedProvince} ${currentSelectedDistrict}`;
    } else if (currentSelectedProvince) {
        locationText = currentSelectedProvince;
    } else {
        locationText = '전국';
    }
    
    if (activeThemes.length === 0) {
        updateCurrentCategoryDisplay(`지도 영역: ${locationText}`);
    } else if (activeThemes.length === 1) {
        const themeNames = {
            restarea: '고속도로 휴게소',
            restaurant: '맛집',
            hotel: '숙박',
            academy: '학원',
            festival: '축제',
            hotplace: '핫플',
            kids: '어린이시설'
        };
        const themeName = themeNames[activeThemes[0]];
        if (activeThemes[0] === 'restarea' && restAreaData) {
            updateCurrentCategoryDisplay(`${themeName} (${restAreaData.length}개) - ${locationText}`);
        } else {
            updateCurrentCategoryDisplay(`${themeName} - ${locationText}`);
        }
    } else {
        updateCurrentCategoryDisplay(`${activeThemes.length}개 테마 활성화 - ${locationText}`);
    }
}

// 지도상의 모든 GeoJSON 경계 및 마커 클리어
function clearMapAndBoundaries() {
    if (geojsonLayer) {
        geojsonLayer.clearLayers();
    }
    if (restAreaLayer) {
        restAreaLayer.clearLayers();
    }
    if (previousSelectedLayer) {
        previousSelectedLayer.setStyle(defaultStyle());
        previousSelectedLayer = null;
    }
}

// 행정구역 경계만 클리어 (테마 데이터는 유지)
function clearBoundariesOnly() {
    if (geojsonLayer) {
        geojsonLayer.clearLayers();
    }
    if (previousSelectedLayer) {
        previousSelectedLayer.setStyle(defaultStyle());
        previousSelectedLayer = null;
    }
}

// 시/도 선택 (테마 상태 유지)
function selectProvince(provinceName, rowIndex) {
    if (provinceName === '전국') {
        selectAdministrativeDivision('전국');
        return;
    }
    
    document.querySelectorAll('.province-btn, .district-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    hideAllDistrictsContainers('selectProvince');
    resetAllProvinceRowMargins();

    const selectedProvinceBtn = document.querySelector(`[data-province="${provinceName}"][data-row="${rowIndex}"]`);
    if (selectedProvinceBtn) {
        selectedProvinceBtn.classList.add('active');
    }

    currentSelectedProvince = provinceName;
    currentSelectedDistrict = null;

    const districtsHeader = document.getElementById(`row-districts-header-${rowIndex}`);
    const districtsContent = document.getElementById(`row-districts-content-${rowIndex}`);
    const districtsContainer = document.getElementById(`row-districts-${rowIndex}`);
    
    if (!districtsHeader || !districtsContent || !districtsContainer) {
        return;
    }
    
    districtsHeader.innerHTML = `<i class="fas fa-map-marked-alt"></i> ${provinceName} 시군구`;
    districtsContent.innerHTML = '';
    
    const districtCount = createDistrictsGrid(provinceName, districtsContent);
    const dynamicHeight = calculateDistrictsContainerHeight(districtCount);
    districtsContainer.style.minHeight = `${dynamicHeight}px`;
    
    showDistrictsContainer(rowIndex, 'selectProvince');

    setTimeout(() => {
        const rowContainer = document.getElementById(`row-districts-${rowIndex}`);
        if (rowContainer) {
            rowContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, 300);

    // 경계만 변경하고 테마 데이터는 유지
    clearBoundariesOnly();
    displayAllDistrictsBoundaryForProvince(provinceName);
    
    // 테마 상태에 따라 지도 표시 업데이트
    const activeThemes = Object.keys(themeStates).filter(theme => themeStates[theme]);
    if (activeThemes.length > 0) {
        updateMapDisplay();
    } else {
        updateCurrentCategoryDisplay(`선택된 시도: ${provinceName} (시군구를 선택해주세요)`);
    }
}

// 시/군/구 선택 (해당 시군구로 줌인)
function selectDistrict(provinceName, districtName) {
    document.querySelectorAll('.province-btn, .district-btn, .category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const selectedProvinceBtn = document.querySelector(`[data-province="${provinceName}"]`);
    if (selectedProvinceBtn) {
        selectedProvinceBtn.classList.add('active');
    }
    
    const selectedDistrictBtn = document.querySelector(`[data-district="${districtName}"]`);
    if (selectedDistrictBtn) {
        selectedDistrictBtn.classList.add('active');
    }
    
    currentSelectedDistrict = districtName;

    const provinceInfo = KOREA_ADMINISTRATIVE_DIVISIONS[provinceName];
    if (provinceInfo && provinceInfo.districts && provinceInfo.districts[districtName]) {
        const districtInfo = provinceInfo.districts[districtName];
        map.setView([districtInfo.lat, districtInfo.lng], districtInfo.zoom);
    }
    
    // 경계만 변경하고 테마 데이터는 유지
    clearBoundariesOnly();
    displaySigunguBoundary(provinceName, districtName);
    
    // 테마 상태에 따라 지도 표시 업데이트
    const activeThemes = Object.keys(themeStates).filter(theme => themeStates[theme]);
    if (activeThemes.length > 0) {
        updateMapDisplay();
    } else {
        updateCurrentCategoryDisplay(`지도 영역: ${provinceName} ${districtName}`);
    }
}

// '전체 (시도명)' 버튼 클릭 시
function selectAllDistrict(provinceName) {
    document.querySelectorAll('.province-btn, .district-btn, .category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const selectedProvinceBtn = document.querySelector(`[data-province="${provinceName}"]`);
    if (selectedProvinceBtn) {
        selectedProvinceBtn.classList.add('active');
    }
    
    const activeContainer = document.querySelector('.row-districts-container.show');
    if (activeContainer) {
        const allDistrictBtn = activeContainer.querySelector('.all-district');
        if (allDistrictBtn) {
            allDistrictBtn.classList.add('active');
        }
    }
    
    currentSelectedDistrict = null;

    const provinceInfo = KOREA_ADMINISTRATIVE_DIVISIONS[provinceName];
    if (provinceInfo) {
        map.setView([provinceInfo.lat, provinceInfo.lng], provinceInfo.zoom);
    }
    
    // 경계만 변경하고 테마 데이터는 유지
    clearBoundariesOnly();
    displayAllDistrictsBoundaryForProvince(provinceName);
    
    // 테마 상태에 따라 지도 표시 업데이트
    const activeThemes = Object.keys(themeStates).filter(theme => themeStates[theme]);
    if (activeThemes.length > 0) {
        updateMapDisplay();
    } else {
        updateCurrentCategoryDisplay(`지도 영역: ${provinceName}`);
    }
}

// 지도 오버레이 텍스트 업데이트
function updateCurrentCategoryDisplay(text) {
    document.getElementById('currentCategoryDisplay').innerHTML = text;
}

// 전국 선택 (마진 리셋)
function selectAdministrativeDivision(region) {
    document.querySelectorAll('.province-btn, .district-btn, .category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    hideAllDistrictsContainers('selectAdministrativeDivision');
    resetAllProvinceRowMargins();

    const allKoreaBtns = document.querySelectorAll('.province-btn');
    allKoreaBtns.forEach(btn => {
        if (btn.textContent.includes('전국')) {
            btn.classList.add('active');
        }
    });

    currentSelectedProvince = null;
    currentSelectedDistrict = null;

    map.setView([36.5, 127.5], 7);
    
    // 경계만 변경하고 테마 데이터는 유지
    clearBoundariesOnly();
    displayAllProvincesBoundary();
    
    // 테마 상태에 따라 지도 표시 업데이트
    const activeThemes = Object.keys(themeStates).filter(theme => themeStates[theme]);
    if (activeThemes.length > 0) {
        updateMapDisplay();
    } else {
        updateCurrentCategoryDisplay(`지도 영역: ${region}`);
    }
}

// 선택된 시군구의 경계 표시
function displaySigunguBoundary(provinceName, districtName) {
    // 경계만 클리어 (테마 데이터 유지)
    clearBoundariesOnly();

    if (!sigunguGeoJsonData) {
        return;
    }

    const targetFeature = sigunguGeoJsonData.features.find(feature => {
        return feature.properties && 
               feature.properties.CTP_KOR_NM === provinceName && 
               feature.properties.SIG_KOR_NM === districtName;
    });

    if (targetFeature) {
        const layer = L.geoJSON(targetFeature, {
            style: function(feature) {
                return selectedStyle();
            },
            onEachFeature: function(feature, layer) {
                const popupContent = `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 5px; text-align: center;">
                        <strong style="font-size: 14px; color: #764ba2;">${feature.properties.CTP_KOR_NM} ${feature.properties.SIG_KOR_NM}</strong>
                    </div>
                `;
                layer.bindPopup(popupContent);
            }
        }).addTo(geojsonLayer);

        if (layer.getBounds().isValid()) {
            map.fitBounds(layer.getBounds().pad(0.05));
        }
        
        previousSelectedLayer = layer;
    }
}

// 특정 시도 모든 시군구 경계 표시
function displayAllDistrictsBoundaryForProvince(provinceName) {
    // 경계만 클리어 (테마 데이터 유지)
    clearBoundariesOnly();

    if (!sigunguGeoJsonData) {
        return;
    }

    const featuresInProvince = sigunguGeoJsonData.features.filter(feature => {
        return feature.properties && feature.properties.CTP_KOR_NM === provinceName;
    });

    if (featuresInProvince.length > 0) {
        L.geoJSON(featuresInProvince, {
            style: function(feature) {
                return defaultStyle();
            },
            onEachFeature: function(feature, layer) {
                const popupContent = `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 5px; text-align: center;">
                        <strong style="font-size: 12px; color: #4a5cbb;">${feature.properties.CTP_KOR_NM} ${feature.properties.SIG_KOR_NM}</strong>
                    </div>
                `;
                layer.bindPopup(popupContent);
            }
        }).addTo(geojsonLayer);

        const provinceInfo = KOREA_ADMINISTRATIVE_DIVISIONS[provinceName];
        if (provinceInfo) {
            map.setView([provinceInfo.lat, provinceInfo.lng], provinceInfo.zoom);
        }
    }
}

// 전국 모든 시도 경계 표시
function displayAllProvincesBoundary() {
    // 경계만 클리어 (테마 데이터 유지)
    clearBoundariesOnly();

    if (!sigunguGeoJsonData) {
        return;
    }
    
    L.geoJSON(sigunguGeoJsonData, {
        style: function(feature) {
            return defaultStyle();
        },
        onEachFeature: function(feature, layer) {
            const popupContent = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 5px; text-align: center;">
                    <strong style="font-size: 12px; color: #4a5cbb;">${feature.properties.CTP_KOR_NM} ${feature.properties.SIG_KOR_NM}</strong>
                </div>
            `;
            layer.bindPopup(popupContent);
        }
    }).addTo(geojsonLayer);
}

// 휴게소 표시 (실제 데이터 기반 개선)
function showRestAreas() {
    if (!restAreaData || !Array.isArray(restAreaData) || restAreaData.length === 0) {
        const errorMsg = !restAreaData ? 
            '휴게소 데이터가 로드되지 않았습니다.' : 
            `휴게소 데이터가 비어있습니다.`;
        
        showFloatingMessage(`${errorMsg} data_ex.xlsx 파일이 올바른 위치에 있는지 확인해주세요.`, 'error', 7000);
        return;
    }

    document.querySelectorAll('.province-btn, .district-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    hideAllDistrictsContainers('showRestAreas');
    resetAllProvinceRowMargins();

    clearMapAndBoundaries();
    
    map.setView([36.5, 127.5], 7);
    updateCurrentCategoryDisplay(`고속도로 휴게소 (${restAreaData.length}개)`);

    showLoadingSpinner(`${restAreaData.length}개 휴게소 마커를 생성하는 중...`);

    let successCount = 0;
    let errorCount = 0;
    const processedHighways = new Set();
    
    restAreaData.forEach((restArea, index) => {
        try {
            const lat = restArea['위도'];
            const lng = restArea['경도'];
            
            if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
                errorCount++;
                return;
            }
            
            let markerIcon = 'fas fa-coffee';
            let markerColor = '#28a745';
            
            const restAreaType = restArea['휴게소종류'] || '';
            if (restAreaType.includes('간이')) {
                markerIcon = 'fas fa-store';
                markerColor = '#ffc107';
            }
            
            const marker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'rest-area-marker',
                    html: `<i class="${markerIcon}" style="color: white;"></i>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            });

            marker.on('add', function() {
                const markerElement = marker.getElement();
                if (markerElement) {
                    markerElement.style.backgroundColor = markerColor;
                }
            });

            const popupContent = createRestAreaPopup(restArea);
            marker.bindPopup(popupContent, {
                className: 'custom-popup',
                maxWidth: 320,
                minWidth: 280
            });

            marker.addTo(restAreaLayer);
            successCount++;
            
            if (restArea['고속도로']) {
                processedHighways.add(restArea['고속도로']);
            }
            
        } catch (error) {
            errorCount++;
        }
    });

    hideLoadingSpinner();
    
    const highwayList = Array.from(processedHighways).sort();
    
    if (successCount > 0) {
        const message = errorCount > 0 
            ? `${successCount}개 휴게소 표시 완료 (${errorCount}개 오류)`
            : `🎉 전국 ${successCount}개 휴게소를 지도에 표시했습니다!`;
        
        showFloatingMessage(message, 'success', 5000);
    } else {
        showFloatingMessage('❌ 표시할 수 있는 휴게소가 없습니다. 데이터를 확인해주세요.', 'error', 5000);
    }
}

// 휴게소 팝업 내용 생성 (실제 데이터 기반 개선)
function createRestAreaPopup(restArea) {
    let franchiseHtml = '';
    if (restArea['프랜차이즈매장'] && restArea['프랜차이즈매장'].trim() !== '') {
        let franchiseText = restArea['프랜차이즈매장']
            .replace(/^["']|["']$/g, '')
            .replace(/["']/g, '');
        
        const franchises = franchiseText
            .split(/[,;\/]/)
            .map(f => f.trim())
            .filter(f => f !== '' && f !== '-' && f !== '없음');
        
        if (franchises.length > 0) {
            franchiseHtml = `
                <div class="popup-row">
                    <div class="popup-label">매장:</div>
                    <div class="popup-value">
                        <div class="franchise-list">
                            ${franchises.map(franchise => `<span class="franchise-item">${franchise}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
    }

    let facilitiesText = restArea['주요편의시설'] || '';
    if (facilitiesText) {
        facilitiesText = facilitiesText.replace(/^["']|["']$/g, '').replace(/["']/g, '');
    }

    let operatingHours = restArea['운영시간'] || '정보없음';
    if (operatingHours === '00:00-23:59') {
        operatingHours = '24시간 운영';
    }

    let typeIcon = 'fas fa-coffee';
    const restAreaType = restArea['휴게소종류'] || '';
    if (restAreaType.includes('일반')) {
        typeIcon = 'fas fa-coffee';
    } else if (restAreaType.includes('간이')) {
        typeIcon = 'fas fa-store';
    }

    let directionColor = '#28a745';
    const direction = restArea['방향'] || '';
    if (direction.includes('서울') || direction.includes('인천')) {
        directionColor = '#007bff';
    } else if (direction.includes('부산') || direction.includes('대구')) {
        directionColor = '#dc3545';
    }

    return `
        <div>
            <div class="popup-header">
                <i class="${typeIcon}"></i> ${restArea['휴게소명'] || '정보없음'}
            </div>
            <div class="popup-content">
                <div class="popup-row">
                    <div class="popup-label">고속도로:</div>
                    <div class="popup-value"><strong>${restArea['고속도로'] || '정보없음'}</strong></div>
                </div>
                <div class="popup-row">
                    <div class="popup-label">방향:</div>
                    <div class="popup-value" style="color: ${directionColor}; font-weight: 600;">
                        <i class="fas fa-arrow-right"></i> ${restArea['방향'] || '정보없음'}
                    </div>
                </div>
                <div class="popup-row">
                    <div class="popup-label">종류:</div>
                    <div class="popup-value">${restArea['휴게소종류'] || '정보없음'}</div>
                </div>
                <div class="popup-row">
                    <div class="popup-label">운영시간:</div>
                    <div class="popup-value"><i class="fas fa-clock"></i> ${operatingHours}</div>
                </div>
                ${franchiseHtml}
                ${facilitiesText && facilitiesText !== '정보없음' ? `
                <div class="popup-row">
                    <div class="popup-label">편의시설:</div>
                    <div class="popup-value"><i class="fas fa-concierge-bell"></i> ${facilitiesText}</div>
                </div>
                ` : ''}
                ${restArea['전화번호'] && restArea['전화번호'] !== '문의 필요' && restArea['전화번호'] !== '정보없음' ? `
                <div class="popup-row">
                    <div class="popup-label">전화:</div>
                    <div class="popup-value"><i class="fas fa-phone"></i> ${restArea['전화번호']}</div>
                </div>
                ` : ''}
                ${restArea['데이터기준일'] ? `
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-size: 10px; color: #999; text-align: center;">
                    데이터 기준일: ${restArea['데이터기준일']}
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async function() {
    if (typeof L === 'undefined') {
        showFloatingMessage('지도 라이브러리 로딩 실패. 페이지를 새로고침해 주세요.', 'error');
        return;
    }
    
    if (!initializeMap()) {
        return;
    }
    
    handleResize();
    loadProvinces();
    
    const loadingPromises = [
        loadSigunguGeoJson(),
        loadRestAreaData()
    ];
    
    await Promise.all(loadingPromises);
    
    if (!restAreaData || restAreaData.length === 0) {
        console.warn('⚠️ 휴게소 데이터가 제대로 로드되지 않았습니다.');
    }

    try {
        const locationDetected = await autoDetectLocationAndZoom();
        if (!locationDetected) {
            selectAdministrativeDivision('전국');
        }
    } catch (error) {
        selectAdministrativeDivision('전국');
    }

    if (themeStates.restarea && restAreaData && restAreaData.length > 0) {
        showRestAreas();
    }

    showFloatingMessage('😊 좋아할지도에 오신 것을 환영합니다! 테마를 선택하거나 행정구역을 선택해주세요.', 'success', 4000);
    
    if (window.innerWidth <= 768) {
        toggleSidebar(); 
    }
});
