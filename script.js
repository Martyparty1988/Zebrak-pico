// Service Worker registrace
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.error('Service Worker failed:', err));
}

// Data
let priceStorage = JSON.parse(localStorage.getItem('priceStorage')) || { pricePerGram: 0 };
let calculationsHistory = JSON.parse(localStorage.getItem('calculationsHistory')) || [];
let shiftData = JSON.parse(localStorage.getItem('shiftData')) || {
    active: false,
    profit: 0,
    sales: 0
};

// Funkce pro zobrazení záložek
function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');

    if (tabName === 'history') {
        loadHistory();
    }
}

// Funkce pro výpočet
function calculate(markup) {
    const weight = parseFloat(document.getElementById('weight').value);
    const pricePerGram = parseFloat(document.getElementById('pricePerGram').value);

    if (isNaN(weight) || weight <= 0) {
        document.getElementById('result').textContent = 'Zadej platnou váhu!';
        return;
    }
    if (isNaN(pricePerGram) || pricePerGram <= 0) {
        document.getElementById('result').textContent = 'Nastav cenu za gram v nastavení!';
        return;
    }

    const basePrice = weight * pricePerGram;
    const finalPrice = basePrice * (1 + markup / 100);
    const profit = finalPrice - basePrice;

    const calculation = {
        weight: weight,
        pricePerGram: pricePerGram,
        markup: markup,
        basePrice: basePrice,
        finalPrice: finalPrice,
        profit: profit,
        date: new Date().toLocaleString('cs-CZ')
    };

    saveToHistory(calculation);
    if (isShiftActive()) {
        addToShift(profit);
    }

    document.getElementById('result').innerHTML = `
        <div>
            <div>Základní cena: ${basePrice.toFixed(2)} Kč</div>
            <div style="font-size: 28px; color: #fbbf24; margin-top: 10px;">
                Finální cena: ${finalPrice.toFixed(2)} Kč
            </div>
            <div style="font-size: 16px; color: #16a34a; margin-top: 8px;">
                Výdělek: +${profit.toFixed(2)} Kč
            </div>
        </div>`;
}

// Funkce pro směnu
function isShiftActive() { return shiftData.active; }
function addToShift(profit) { shiftData.profit += profit; shiftData.sales += 1; updateShiftDisplay(); }
function toggleShift() {
    const btn = document.getElementById('shiftBtn');
    shiftData.active = !shiftData.active;
    btn.textContent = shiftData.active ? '🛑 Ukončit směnu' : '🎯 Začít směnu';
    btn.classList.toggle('shift-active', shiftData.active);
    document.getElementById('shiftStatus').textContent = shiftData.active ? 'ANO' : 'NE';
    updateShiftDisplay();
}
function resetShift() {
    shiftData = { active: false, profit: 0, sales: 0 };
    const btn = document.getElementById('shiftBtn');
    btn.textContent = '🎯 Začít směnu';
    btn.classList.remove('shift-active');
    updateShiftDisplay();
}
function updateShiftDisplay() {
    document.getElementById('totalProfit').textContent = `${shiftData.profit.toFixed(2)} Kč`;
    document.getElementById('salesCount').textContent = shiftData.sales.toString();
    document.getElementById('shiftStatus').textContent = shiftData.active ? 'ANO' : 'NE';
    localStorage.setItem('shiftData', JSON.stringify(shiftData));
}

// Funkce pro ukládání a historii
function savePricePerGram() {
    priceStorage.pricePerGram = document.getElementById('pricePerGram').value;
    localStorage.setItem('priceStorage', JSON.stringify(priceStorage));
}
function loadPricePerGram() {
    if (priceStorage.pricePerGram) {
        document.getElementById('pricePerGram').value = priceStorage.pricePerGram;
    }
}
function saveToHistory(calculation) {
    calculationsHistory.unshift(calculation);
    if (calculationsHistory.length > 50) calculationsHistory = calculationsHistory.slice(0, 50);
    localStorage.setItem('calculationsHistory', JSON.stringify(calculationsHistory));
}
function loadHistory() {
    const historyList = document.getElementById('historyList');
    if (calculationsHistory.length === 0) {
        historyList.innerHTML = '<div class="history-item">Žádná historie zatím</div>';
        return;
    }
    historyList.innerHTML = calculationsHistory.map(calc => `
        <div class="history-item">
            <strong>${calc.weight}g × ${calc.pricePerGram} Kč/g (+${calc.markup}%)</strong><br>
            ${calc.basePrice.toFixed(2)} Kč → <strong>${calc.finalPrice.toFixed(2)} Kč</strong><br>
            <small>${calc.date}</small>
        </div>
    `).join('');
}
function clearHistory() {
    calculationsHistory = [];
    localStorage.setItem('calculationsHistory', JSON.stringify(calculationsHistory));
    loadHistory();
}

// Načtení při startu
window.addEventListener('load', function() {
    loadPricePerGram();
    updateShiftDisplay();
    showTab('calculator'); // Výchozí záložka
});