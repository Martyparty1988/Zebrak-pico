let priceStorage = {};
let calculationsHistory = [];
let shiftData = {
active: false,
profit: 0,
sales: 0
};

if (‘serviceWorker’ in navigator) {
const swCode = `
const CACHE_NAME = ‘zebricky-v1’;
const urlsToCache = [’./’, ‘index.html’, ‘styles.css’, ‘script.js’, ‘manifest.json’];

```
    self.addEventListener('install', event => {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(cache => cache.addAll(urlsToCache))
        );
    });
    
    self.addEventListener('fetch', event => {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
    });
`;

const swBlob = new Blob([swCode], { type: 'application/javascript' });
const swUrl = URL.createObjectURL(swBlob);

navigator.serviceWorker.register(swUrl);
```

}

function showTab(tabName) {
document.querySelectorAll(’.tab’).forEach(tab => tab.classList.remove(‘active’));
document.querySelectorAll(’.tab-content’).forEach(content => content.classList.remove(‘active’));

```
event.target.classList.add('active');
document.getElementById(tabName).classList.add('active');

if (tabName === 'history') {
    loadHistory();
}
```

}

function calculate(markup) {
const weight = parseFloat(document.getElementById(‘weight’).value);
const pricePerGram = parseFloat(document.getElementById(‘pricePerGram’).value);

```
if (!weight) {
    document.getElementById('result').textContent = 'Zadej váhu!';
    return;
}

if (!pricePerGram) {
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
    </div>
`;
```

}

function isShiftActive() {
return shiftData.active;
}

function addToShift(profit) {
shiftData.profit += profit;
shiftData.sales += 1;
updateShiftDisplay();
}

function toggleShift() {
const btn = document.getElementById(‘shiftBtn’);

```
if (shiftData.active) {
    shiftData.active = false;
    btn.textContent = '🎯 Začít směnu';
    btn.classList.remove('shift-active');
    document.getElementById('shiftStatus').textContent = 'NE';
} else {
    shiftData.active = true;
    btn.textContent = '🛑 Ukončit směnu';
    btn.classList.add('shift-active');
    document.getElementById('shiftStatus').textContent = 'ANO';
}

updateShiftDisplay();
```

}

function resetShift() {
shiftData.profit = 0;
shiftData.sales = 0;
shiftData.active = false;

```
const btn = document.getElementById('shiftBtn');
btn.textContent = '🎯 Začít směnu';
btn.classList.remove('shift-active');

updateShiftDisplay();
```

}

function updateShiftDisplay() {
document.getElementById(‘totalProfit’).textContent = `${shiftData.profit.toFixed(2)} Kč`;
document.getElementById(‘salesCount’).textContent = shiftData.sales.toString();
document.getElementById(‘shiftStatus’).textContent = shiftData.active ? ‘ANO’ : ‘NE’;
}

function savePricePerGram() {
priceStorage.pricePerGram = document.getElementById(‘pricePerGram’).value;
}

function loadPricePerGram() {
if (priceStorage.pricePerGram) {
document.getElementById(‘pricePerGram’).value = priceStorage.pricePerGram;
}
}

function saveToHistory(calculation) {
calculationsHistory.unshift(calculation);
if (calculationsHistory.length > 50) {
calculationsHistory = calculationsHistory.slice(0, 50);
}
}

function loadHistory() {
const historyList = document.getElementById(‘historyList’);

```
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
```

}

function clearHistory() {
calculationsHistory = [];
loadHistory();
}

window.addEventListener(‘load’, function() {
loadPricePerGram();
updateShiftDisplay();
});
