let peakData = {
    voltage: {value: 0, time: null},
    temperature: {value: 0, time: null},
    speed: {value: 0, time: null}
};

let criticalEvents = [];

const historyData = {
    rpm: Array(50).fill(0),
    watts: Array(50).fill(0),
    amps: Array(50).fill(0),
    volts: Array(50).fill(0),
    temp: Array(50).fill(0),
    operating: Array(50).fill(0)
};

function recordPeak(type, value) {
    if (value > peakData[type].value) {
        peakData[type] = {
            value: value,
            time: new Date()
        };
    }
}

function recordCriticalEvent(type, value, threshold) {
    if (value > threshold) {
        criticalEvents.push({
            type: type,
            value: value,
            time: new Date(),
            threshold: threshold
        });

        if (criticalEvents.length > 10) {
            criticalEvents.shift();
        }
    }
}

const motor = document.querySelector('.motor');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
const powerButton = document.getElementById('powerButton');
const warningMessage = document.getElementById('warningMessage');

const operatingValue = document.getElementById('operatingValue');
const operatingGraph = document.getElementById('operatingGraph');

const powerIndicator = document.getElementById('powerIndicator');
const scrIndicator = document.getElementById('scrIndicator');
const tempIndicator = document.getElementById('tempIndicator');

const rpmValue = document.getElementById('rpmValue');
const wattsValue = document.getElementById('wattsValue');
const ampsValue = document.getElementById('ampsValue');
const voltsValue = document.getElementById('voltsValue');
const tempValue = document.getElementById('tempValue');
const tempGraph = document.getElementById('tempGraph');

const rpmGraph = document.getElementById('rpmGraph');
const wattsGraph = document.getElementById('wattsGraph');
const ampsGraph = document.getElementById('ampsGraph');
const voltsGraph = document.getElementById('voltsGraph');

let isPowered = false;
let currentTemp = 17;

const componentSpecs = {
    r1: {
        title: "R1 - Resistor Limitador",
        specs: "15kΩ / 1W",
        function: "Limita a corrente através do circuito de disparo do SCR",
        details: "Este resistor é crítico para a proteção do circuito, garantindo que a corrente de gate permaneça dentro dos limites seguros."
    },
    r2: {
        title: "R2 - Resistor de Proteção",
        specs: "100Ω / 0.5W",
        function: "Protege o circuito de sobretensões",
        details: "Este resistor é adicionado para limitar a corrente em situações de sobrecarga."
    },
    r3: {
        title: "R3 - Resistor de Gate",
        specs: "1kΩ / 0.5W",
        function: "Controla a corrente do gate do SCR",
        details: "Garante que o SCR dispare corretamente e opere dentro dos níveis seguros."
    },
    var1: {
        title: "VAR1 - Potenciômetro",
        specs: "500Ω Linear",
        function: "Ajusta a tensão no circuito",
        details: "Permite o controle manual da tensão aplicada ao motor."
    },
    c1: {
        title: "C1 - Capacitor de Filtro",
        specs: "2μF / 250V",
        function: "Filtra as tensões de ripple",
        details: "Este capacitor ajuda a suavizar as variações na tensão de saída."
    },
    scr: {
        title: "SCR BRY44",
        specs: "600V / 8A",
        function: "Controla a potência no motor AC",
        details: "Dispositivo crucial para a regulação da velocidade do motor."
    },
    motor: {
        title: "Motor AC",
        specs: "110V / 1/4 HP",
        function: "Motor utilizado no circuito",
        details: "Motor de corrente alternada projetado para operação em diversas condições."
    },
    power: {
        title: "Alimentação",
        specs: "220V AC / 60Hz",
        function: "Fornece energia ao circuito",
        details: "Fonte de alimentação que abastece o circuito e motor."
    }
    
};

const modal = document.getElementById('componentModal');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.querySelector('.close-modal');

document.querySelectorAll('.component-link').forEach(link => {
    link.addEventListener('click', function() {
        const component = this.dataset.component;
        const specs = componentSpecs[component];
        
        modalTitle.textContent = specs.title;
        modalContent.innerHTML = `
            <p><strong>Especificações:</strong> ${specs.specs}</p>
            <p><strong>Função:</strong> ${specs.function}</p>
            <p><strong>Detalhes:</strong> ${specs.details}</p>
        `;
        
        modal.style.display = 'block';
    });
});

if (closeBtn) {
    closeBtn.onclick = function() {
        console.log("Fechar modal");
        modal.style.display = 'none';
    }
} else {
    console.error("Botão de fechamento não encontrado.");
}

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}



function setupCanvases() {
    const canvases = document.querySelectorAll('.history-canvas');
    canvases.forEach(canvas => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    });
}

function drawMiniGraph(canvas, data, baseColor) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for(let i = 0; i < height; i += height/5) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
    }

    ctx.lineWidth = 1.5;

    for(let i = 1; i < data.length; i++) {
        const value = data[i];
        ctx.beginPath();

        const x1 = ((i-1) / (data.length - 1)) * width;
        const x2 = (i / (data.length - 1)) * width;
        const y1 = height - (data[i-1] / 100 * height);
        const y2 = height - (value / 100 * height);

        if (value < 30) {
            ctx.strokeStyle = '#2ecc71';
        } else if (value < 70) {
            ctx.strokeStyle = '#f39c12';
        } else {
            ctx.strokeStyle = '#e74c3c';
        }

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

function updateTelemetry(speed) {
    const rpmBase = 1750;
    const rpm = Math.round((speed / 100) * rpmBase);
    const volts = Math.round((speed / 100) * 110);
    const amps = ((speed / 100) * 2.5).toFixed(2);
    const watts = Math.round(volts * amps);

    // Aplicação de variação nos valores para simulação
    const rpmVariation = rpm + (Math.random() * 20 - 10);
    const voltsVariation = volts + (Math.random() * 2 - 1);
    const ampsVariation = (parseFloat(amps) + (Math.random() * 0.1 - 0.05)).toFixed(2);
    const wattsVariation = Math.round(voltsVariation * ampsVariation);

    // Atualização dos elementos de texto
    rpmValue.textContent = Math.round(rpmVariation);
    wattsValue.textContent = wattsVariation;
    ampsValue.textContent = ampsVariation;
    voltsValue.textContent = Math.round(voltsVariation);

    // Atualização de temperatura
    tempValue.textContent = `${Math.round(currentTemp)}°C`;
    tempGraph.style.height = `${(currentTemp / 130) * 100}%`;

    // Atualização da eficiência operacional
    const minEfficiency = 60; // Eficiência mínima
    const idealRPM = 1750;
    const idealVolts = 110;
    const idealAmps = 2.5;
    const idealTemp = 40;

    const rpmDeviation = Math.abs(1 - (rpmVariation / idealRPM));
    const voltsDeviation = Math.abs(1 - (voltsVariation / idealVolts));
    const ampsDeviation = Math.abs(1 - (ampsVariation / idealAmps));
    const tempDeviation = Math.abs(1 - (currentTemp / idealTemp));

    let efficiency = (
        (1 - rpmDeviation * - 0.3) *
        (1 - voltsDeviation * - 0.2) *
        (1 - ampsDeviation * - 0.2) *
        (1 - tempDeviation * - 0.3)
    ) * 50;

    efficiency = Math.max(minEfficiency, efficiency); // Garante eficiência mínima de 60%

    operatingValue.textContent = Math.round(efficiency) + '%';
    operatingGraph.style.height = `${efficiency}%`;

    // Cores condicionais para eficiência
    if (efficiency > 85) {
        operatingValue.style.color = '#2ecc71'; // Verde
    } else if (efficiency > 70) {
        operatingValue.style.color = '#f39c12'; // Laranja
    } else {
        operatingValue.style.color = '#e74c3c'; // Vermelho
    }

    // Registro de picos e eventos críticos
    recordPeak('voltage', voltsVariation);
    recordPeak('temperature', currentTemp);
    recordPeak('speed', rpmVariation);

    recordCriticalEvent('voltage', voltsVariation, 120);
    recordCriticalEvent('temperature', currentTemp, 75);
    recordCriticalEvent('speed', rpmVariation, 1700);

    // Atualização dos dados históricos para gráficos
    historyData.rpm.push((rpmVariation / rpmBase) * 100);
    historyData.rpm.shift();

    historyData.watts.push((wattsVariation / 275) * 100);
    historyData.watts.shift();

    historyData.amps.push((ampsVariation / 2.5) * 100);
    historyData.amps.shift();

    historyData.volts.push((voltsVariation / 110) * 100);
    historyData.volts.shift();

    historyData.temp.push((currentTemp / 130) * 100);
    historyData.temp.shift();

    historyData.operating.push(efficiency);
    historyData.operating.shift();

    // Atualização de gráficos
    const rpmCanvas = document.querySelector('.gauge:nth-child(1) .history-canvas');
    const wattsCanvas = document.querySelector('.gauge:nth-child(2) .history-canvas');
    const ampsCanvas = document.querySelector('.gauge:nth-child(3) .history-canvas');
    const voltsCanvas = document.querySelector('.gauge:nth-child(4) .history-canvas');
    const tempCanvas = document.querySelector('.gauge:nth-child(5) .history-canvas');
    const operatingCanvas = document.querySelector('.gauge:nth-child(6) .history-canvas');

    drawMiniGraph(rpmCanvas, historyData.rpm, '#4af');
    drawMiniGraph(wattsCanvas, historyData.watts, '#4af');
    drawMiniGraph(ampsCanvas, historyData.amps, '#4af');
    drawMiniGraph(voltsCanvas, historyData.volts, '#4af');
    drawMiniGraph(tempCanvas, historyData.temp, '#4af');
    drawMiniGraph(operatingCanvas, historyData.operating, '#4af');

    updateTemperature(speed);
    checkWarningConditions(speed, rpmVariation, wattsVariation, ampsVariation);

    // Atualização do indicador de temperatura
    if (currentTemp > 75) {
        tempIndicator.style.background = '#e74c3c'; // Vermelho
    } else if (currentTemp > 50) {
        tempIndicator.style.background = '#f39c12'; // Laranja
    } else {
        tempIndicator.style.background = '#2ecc71'; // Verde
    }

    tempIndicator.style.boxShadow = `0 0 10px ${tempIndicator.style.background}`;
}


function updateTemperature(speed) {
    const targetTemp = 25 + (speed * 0.05);
    currentTemp = currentTemp + (targetTemp - currentTemp) * 0.1;
}

function checkWarningConditions(speed, rpm, watts, amps) {
    const showWarning = speed > 90 || 
                      currentTemp > 50 || 
                      watts > 250 || 
                      amps > 2.3;

    warningMessage.style.display = showWarning ? 'block' : 'none';
}

speedControl.addEventListener('input', function() {
    const speed = parseInt(this.value);
    speedValue.textContent = speed;
    if (isPowered) {
        updateMotorSpeed(speed);
        updateTelemetry(speed);
        scrIndicator.classList.toggle('active', speed > 0);
    }
});

powerButton.addEventListener('click', function() {
    isPowered = !isPowered;
    if (isPowered) {
        updateMotorSpeed(speedControl.value);
        updateTelemetry(speedControl.value);
        powerButton.style.backgroundColor = '#e74c3c';
        powerIndicator.classList.add('active');
    } else {
        motor.style.animationPlayState = 'paused';
        powerButton.style.backgroundColor = '#4a90e2';
        powerIndicator.classList.remove('active');
        scrIndicator.classList.remove('active');
        updateTelemetry(0);
    }
});

function updateMotorSpeed(speed) {
    const duration = Math.max(0.5, (100 - speed) / 25);
    motor.style.animationDuration = duration + 's';
    motor.style.animationPlayState = 'running';
}

setInterval(() => {
    if (isPowered) {
        const currentSpeed = parseInt(speedControl.value);
        updateTelemetry(currentSpeed);
    }
}, 100);

window.addEventListener('resize', setupCanvases);
setupCanvases();



