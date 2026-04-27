// public/app.js

// Graficul din dreapta
Chart.defaults.color = 'rgba(255, 255, 255, 0.4)';
Chart.defaults.font.family = '"Plus Jakarta Sans"';

new Chart(document.getElementById('mainChart'), {
    type: 'line',
    data: {
        labels: ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun'],
        datasets: [{
            label: 'Valoare Stoc (RON)',
            data: [12000, 19000, 15000, 25000, 22000, 30000],
            borderColor: '#22d3ee', // cyan-400
            backgroundColor: 'rgba(34, 211, 238, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#0f172a',
            pointBorderColor: '#22d3ee',
            pointBorderWidth: 2,
            pointRadius: 4,
        }]
    },
    options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { border: { display: false }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            x: { border: { display: false }, grid: { display: false } }
        }
    }
});

// Logica de căutare și adăugare
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const resultContainer = document.getElementById('resultContainer');
const addFormContainer = document.getElementById('addFormContainer');
const saveBtn = document.getElementById('saveBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');

let currentSearchTerm = '';

const showToast = (message, type = 'info') => {
    toastMessage.textContent = message;
    toastIcon.className = 'fa-solid text-xl ';
    
    if(type === 'error') toastIcon.className += 'fa-circle-xmark text-red-400';
    else if(type === 'success') toastIcon.className += 'fa-circle-check text-cyan-400';
    else toastIcon.className += 'fa-circle-info text-blue-400';

    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
};

const renderProductCard = (product) => {
    resultContainer.innerHTML = `
        <div class="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-lg relative overflow-hidden group backdrop-blur-sm">
            <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            
            <div class="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <span class="inline-block px-2 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider rounded-md mb-2">Găsit</span>
                    <h2 class="text-2xl font-extrabold text-white capitalize">${product.name}</h2>
                </div>
                <div class="bg-white/10 border border-white/10 text-white font-extrabold text-xl px-4 py-2 rounded-xl">
                    ${parseFloat(product.price).toFixed(2)} RON
                </div>
            </div>
            
            <div class="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 relative z-10">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <i class="fa-solid fa-box-open"></i>
                    </div>
                    <div>
                        <p class="text-xs font-bold text-slate-400 uppercase">Cantitate Disponibilă</p>
                        <p class="font-extrabold text-white text-lg">${product.quantity} bucăți</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    resultContainer.classList.remove('hidden');
    addFormContainer.classList.add('hidden');
};

searchBtn.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (!query) return showToast('Introdu un nume de produs pentru a căuta!', 'error');

    const originalBtnHTML = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Se caută...';
    searchBtn.disabled = true;
    currentSearchTerm = query;

    try {
        await new Promise(r => setTimeout(r, 400)); 
        const response = await fetch(`/api/search?name=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.found) {
            renderProductCard(data.product);
            showToast('Date preluate cu succes!', 'success');
        } else {
            resultContainer.innerHTML = `
                <div class="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex items-start backdrop-blur-sm">
                    <i class="fa-solid fa-triangle-exclamation text-red-400 text-xl mr-4 mt-1"></i>
                    <div>
                        <p class="font-bold text-red-200 text-lg">Nu a fost găsit</p>
                        <p class="text-sm text-red-300/80 mt-1">Produsul nu se află în baza de date. Completează formularul de mai jos pentru a-l adăuga instant.</p>
                    </div>
                </div>
            `;
            resultContainer.classList.remove('hidden');
            addFormContainer.classList.remove('hidden');
            showToast('Produsul nu există în sistem.', 'error');
        }
    } catch (err) {
        showToast('Eroare la conexiunea cu serverul Node.js.', 'error');
    } finally {
        searchBtn.innerHTML = originalBtnHTML;
        searchBtn.disabled = false;
    }
});

saveBtn.addEventListener('click', async () => {
    const price = document.getElementById('newPrice').value;
    const quantity = document.getElementById('newQuantity').value;

    if (!price || !quantity) return showToast('Te rog completează prețul și cantitatea!', 'error');

    const originalBtnHTML = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Se salvează...';
    saveBtn.disabled = true;

    try {
        await new Promise(r => setTimeout(r, 500)); 
        const response = await fetch('/api/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: currentSearchTerm, price: price, quantity: quantity })
        });

        const data = await response.json();
        if (data.success) {
            document.getElementById('newPrice').value = '';
            document.getElementById('newQuantity').value = '';
            showToast('Produsul a fost adăugat și salvat în JSON!', 'success');
            renderProductCard(data.product);
        }
    } catch (err) {
        showToast('A apărut o eroare la salvare.', 'error');
    } finally {
        saveBtn.innerHTML = originalBtnHTML;
        saveBtn.disabled = false;
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBtn.click();
});