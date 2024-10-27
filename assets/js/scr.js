
let isRunning = false;
let rotationAngle = 0;
let motorSpeed = 0;
let temperature = 25;
let currentDraw = 0;
let speedHistory = Array(100).fill(0);
let faultCondition = false;
let calibrationMode = false;
let operatingTime = 0;
let maintenanceStatus = "OK";
let loadBalance = 100;
let voltageInput = 220;

// Initialize Plotly graph!!
const speedGraphDiv = document.getElementById('speedGraph');
Plotly.newPlot(speedGraphDiv, [{
    y: speedHistory,
    type: 'line',
    name: 'Speed',
    line: { color: '#4CAF50' }
}], {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#fff' },
    margin: { t: 10, r: 10, b: 30, l: 40 },
    yaxis: { title: 'Speed (RPM)', gridcolor: '#333' },
    xaxis: { title: 'Time', gridcolor: '#333' }
});

function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    alertBox.style.display = 'block';
    alertBox.style.background = type === 'error' ? '#f44336' : '#4CAF50';
    setTimeout(() => alertBox.style.display = 'none', 3000);
}

function updateLEDs() {
    const powerLed = document.getElementById('powerLed');
    const faultLed = document.getElementById('faultLed');
    const limitLed = document.getElementById('limitLed');
    const tempLed = document.getElementById('tempLed');
    const currentLed = document.getElementById('currentLed');

    const greenColor = '#4CAF50';
    const yellowColor = '#FFC107';
    const redColor = '#f44336';
    const offColor = '#666';

    powerLed.style.background = isRunning ? greenColor : offColor;
    powerLed.style.boxShadow = isRunning ? `0 0 10px ${greenColor}` : 'none';
    
    faultLed.style.background = faultCondition ? redColor : offColor;
    faultLed.style.boxShadow = faultCondition ? `0 0 10px ${redColor}` : 'none';
    
    let speedColor = motorSpeed < 1000 ? greenColor : 
                     motorSpeed < 1500 ? yellowColor : redColor;
    limitLed.style.background = motorSpeed > 0 ? speedColor : offColor;
    limitLed.style.boxShadow = motorSpeed > 0 ? `0 0 10px ${speedColor}` : 'none';
    
    let tempColor = temperature < 40 ? greenColor :
                    temperature < 60 ? yellowColor : redColor;
    tempLed.style.background = tempColor;
    tempLed.style.boxShadow = `0 0 10px ${tempColor}`;
    
    let currentColor = currentDraw < 7 ? greenColor :
                      currentDraw < 9 ? yellowColor : redColor;
    currentLed.style.background = currentDraw > 0 ? currentColor : offColor;
    currentLed.style.boxShadow = currentDraw > 0 ? `0 0 10px ${currentColor}` : 'none';
}

function updateReadings() {
    document.getElementById('loadBalance').textContent = `${loadBalance}%`;
    document.getElementById('voltageInput').textContent = `${voltageInput}V`;
    document.getElementById('operatingHours').textContent = 
        `${Math.floor(operatingTime/3600)}:${String(Math.floor((operatingTime/60)%60)).padStart(2,'0')}`;
    document.getElementById('maintenanceStatus').textContent = maintenanceStatus;

    if(isRunning) {
        operatingTime++;
        voltageInput = 220 + Math.sin(operatingTime/100) * 5;
        loadBalance = 100 - (currentDraw/10) * 20;
    }
}

function updateMotor() {
    if (isRunning && !faultCondition) {
        const resistance = parseInt(document.getElementById('var1').value);
        const currentLimit = parseInt(document.getElementById('currentLimit').value);
        const accelRate = parseInt(document.getElementById('accelRate').value);
        
        const maxSpeed = 1800;
        const targetSpeed = maxSpeed * (1 - (resistance / 500));
        motorSpeed += (targetSpeed - motorSpeed) * (accelRate / 1000);
        
        temperature += (motorSpeed / maxSpeed) * 0.01;
        temperature = Math.min(80, Math.max(25, temperature));
        
        currentDraw = (motorSpeed / maxSpeed) * (currentLimit / 100) * 10;
        
        document.getElementById('scrAngle').textContent = `${Math.round((resistance / 500) * 180)}°`;
        document.getElementById('motorSpeed').textContent = `${Math.round(motorSpeed)} RPM`;
        document.getElementById('temperature').textContent = `${temperature.toFixed(1)}°C`;
        document.getElementById('currentDraw').textContent = `${currentDraw.toFixed(1)} A`;
        document.getElementById('powerFactor').textContent = (0.8 + (motorSpeed / maxSpeed) * 0.2).toFixed(2);
        document.getElementById('efficiency').textContent = `${Math.round((motorSpeed / maxSpeed) * 100)}%`;
        
        rotationAngle += (motorSpeed / 60) * 6;
        document.getElementById('rotor').style.transform = `rotate(${rotationAngle}deg)`;
        
        speedHistory.push(motorSpeed);
        speedHistory.shift();
        Plotly.update(speedGraphDiv, { y: [speedHistory] });
        
        if (temperature > 70 || currentDraw > 9.5) {
            faultCondition = true;
            showAlert('Fault detected! System shutdown initiated.');
        }
    }
    
    updateLEDs();
    updateReadings();
    requestAnimationFrame(updateMotor);
}

// Event Listeners
document.getElementById('powerBtn').addEventListener('click', () => {
    if (!faultCondition) {
        isRunning = !isRunning;
        document.getElementById('powerBtn').textContent = isRunning ? 'Power OFF' : 'Power ON';
        document.getElementById('powerBtn').style.borderColor = isRunning ? '#f44336' : '#4CAF50';
    }
});

document.getElementById('emergencyBtn').addEventListener('click', () => {
    isRunning = false;
    motorSpeed = 0;
    faultCondition = true;
    showAlert('Emergency Stop Activated!', 'error');
});

document.getElementById('resetBtn').addEventListener('click', () => {
    faultCondition = false;
    temperature = 25;
    currentDraw = 0;
    showAlert('System Reset Complete', 'success');
});

document.getElementById('calibrateBtn').addEventListener('click', () => {
    calibrationMode = true;
    showAlert('Calibration in progress...', 'success');
    setTimeout(() => {
        calibrationMode = false;
        showAlert('Calibration complete!', 'success');
    }, 3000);
});

['var1', 'currentLimit', 'accelRate'].forEach(id => {
    const slider = document.getElementById(id);
    const value = document.getElementById(id + 'Value');
    slider.addEventListener('input', () => {
        value.textContent = id === 'var1' ? `${slider.value}Ω` : `${slider.value}%`;
    });
});

// Start the animation loop
updateMotor();
