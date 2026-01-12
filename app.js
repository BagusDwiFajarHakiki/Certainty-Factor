import { SYMPTOMS, HYPOTHESES, RULES } from './knowledge_base.js';
import { CertaintyFactorSystem } from './cf_logic.js';

// DOM Elements
const landingSection = document.getElementById('landing');
const testSection = document.getElementById('test');
const resultSection = document.getElementById('result');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const diagnosisForm = document.getElementById('diagnosisForm');
const symptomsContainer = document.getElementById('symptomsContainer');
const logContainer = document.getElementById('logContainer');
const logContent = document.getElementById('logContent');
const mainResultContainer = document.getElementById('mainResult');
const otherResultsContainer = document.getElementById('otherResults');
let resultChart = null;

// Initialize System
const cfSystem = new CertaintyFactorSystem(RULES, HYPOTHESES);
// Make sure landing page starts with desktop view
if (window.innerWidth < 1024) {
    // Only apply if starting on mobile/small screen to avoid weird jumps on actual desktop
    // But since logic is meta-tag based, just ensuring consistency
}

// Confidence Levels for User Input
const CONFIDENCE_LEVELS = [
    { value: 0, label: 'Tidak Yakin' },
    { value: 0.2, label: 'Sedikit Yakin' },
    { value: 0.4, label: 'Cukup Yakin' },
    { value: 0.6, label: 'Yakin' },
    { value: 0.8, label: 'Sangat Yakin' },
    { value: 1.0, label: 'Pasti / Mutlak' }
];

// Modal Elements
const rulesModal = document.getElementById('rulesModal');
const calcModal = document.getElementById('calcModal');
const showRulesBtn = document.getElementById('showRulesBtn');
const showCalcBtn = document.getElementById('showCalcBtn');
const closeButtons = document.querySelectorAll('.close-modal');

// Event Listeners
startBtn.addEventListener('click', () => {
    switchSection(landingSection, testSection);
    renderSymptoms();
});

restartBtn.addEventListener('click', () => {
    switchSection(resultSection, landingSection);
    diagnosisForm.reset();
});

diagnosisForm.addEventListener('submit', (e) => {
    e.preventDefault();
    processDiagnosis();
});

// Modal Actions
showRulesBtn.addEventListener('click', () => {
    rulesModal.style.display = 'block';
});

showCalcBtn.addEventListener('click', () => {
    calcModal.style.display = 'block';
});

closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        rulesModal.style.display = 'none';
        calcModal.style.display = 'none';
    });
});

window.addEventListener('click', (event) => {
    if (event.target === rulesModal) {
        rulesModal.style.display = 'none';
    }
    if (event.target === calcModal) {
        calcModal.style.display = 'none';
    }
});



// Functions
function switchSection(from, to) {
    from.style.display = 'none';
    to.style.display = 'block';
    
    // Default scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderSymptoms() {
    if (symptomsContainer.children.length > 0) return; // Prevent re-rendering

    SYMPTOMS.forEach(symptom => {
        const card = document.createElement('div');
        card.className = 'symptom-card';

        // Add Image Slot (Default to 'images/panduan.jpg' or symptom specific if available)
        // Since user said "1 image containing good and bad", we use a common guide image for now.
        // Users can replace 'images/panduan.jpg' with their file.
        const imgContainer = document.createElement('div');
        imgContainer.className = 'symptom-image';
        
        const img = document.createElement('img');
        // Prefer specific image if defined, else default
        img.src = symptom.image || 'images/panduan.jpg'; 
        img.alt = `Visual ${symptom.name}`;
        img.onerror = function() {
            this.style.display = 'none'; // Hide if image not found
            imgContainer.style.display = 'none';
        }
        
        imgContainer.appendChild(img);
        card.appendChild(imgContainer);

        const label = document.createElement('label');
        label.className = 'symptom-name';
        label.textContent = symptom.name;

        const select = document.createElement('select');
        select.className = 'cf-select';
        select.name = `symptom_${symptom.id}`;
        select.dataset.id = symptom.id;

        CONFIDENCE_LEVELS.forEach(level => {
            const option = document.createElement('option');
            option.value = level.value;
            option.textContent = level.label;
            select.appendChild(option);
        });

        card.appendChild(label);
        card.appendChild(select);
        symptomsContainer.appendChild(card);
    });
}

function processDiagnosis() {
    try {
        // 1. Collect inputs
        const inputs = [];
        const selects = symptomsContainer.querySelectorAll('select');
        
        selects.forEach(select => {
            const val = parseFloat(select.value);
            if (val > 0) {
                inputs.push({
                    symptomId: select.dataset.id,
                    cfUser: val
                });
            }
        });

        if (inputs.length === 0) {
            alert('Mohon pilih setidaknya satu gejala dengan keyakinan > 0.');
            return;
        }

        // 2. Calculate
        const output = cfSystem.calculate(inputs);
        const results = output.results;
        const logs = output.log;

        // 3. Render Results
        renderResults(results, inputs);
        renderRulesTable(); // New: Render rules
        
        try {
            if (typeof Chart !== 'undefined') {
                renderChart(results);
            } else {
                console.error("Chart.js is not loaded");
            }
        } catch (chartError) {
            console.error("Chart rendering error:", chartError);
        }

        renderLog(logs);

        switchSection(testSection, resultSection);
    } catch (e) {
        console.error(e);
        alert("Terjadi kesalahan sistem: " + e.message);
    }
}

function renderResults(results, inputs) {
    // Top Result
    const best = results[0];
    
    // Generate Dynamic Description based on User Input (>=0.6)
    let dynamicDescription = best.hypothesis.description;
    
    if (inputs) {
        const strongInputs = inputs.filter(i => i.cfUser >= 0.6);
        const traits = [];
        
        strongInputs.forEach(input => {
            // Check if this symptom supports the best hypothesis (MB > 0 is standard, or just check rule existence)
            const rule = RULES.find(r => r.symptomId === input.symptomId && r.hypothesisId === best.hypothesis.id && (r.mb > 0 || r.cfExpert > 0));
            
            if (rule) {
                const symptom = SYMPTOMS.find(s => s.id === input.symptomId);
                // Use the 'trait' field if available, otherwise name
                if (symptom && symptom.trait) {
                    traits.push(symptom.trait);
                } else if (symptom) {
                   traits.push(symptom.name);
                }
            }
        });

        if (traits.length > 0) {
            // Join traits with commas, add 'dan' for the last one
            let traitsText = '';
            if (traits.length === 1) {
                traitsText = traits[0];
            } else if (traits.length === 2) {
                traitsText = `${traits[0]} dan ${traits[1]}`;
            } else {
                const last = traits.pop();
                traitsText = `${traits.join(', ')}, dan ${last}`;
            }
            
            // Append to description
            dynamicDescription += ` ${traitsText}.`;
        } else {
            // Fallback if no specific traits with high confidence
            dynamicDescription += ` berdasarkan kombinasi gejala fisik yang terpantau.`;
        }
    }

    if (mainResultContainer) {
        mainResultContainer.innerHTML = `
            <div class="score-circle">
                ${best.percentage}
            </div>
            <h3 class="result-title">${best.hypothesis.name}</h3>
            <p class="result-desc">${dynamicDescription}</p>
            <div class="recommendation-box" style="margin-top:20px; padding:15px; background:#e8f5e9; border-radius:8px; border-left: 5px solid var(--primary-color); text-align: left;">
                <strong>Rekomendasi Tindakan:</strong><br/>
                ${best.hypothesis.recommendation || '-'}
            </div>
        `;
    }

    // Other Results
    if (otherResultsContainer) {
        otherResultsContainer.innerHTML = '';
        results.slice(1).forEach(res => {
            const item = document.createElement('div');
            item.className = 'result-item';
            item.innerHTML = `
                <span>${res.hypothesis.name}</span>
                <span>${res.percentage}</span>
            `;
            otherResultsContainer.appendChild(item);
        });
    }
}

function renderRulesTable() {
    const container = document.getElementById('rulesTableContainer');
    if (!container) return;

    let html = `
        <table class="rules-table">
            <thead>
                <tr>
                    <th>Kriteria</th>
                    <th>Potensi</th>
                    <th>MB</th>
                    <th>MD</th>
                    <th>CF</th>
                </tr>
            </thead>
            <tbody>
    `;

    RULES.forEach(rule => {
        const symptom = SYMPTOMS.find(s => s.id === rule.symptomId);
        const hypothesis = HYPOTHESES.find(h => h.id === rule.hypothesisId);
        
        // Handle legacy or new format
        const mb = rule.mb !== undefined ? rule.mb : '-';
        const md = rule.md !== undefined ? rule.md : '-';
        const cf = rule.cfExpert !== undefined ? rule.cfExpert : (rule.mb - rule.md).toFixed(2);
        
        html += `
            <tr>
                <td>${symptom ? symptom.name : rule.symptomId}</td>
                <td>${hypothesis ? hypothesis.name : rule.hypothesisId}</td>
                <td>${mb}</td>
                <td>${md}</td>
                <td>${cf}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function renderChart(results) {
    const canvas = document.getElementById('resultChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy previous chart if exists
    if (resultChart) {
        resultChart.destroy();
    }

    // FIXED ORDER: Petelur (P01), Pedaging (P02), Tidak Layak (P03)
    const fixedOrder = ['P01', 'P02', 'P03'];
    const fixedLabels = ['Petelur', 'Pedaging', 'Afkir'];
    const fixedColors = ['#4caf50', '#ff9800', '#f44336']; // Green, Orange, Red
    
    // Map results to this fixed order
    const data = fixedOrder.map(id => {
        const res = results.find(r => r.hypothesis.id === id);
        // Show 2 decimal places (not rounded to integer)
        return res ? (res.exactValue * 100).toFixed(2) : 0;
    });

    resultChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: fixedLabels,
            datasets: [{
                label: 'Tingkat Keyakinan (%)',
                data: data,
                backgroundColor: fixedColors,
                borderColor: [
                    '#388e3c',
                    '#f57c00',
                    '#d32f2f'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow resizing height
            plugins: {
                legend: {
                    display: false // Hide legend as bars are distinct
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + "%"
                        }
                    }
                }
            },
            animation: {
                onComplete: function () {
                    // Draw labels on top of bars manually since we can't ensure plugin usage easily
                    const ctx = this.ctx;
                    ctx.font = Chart.helpers.toFont({
                        family: "'Poppins', sans-serif",
                        size: 14,
                        style: 'normal',
                        weight: 'bold'
                    });
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillStyle = '#444';

                    this.data.datasets.forEach((dataset, i) => {
                        const meta = this.getDatasetMeta(i);
                        meta.data.forEach((bar, index) => {
                            const data = dataset.data[index];
                            if (data > 0) {
                                ctx.fillText(data + '%', bar.x, bar.y - 5);
                            }
                        });
                    });
                }
            }
        }
    });
}

function renderLog(logs) {
    if (logContent) {
        logContent.textContent = logs.join('\n');
    }
}
