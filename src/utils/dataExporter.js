import { EXPORT_FORMATS } from './constants';
import { getFromStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from './constants';

/**
 * 데이터를 JSON 형식으로 내보내기
 */
export function exportToJSON(data, filename = 'danta-trader-data') {
  const jsonString = JSON.stringify(data, null, 2);
  downloadFile(jsonString, `${filename}.json`, 'application/json');
}

/**
 * 데이터를 CSV 형식으로 내보내기
 */
export function exportToCSV(data, filename = 'danta-trader-data') {
  if (!Array.isArray(data) || data.length === 0) {
    alert('내보낼 데이터가 없습니다.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // CSV에서 쉼표와 따옴표 처리
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

/**
 * 태블로용 데이터 형식으로 내보내기
 */
export function exportToTableau(filename = 'danta-trader-tableau-data') {
  const allData = gatherAllAppData();
  
  // 태블로가 이해하기 쉬운 플랫 구조로 변환
  const tableauData = flattenDataForTableau(allData);
  
  // JSON과 CSV 둘 다 생성
  exportToJSON(tableauData, `${filename}-full`);
  
  if (tableauData.emotions && tableauData.emotions.length > 0) {
    exportToCSV(tableauData.emotions, `${filename}-emotions`);
  }
  
  if (tableauData.memos && tableauData.memos.length > 0) {
    exportToCSV(tableauData.memos, `${filename}-memos`);
  }

  if (tableauData.analysis && tableauData.analysis.length > 0) {
    exportToCSV(tableauData.analysis, `${filename}-analysis`);
  }
}

/**
 * 앱의 모든 데이터를 수집
 */
function gatherAllAppData() {
  const emotions = getFromStorage(STORAGE_KEYS.EMOTIONS, []);
  const memos = getFromStorage(STORAGE_KEYS.MEMOS, {});
  const dashboardConfig = getFromStorage(STORAGE_KEYS.DASHBOARD_CONFIG, []);
  
  return {
    emotions,
    memos,
    dashboardConfig,
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  };
}

/**
 * 데이터를 태블로 분석에 적합한 플랫 구조로 변환
 */
function flattenDataForTableau(data) {
  const result = {
    emotions: [],
    memos: [],
    analysis: []
  };

  // 감정 데이터 플래튼
  if (data.emotions && Array.isArray(data.emotions)) {
    result.emotions = data.emotions.map((emotion, index) => ({
      id: index + 1,
      emotion_type: emotion.type || '알 수 없음',
      timestamp: emotion.timestamp || new Date().toISOString(),
      date: emotion.timestamp ? new Date(emotion.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      time: emotion.timestamp ? new Date(emotion.timestamp).toTimeString().split(' ')[0] : new Date().toTimeString().split(' ')[0],
      stock: emotion.stock || '알 수 없음',
      notes: emotion.notes || ''
    }));
  }

  // 메모 데이터 플래튼
  Object.keys(data.memos || {}).forEach(stock => {
    if (Array.isArray(data.memos[stock])) {
      data.memos[stock].forEach((memo, index) => {
        result.memos.push({
          id: `${stock}-${index + 1}`,
          stock: stock,
          memo_type: memo.type || 'ANALYSIS',
          content: memo.text || memo.content || '',
          tags: Array.isArray(memo.tags) ? memo.tags.join(';') : '',
          timestamp: memo.time || new Date().toISOString(),
          date: memo.time ? new Date(memo.time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          price: memo.price || null
        });
      });
    }
  });

  // 분석 데이터 생성 (감정과 메모를 조합)
  const analysisData = [];
  
  // 날짜별 감정 분석
  const emotionsByDate = result.emotions.reduce((acc, emotion) => {
    const date = emotion.date;
    if (!acc[date]) {
      acc[date] = { positive: 0, negative: 0, neutral: 0, total: 0 };
    }
    
    if (['happy', 'excited', 'love', 'laughing'].includes(emotion.emotion_type)) {
      acc[date].positive++;
    } else if (['worried', 'sad', 'angry', 'disappointed'].includes(emotion.emotion_type)) {
      acc[date].negative++;
    } else {
      acc[date].neutral++;
    }
    acc[date].total++;
    
    return acc;
  }, {});

  Object.keys(emotionsByDate).forEach(date => {
    const data = emotionsByDate[date];
    analysisData.push({
      date: date,
      metric_type: 'emotion_distribution',
      positive_ratio: (data.positive / data.total * 100).toFixed(2),
      negative_ratio: (data.negative / data.total * 100).toFixed(2),
      neutral_ratio: (data.neutral / data.total * 100).toFixed(2),
      total_emotions: data.total
    });
  });

  result.analysis = analysisData;

  return result;
}

/**
 * 파일 다운로드 헬퍼
 */
function downloadFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * 태블로 연결을 위한 웹 데이터 커넥터 생성
 */
export function generateTableauWebDataConnector() {
  const data = gatherAllAppData();
  const flatData = flattenDataForTableau(data);
  
  // 태블로 웹 데이터 커넥터 HTML 생성
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Danta Trader - Tableau Web Data Connector</title>
    <meta charset="utf-8">
    <script src="https://public.tableau.com/javascripts/api/tableau-2.min.js"></script>
</head>
<body>
    <div style="text-align: center; padding: 50px;">
        <h1>🚀 Danta Trader 데이터 커넥터</h1>
        <p>태블로에서 이 페이지를 웹 데이터 커넥터로 사용하세요!</p>
        <button id="submitButton" style="padding: 10px 20px; font-size: 16px;">데이터 가져오기</button>
    </div>

    <script>
        (function() {
            var myConnector = tableau.makeConnector();
            
            myConnector.getSchema = function(schemaCallback) {
                var emotionCols = [{
                    id: "id",
                    dataType: tableau.dataTypeEnum.int
                }, {
                    id: "emotion_type",
                    dataType: tableau.dataTypeEnum.string
                }, {
                    id: "timestamp",
                    dataType: tableau.dataTypeEnum.datetime
                }, {
                    id: "stock",
                    dataType: tableau.dataTypeEnum.string
                }, {
                    id: "notes",
                    dataType: tableau.dataTypeEnum.string
                }];

                var emotionTable = {
                    id: "emotions",
                    alias: "투자 감정 데이터",
                    columns: emotionCols
                };

                var memoCols = [{
                    id: "id",
                    dataType: tableau.dataTypeEnum.string
                }, {
                    id: "stock",
                    dataType: tableau.dataTypeEnum.string
                }, {
                    id: "memo_type",
                    dataType: tableau.dataTypeEnum.string
                }, {
                    id: "content",
                    dataType: tableau.dataTypeEnum.string
                }, {
                    id: "tags",
                    dataType: tableau.dataTypeEnum.string
                }, {
                    id: "timestamp",
                    dataType: tableau.dataTypeEnum.datetime
                }, {
                    id: "price",
                    dataType: tableau.dataTypeEnum.float
                }];

                var memoTable = {
                    id: "memos",
                    alias: "투자 메모 데이터",
                    columns: memoCols
                };

                schemaCallback([emotionTable, memoTable]);
            };

            myConnector.getData = function(table, doneCallback) {
                var tableData = ${JSON.stringify(flatData)};
                
                if (table.tableInfo.id === "emotions") {
                    table.appendRows(tableData.emotions);
                } else if (table.tableInfo.id === "memos") {
                    table.appendRows(tableData.memos);
                }
                
                doneCallback();
            };

            tableau.registerConnector(myConnector);

            document.querySelector("#submitButton").addEventListener("click", function() {
                tableau.connectionName = "Danta Trader Data";
                tableau.submit();
            });
        })();
    </script>
</body>
</html>`;

  downloadFile(html, 'danta-trader-tableau-connector.html', 'text/html');
}

/**
 * 데이터 요약 통계 생성
 */
export function generateDataSummary() {
  const data = gatherAllAppData();
  
  const summary = {
    총감정기록수: data.emotions?.length || 0,
    총메모수: Object.values(data.memos || {}).flat().length,
    사용중인종목수: Object.keys(data.memos || {}).length,
    데이터수집기간: {
      시작일: data.emotions?.length > 0 ? 
        new Date(Math.min(...data.emotions.map(e => new Date(e.timestamp || Date.now())))).toISOString().split('T')[0] : 
        '데이터 없음',
      종료일: data.emotions?.length > 0 ? 
        new Date(Math.max(...data.emotions.map(e => new Date(e.timestamp || Date.now())))).toISOString().split('T')[0] : 
        '데이터 없음'
    },
    감정분포: calculateEmotionDistribution(data.emotions || []),
    메모타입분포: calculateMemoTypeDistribution(data.memos || {})
  };

  return summary;
}

function calculateEmotionDistribution(emotions) {
  const distribution = {};
  emotions.forEach(emotion => {
    const type = emotion.type || '알 수 없음';
    distribution[type] = (distribution[type] || 0) + 1;
  });
  return distribution;
}

function calculateMemoTypeDistribution(memos) {
  const distribution = {};
  Object.values(memos).flat().forEach(memo => {
    const type = memo.type || 'ANALYSIS';
    distribution[type] = (distribution[type] || 0) + 1;
  });
  return distribution;
} 