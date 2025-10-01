document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const targetTimeInput = document.getElementById('target-time-input');
    const setTimeButton = document.getElementById('set-time-button');
    const actualChimeTimeDisplay = document.getElementById('actual-chime-time'); // 実際のチャイム時刻表示

    const alertMessageElement = document.getElementById('alert-message'); 
    
    const timerLabel = document.getElementById('timer-label');
    const timerSign = document.getElementById('timer-sign');
    const timerHours = document.getElementById('timer-hours');
    const timerMinutes = document.getElementById('timer-minutes');
    const timerSeconds = document.getElementById('timer-seconds');
    const timerCentiseconds = document.getElementById('timer-centiseconds');

    // 内部で使用する目標時刻（入力値）
    let INPUT_HOUR = 12;
    let INPUT_MINUTE = 30;
    let INPUT_SECOND = 0;
    
    // 定数: チャイムが鳴るまでのオフセット時間 (1分20秒 = 80秒 = 80000ミリ秒)
    const CHIME_OFFSET_MS = 80000; 

    // 実際のチャイム時刻（タイマー基準時刻）を計算し、表示を更新する関数
    function updateChimeTimeAndDisplay() {
        const now = new Date();
        
        // 1. 入力された目標時刻を基準にしたDateオブジェクトを作成 (今日の目標時刻)
        const inputTargetDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            INPUT_HOUR,
            INPUT_MINUTE,
            INPUT_SECOND
        );
        
        // 2. 実際のチャイム時刻 (目標時刻 - 1分20秒) を計算
        // Dateオブジェクトから80000ミリ秒を引く
        const actualChimeDate = new Date(inputTargetDate.getTime() - CHIME_OFFSET_MS);

        // 3. 実際の時刻表示を更新
        const h = actualChimeDate.getHours();
        const m = actualChimeDate.getMinutes();
        const s = actualChimeDate.getSeconds();
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        
        actualChimeTimeDisplay.textContent = `実際のチャイム時刻: ${timeStr}`;
        
        return actualChimeDate; // タイマー計算用にDateオブジェクトを返す
    }
    
    // 設定ボタンのイベントリスナー
    setTimeButton.addEventListener('click', () => {
        const input = targetTimeInput.value;
        const parts = input.split(':').map(p => parseInt(p.trim(), 10));

        if (parts.length === 3 && parts.every(p => !isNaN(p))) {
            const [h, m, s] = parts;
            if (h >= 0 && h <= 23 && m >= 0 && m <= 59 && s >= 0 && s <= 59) {
                // 入力値を更新
                INPUT_HOUR = h;
                INPUT_MINUTE = m;
                INPUT_SECOND = s;
                
                // タイマーを更新し、表示も更新
                updateTimer();
                return;
            }
        }
        alert('無効な時刻形式です。HH:MM:SSの形式で、正しい時刻を入力してください。');
    });

    // 初回表示とタイマーの実行
    updateChimeTimeAndDisplay();

    function updateTimer() {
        // 実際のチャイム時刻（タイマーの基準時刻）を取得
        const actualChimeDate = updateChimeTimeAndDisplay();
        const now = new Date();
        
        // チャイム時刻と現在時刻の差分をミリ秒で計算
        let diffMs = actualChimeDate.getTime() - now.getTime();
        let totalMs = Math.abs(diffMs);
        
        let sign = '';
        let labelText = '';
        
        // アラートメッセージをリセット
        alertMessageElement.textContent = '';
        alertMessageElement.classList.remove('alert-warning', 'alert-critical');

        if (diffMs > 0) {
            // 基準時刻より前（あと何分か）
            totalMs = Math.ceil(diffMs); 
            sign = '-'; 
            labelText = '給食開始まで';
        } else {
            // 基準時刻以降（何分経過したか）
            sign = ''; 
            labelText = '給食開始から経過';

            // 強調表示（アラート）ロジックは「秒単位」の経過時間に基づいて動作
            const totalSeconds = Math.floor(totalMs / 1000);

            if (totalSeconds >= 240 && totalSeconds < 300) {
                // 5分に近づいた時 (4:00〜5:00の間)
                alertMessageElement.textContent = '終了まであと少し！まもなく5分経過です！';
                alertMessageElement.classList.add('alert-critical');
            } else if (totalSeconds >= 120 && totalSeconds < 180) {
                // 3分に近づいた時 (2:00〜3:00の間)
                alertMessageElement.textContent = '経過3分に近づいています！';
                alertMessageElement.classList.add('alert-warning');
            }
        }
        
        // HH/MM/SS.100M の計算と表示
        const centiseconds = Math.floor((totalMs % 1000) / 10); 
        const totalSecondsPart = Math.floor(totalMs / 1000); 
        
        const hours = Math.floor(totalSecondsPart / 3600);
        const minutes = Math.floor((totalSecondsPart % 3600) / 60);
        const seconds = totalSecondsPart % 60;

        const pad = (num, length = 2) => String(num).padStart(length, '0');

        timerLabel.textContent = labelText;
        timerSign.textContent = sign;
        timerHours.textContent = pad(hours);
        timerMinutes.textContent = pad(minutes);
        timerSeconds.textContent = pad(seconds);
        timerCentiseconds.textContent = pad(centiseconds); 
    }

    // 更新頻度を10ミリ秒（100分の1秒）に設定
    setInterval(updateTimer, 10);
    // 初回実行
    updateTimer();
});