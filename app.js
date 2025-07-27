// 실시간 음성 번역 - JavaScript (일본어-한국어 버전)

// 언어별 UI 텍스트 정의
const UI_TEXT = {
    ja: {
        waiting: '待機中',
        recording: '録音中',
        processing: '処理中',
        listening: '話し中...',
        translating: '翻訳中...'
    },
    ko: {
        waiting: '대기 중',
        recording: '녹음 중',
        processing: '처리 중',
        listening: '말하는 중...',
        translating: '번역 중...'
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // 기본 API 키
    const DEFAULT_OPENAI_API_KEY = '';
    
    // API 키 저장
    let OPENAI_API_KEY = '';
    
    // DOM 요소
    const startJapaneseBtn = document.getElementById('startJapaneseBtn');
    const startKoreanBtn = document.getElementById('startKoreanBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const status = document.getElementById('status');
    const errorMessage = document.getElementById('errorMessage');
    const originalText = document.getElementById('originalText');
    const translatedText = document.getElementById('translatedText');
    const sourceLanguage = document.getElementById('sourceLanguage');
    const targetLanguage = document.getElementById('targetLanguage');
    const apiModal = document.getElementById('apiModal');
    const settingsButton = document.getElementById('settingsButton');
    const openaiKeyInput = document.getElementById('openaiKey');
    const saveApiKeysBtn = document.getElementById('saveApiKeys');
    const resetKeysBtn = document.getElementById('resetKeys');
    const listeningIndicator = document.getElementById('listeningIndicator');
    const translatingIndicator = document.getElementById('translatingIndicator');
    const fontSizeSmallBtn = document.getElementById('fontSizeSmall');
    const fontSizeMediumBtn = document.getElementById('fontSizeMedium');
    const fontSizeLargeBtn = document.getElementById('fontSizeLarge');
    const fontSizeXLargeBtn = document.getElementById('fontSizeXLarge');
    
    // 음성 인식 변수
    let recognition = null;
    let isRecording = false;
    let currentTranslationController = null;
    let translationInProgress = false;
    let selectedLanguage = ''; // 'ja'는 일본어, 'ko'는 한국어
    let lastTranslationTime = 0;
    
    // 중복 방지를 위한 변수
    let processedResultIds = new Set(); // 처리된 결과 ID 추적
    let lastTranslatedText = ''; // 마지막으로 번역된 내용 기록
    let translationDebounceTimer = null;

    // 일본어 텍스트 형식화를 위한 변수와 함수
    let japaneseFormatter = {
        // 문장 끝에 마침표 추가
        addPeriod: function(text) {
            if (text && !text.endsWith("。") && !text.endsWith(".") && !text.endsWith("？") && !text.endsWith("?") && !text.endsWith("！") && !text.endsWith("!")) {
                return text + "。";
            }
            return text;
        },
        
        // 적절한 위치에 쉼표 추가
        addCommas: function(text) {
            // 문장 내 자연스러운 구분에 쉼표를 추가하는 간단한 규칙
            // 접속사나 특정 패턴 뒤에 쉼표 추가
            const patterns = [
                { search: /([^、。])そして/g, replace: "$1、そして" },
                { search: /([^、。])しかし/g, replace: "$1、しかし" },
                { search: /([^、。])ですが/g, replace: "$1、ですが" },
                { search: /([^、。])また/g, replace: "$1、また" },
                { search: /([^、。])けれども/g, replace: "$1、けれども" },
                { search: /([^、。])だから/g, replace: "$1、だから" },
                { search: /([^、。])ので/g, replace: "$1、ので" },
                // 문장이 긴 경우, 적절히 구분
                { search: /(.{10,})から(.{10,})/g, replace: "$1から、$2" },
                { search: /(.{10,})ので(.{10,})/g, replace: "$1ので、$2" },
                { search: /(.{10,})けど(.{10,})/g, replace: "$1けど、$2" }
            ];
            
            let result = text;
            for (const pattern of patterns) {
                result = result.replace(pattern.search, pattern.replace);
            }
            
            return result;
        },
        
        // 전체 문장 형식화
        format: function(text) {
            if (!text || text.trim().length === 0) return text;
            
            let formatted = text;
            // 먼저 쉼표 추가
            formatted = this.addCommas(formatted);
            // 다음에 문장 끝에 마침표 추가
            formatted = this.addPeriod(formatted);
            
            return formatted;
        }
    };
    
    // API 키 로드
    function loadApiKeys() {
        const storedOpenaiKey = localStorage.getItem('translatorOpenaiKey');
        
        OPENAI_API_KEY = storedOpenaiKey ? storedOpenaiKey.trim() : '';
        
        if (!OPENAI_API_KEY) {
            openaiKeyInput.value = DEFAULT_OPENAI_API_KEY;
            apiModal.style.display = 'flex';
        } else {
            initializeApp();
        }
    }
    
    // API 키 저장
    saveApiKeysBtn.addEventListener('click', () => {
        const openaiKey = openaiKeyInput.value.trim();
        
        if (!openaiKey) {
            alert('OpenAI API 키를 입력해주세요.');
            return;
        }
        
        // API 키를 저장하기 전에 불필요한 공백을 확실히 제거
        localStorage.setItem('translatorOpenaiKey', openaiKey.trim());
        
        OPENAI_API_KEY = openaiKey.trim();
        
        apiModal.style.display = 'none';
        initializeApp();
    });
    
    // 설정 모달 열기
    settingsButton.addEventListener('click', () => {
        openaiKeyInput.value = OPENAI_API_KEY;
        apiModal.style.display = 'flex';
    });
    
    // API 키 리셋
    resetKeysBtn.addEventListener('click', () => {
        if (confirm('API 키를 초기화하시겠습니까?')) {
            localStorage.removeItem('translatorOpenaiKey');
            location.reload();
        }
    });
    
    // 모달 외부 클릭으로 닫기
    apiModal.addEventListener('click', (e) => {
        if (e.target === apiModal) {
            apiModal.style.display = 'none';
        }
    });
    
    // 폰트 크기 변경 함수
    function changeFontSize(size) {
        // 모든 크기 클래스 제거
        originalText.classList.remove('size-small', 'size-medium', 'size-large', 'size-xlarge');
        translatedText.classList.remove('size-small', 'size-medium', 'size-large', 'size-xlarge');
        
        // 선택된 크기 클래스 추가
        originalText.classList.add(`size-${size}`);
        translatedText.classList.add(`size-${size}`);
        
        // 로컬 스토리지에 저장하여 사용자 설정 기억
        localStorage.setItem('translatorFontSize', size);
    }
    
    // 앱 초기화
    function initializeApp() {
        // 오류 메시지 클리어
        errorMessage.textContent = '';
        
        // Web Speech API 지원 확인
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setupSpeechRecognition();
        } else {
            status.textContent = '이 브라우저는 음성 인식을 지원하지 않습니다.';
            status.classList.remove('idle');
            status.classList.add('error');
            errorMessage.textContent = '브라우저가 음성 인식을 지원하지 않습니다. Chrome, Safari, 또는 Edge를 사용하세요.';
            return;
        }
        
        // 언어 버튼 활성화
        startJapaneseBtn.addEventListener('click', () => startRecording('ja'));
        startKoreanBtn.addEventListener('click', () => startRecording('ko'));
        stopBtn.addEventListener('click', stopRecording);
        resetBtn.addEventListener('click', resetContent);
        
        // 폰트 크기 변경 버튼 설정
        fontSizeSmallBtn.addEventListener('click', () => changeFontSize('small'));
        fontSizeMediumBtn.addEventListener('click', () => changeFontSize('medium'));
        fontSizeLargeBtn.addEventListener('click', () => changeFontSize('large'));
        fontSizeXLargeBtn.addEventListener('click', () => changeFontSize('xlarge'));
        
        // 저장된 폰트 크기 설정이 있으면 적용
        const savedFontSize = localStorage.getItem('translatorFontSize') || 'medium';
        changeFontSize(savedFontSize);
        
        // 번역 시스템 프롬프트
        window.SYSTEM_PROMPT = `당신은 일본어와 한국어의 전문적인 동시 통역사입니다.
음성 입력 데이터를 다음 규칙에 따라 읽기 쉬운 텍스트로 변환하여 번역해주세요:

1. 원본 텍스트가 일본어인 경우 한국어로 번역합니다.
2. 원본 텍스트가 한국어인 경우 일본어로 번역합니다.
3. "아", "음" 등의 필러나 불필요한 표현은 제거합니다.
4. 데이터가 부족한 경우 문맥을 바탕으로 보완합니다.
5. 전문 용어, 고유 명사, 문화적 언급은 정확히 유지합니다.
6. 출력은 자연스럽고 대화적으로 합니다.
7. 번역만 출력하며, 설명은 포함하지 않습니다.`;
    }
    
    // 콘텐츠 리셋 기능
    function resetContent() {
        // 리셋 처리
        processedResultIds.clear();
        lastTranslatedText = '';
        originalText.textContent = '';
        translatedText.textContent = '';
        
        // 상태 표시 업데이트
        status.textContent = UI_TEXT.ja.waiting; // 기본은 일본어
        status.classList.remove('recording', 'processing', 'error');
        status.classList.add('idle');
        
        errorMessage.textContent = '';
        
        console.log('콘텐츠 리셋 완료');
    }
    
    // 음성 인식 설정
    function setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            status.textContent = '이 브라우저는 음성 인식을 지원하지 않습니다.';
            status.classList.remove('idle');
            status.classList.add('error');
            errorMessage.textContent = '브라우저가 음성 인식을 지원하지 않습니다. Chrome, Safari, 또는 Edge를 사용하세요.';
            return;
        }
        
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        
        recognition.onstart = function() {
            console.log('음성 인식 시작. 언어:', recognition.lang);
            listeningIndicator.textContent = UI_TEXT[selectedLanguage].listening;
            listeningIndicator.classList.add('visible');
        };
        
        recognition.onend = function() {
            console.log('음성 인식 종료');
            listeningIndicator.classList.remove('visible');
            
            // 녹음 중인 경우 재시작
            if (isRecording) {
                try {
                    recognition.start();
                } catch (e) {
                    console.error('음성 인식 재시작 실패', e);
                }
            }
        };
        
        // 음성 인식 결과 처리 - 실시간 번역 강화 버전
        recognition.onresult = function(event) {
            // 현재 텍스트 변환 내용 구성
            let interimText = '';
            let finalText = '';
            let hasNewContent = false;
            
            // 각 인식 결과에 대해 처리
            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript.trim();
                
                // 각 결과에 고유 ID 생성 (위치 + 내용)
                const resultId = `${i}-${transcript}`;
                
                // 확정된 결과인 경우
                if (result.isFinal) {
                    // 아직 처리하지 않은 결과인 경우만 추가
                    if (!processedResultIds.has(resultId)) {
                        processedResultIds.add(resultId);
                        hasNewContent = true;
                        
                        // 일본어 입력의 경우, 문장 형식화
                        if (selectedLanguage === 'ja') {
                            finalText += japaneseFormatter.format(transcript) + ' ';
                        } else {
                            finalText += transcript + ' ';
                        }
                    } else {
                        // 처리된 확정 결과도 표시용으로는 추가
                        finalText += transcript + ' ';
                    }
                } else {
                    // 임시 결과
                    interimText += transcript + ' ';
                    hasNewContent = true;
                }
            }
            
            // 표시 텍스트 (확정 결과 + 임시 결과)
            const displayText = (finalText + interimText).trim();
            
            // UI 업데이트
            originalText.textContent = displayText;
            
            // 언어 표시기 업데이트
            if (selectedLanguage === 'ja') {
                sourceLanguage.textContent = '일본어';
                targetLanguage.textContent = '한국어';
            } else {
                sourceLanguage.textContent = '한국어';
                targetLanguage.textContent = '일본어';
            }
            
            // 새로운 콘텐츠가 있는 경우, 번역 트리거
            if (hasNewContent && displayText !== lastTranslatedText) {
                // 번역 처리를 디바운스 (짧은 시간에 여러 번 호출되는 것을 방지)
                clearTimeout(translationDebounceTimer);
                translationDebounceTimer = setTimeout(() => {
                    lastTranslatedText = displayText;
                    translateText(displayText);
                }, 500); // 0.5초 디바운스 (정확도와 속도의 균형)
            }
        };
        
        recognition.onerror = function(event) {
            console.error('음성 인식 오류', event.error);
            
            if (event.error === 'no-speech') {
                // 음성이 감지되지 않음 - 정상 상태
            } else if (event.error === 'audio-capture') {
                status.textContent = '마이크가 감지되지 않습니다';
                status.classList.remove('idle', 'recording');
                status.classList.add('error');
                errorMessage.textContent = '마이크를 감지할 수 없습니다. 디바이스 설정을 확인해주세요.';
                stopRecording();
            } else if (event.error === 'not-allowed') {
                status.textContent = '마이크 권한이 거부되었습니다';
                status.classList.remove('idle', 'recording');
                status.classList.add('error');
                errorMessage.textContent = '마이크 접근이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.';
                stopRecording();
            }
        };
    }
    
    // 녹음 상태 버튼 표시 전환
    function updateButtonVisibility(isRecordingState) {
        if (isRecordingState) {
            // 시작 버튼 숨기기, 중지 버튼 표시
            startJapaneseBtn.style.display = 'none';
            startKoreanBtn.style.display = 'none';
            stopBtn.style.display = 'flex';
            stopBtn.disabled = false;
            resetBtn.disabled = true; // 녹음 중에는 리셋 비활성화
            resetBtn.style.opacity = '0.5';
        } else {
            // 시작 버튼 표시, 중지 버튼 숨기기
            startJapaneseBtn.style.display = 'flex';
            startKoreanBtn.style.display = 'flex';
            startJapaneseBtn.disabled = false;
            startKoreanBtn.disabled = false;
            stopBtn.style.display = 'none';
            stopBtn.disabled = true;
            resetBtn.disabled = false; // 녹음 중지 시 리셋 활성화
            resetBtn.style.opacity = '1';
        }
    }
    
    // 지정된 언어로 녹음 시작
    async function startRecording(language) {
        // 오류 메시지 클리어
        errorMessage.textContent = '';
        
        // 선택 언어 설정
        selectedLanguage = language;
        
        // UI와 변수 리셋
        processedResultIds.clear();
        lastTranslatedText = '';
        originalText.textContent = '';
        translatedText.textContent = '';
        
        // 언어 표시기 업데이트
        if (language === 'ja') {
            sourceLanguage.textContent = '일본어';
            targetLanguage.textContent = '한국어';
        } else {
            sourceLanguage.textContent = '한국어';
            targetLanguage.textContent = '일본어';
        }
        
        // UI 업데이트
        isRecording = true;
        document.body.classList.add('recording');
        status.textContent = UI_TEXT[language].recording;
        status.classList.remove('idle', 'error');
        status.classList.add('recording');
        
        // 버튼 표시 업데이트 - 시작 버튼 숨기기, 중지 버튼 표시
        updateButtonVisibility(true);
        
        // Web Speech API를 사용하여 언어를 명시적으로 설정
        try {
            // 인식 언어 설정
            recognition.lang = language === 'ja' ? 'ja-JP' : 'ko-KR';
            recognition.start();
        } catch (e) {
            console.error('음성 인식 시작 오류', e);
            errorMessage.textContent = '음성 인식 시작에 실패했습니다: ' + e.message;
            stopRecording();
        }
    }
    
    // 녹음 중지
    function stopRecording() {
        isRecording = false;
        document.body.classList.remove('recording');
        status.textContent = UI_TEXT[selectedLanguage].processing;
        status.classList.remove('recording');
        status.classList.add('processing');
        
        // 버튼 표시 업데이트 - 시작 버튼 표시, 중지 버튼 숨기기
        updateButtonVisibility(false);
        
        try {
            recognition.stop();
        } catch (e) {
            console.error('음성 인식 중지 오류', e);
        }
        
        // 처리 완료 후 상태 업데이트
        setTimeout(() => {
            status.textContent = UI_TEXT[selectedLanguage || 'ja'].waiting;
            status.classList.remove('processing');
            status.classList.add('idle');
        }, 1000);
        
        console.log('녹음 중지');
    }
    
    // OpenAI API (gpt-4.1-nano 모델)를 사용하여 텍스트 번역
    async function translateText(text) {
        // 번역 처리 실행 조건 확인
        if (!text || !text.trim()) {
            console.log('번역 건너뜀: 빈 텍스트');
            return;
        }
        
        // 이미 번역 중인 경우 새 요청으로 덮어쓰기
        if (translationInProgress) {
            // 기존 요청 중단
            if (currentTranslationController) {
                currentTranslationController.abort();
                currentTranslationController = null;
            }
        }
        
        translationInProgress = true;
        lastTranslationTime = Date.now();
        translatingIndicator.textContent = UI_TEXT[selectedLanguage].translating;
        translatingIndicator.classList.add('visible');
        
        // 오류 메시지 클리어
        errorMessage.textContent = '';
        
        try {
            // 선택된 언어 버튼에 따라 원본 언어 결정
            const sourceLanguageStr = selectedLanguage === 'ja' ? '일본어' : '한국어';
            
            // 새 AbortController 생성
            currentTranslationController = new AbortController();
            const signal = currentTranslationController.signal;
            
            console.log(`텍스트 번역 중 (${text.length} 글자): "${text.substring(0, 30)}..."`);
            
            // gpt-4.1-nano 모델을 사용한 OpenAI 요청 생성
            const translationPayload = {
                model: "gpt-4.1-nano",
                messages: [
                    {
                        role: "system",
                        content: window.SYSTEM_PROMPT
                    },
                    {
                        role: "user",
                        content: `다음 ${sourceLanguageStr} 텍스트를 번역해주세요:\n\n${text}`
                    }
                ],
                stream: true,  // 실시간 응답을 위한 스트리밍 활성화
                temperature: 0.3  // 번역 정확도 향상을 위한 낮은 값 설정
            };
            
            console.log('OpenAI API에 번역 요청 전송 중...');
            
            // 번역 요청
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + OPENAI_API_KEY.trim()
                },
                body: JSON.stringify(translationPayload),
                signal: signal
            });
            
            if (!response.ok) {
                let errorData = null;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: { message: `HTTP 오류: ${response.status}` } };
                }
                
                console.error('OpenAI API 오류:', errorData);
                throw new Error(errorData.error?.message || `OpenAI API에서 상태를 반환했습니다: ${response.status}`);
            }
            
            console.log('번역 스트림 시작');
            
            // 스트리밍 응답 처리
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let translationResult = '';
            
            // 새 번역 시작 시 이전 내용 클리어
            translatedText.textContent = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                // 청크 디코드
                const chunk = decoder.decode(value);
                
                // 청크에서 각 줄 처리
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(line.substring(6));
                            if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                                const content = data.choices[0].delta.content;
                                translationResult += content;
                                translatedText.textContent = translationResult;
                            }
                        } catch (e) {
                            console.error('스트리밍 응답 분석 오류:', e);
                        }
                    }
                }
            }
            
            console.log('번역 완료');
            
            // 현재 컨트롤러 리셋
            currentTranslationController = null;
            
        } catch (error) {
            // 중단 오류는 무시
            if (error.name === 'AbortError') {
                console.log('번역 요청이 중단되었습니다');
            } else {
                console.error('번역 오류:', error);
                errorMessage.textContent = error.message;
                if (translatedText.textContent === '') {
                    translatedText.textContent = '(번역 오류 - 다시 시도해주세요)';
                }
            }
        } finally {
            translationInProgress = false;
            translatingIndicator.classList.remove('visible');
        }
    }
    
    // 앱 초기화
    loadApiKeys();
});