// report.js
let dailyPrintsData = [];
let stockData = [];
let monthlySalesData = [];

function formatDateForApi(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function fetchView1Data(dates) {
    try {
        const tbody1 = document.querySelector('#view-1 tbody');
        if (tbody1) tbody1.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 30px;"><div class="loader-spinner" style="margin: 0 auto 10px;"></div><div style="color:#6b7280;">กำลังโหลดข้อมูล...</div></td></tr>`;
        
        let startStr, endStr;
        if (dates.length === 2) {
            startStr = formatDateForApi(dates[0]);
            endStr = formatDateForApi(dates[1]);
        } else {
            startStr = formatDateForApi(dates[0]);
            endStr = startStr;
        }

        const res = await fetch(`http://18.142.232.26:8070/report-fetch/orders-by-date?start_date=${startStr}&end_date=${endStr}`, {
            headers: { 'accept': 'application/json' }
        });
        const data = await res.json();
        dailyPrintsData = data.data || [];
        renderView1();
    } catch(err) {
        console.error(err);
    }
}

async function fetchView3Data(dateObj) {
    try {
        const tbody3 = document.querySelector('#view-3 tbody');
        if (tbody3) tbody3.innerHTML = `<tr><td colspan="3" class="text-center" style="padding: 30px;"><div class="loader-spinner" style="margin: 0 auto 10px;"></div><div style="color:#6b7280;">กำลังโหลดข้อมูล...</div></td></tr>`;

        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();
        
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        
        const res = await fetch(`http://18.142.232.26:8070/report-fetch/orders-by-date?start_date=${startDate}&end_date=${endDate}`, {
            headers: { 'accept': 'application/json' }
        });
        const data = await res.json();
        const rawOrders = data.data || [];
        
        const grouped = {};
        rawOrders.forEach(o => {
            if (o.status === "Cancelled") return;
            const dStr = o.date;
            if (!grouped[dStr]) {
                grouped[dStr] = { date: dStr, items: 0, sales: 0 };
            }
            grouped[dStr].items += (o.copy_amount || 0);
            grouped[dStr].sales += (o.total_price || 0);
        });
        
        monthlySalesData = Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
        renderView3();
    } catch(err) {
        console.error(err);
    }
}

async function loadData() {
    try {
        const tbody2 = document.querySelector('#view-2 tbody');
        if (tbody2) tbody2.innerHTML = `<tr><td colspan="4" class="text-center" style="padding: 30px;"><div class="loader-spinner" style="margin: 0 auto 10px;"></div><div style="color:#6b7280;">กำลังโหลดข้อมูล...</div></td></tr>`;

        const res = await fetch('http://18.142.232.26:8070/report-fetch/stock_report_fetch/', {
            headers: { 'accept': 'application/json' }
        });
        const data = await res.json();
        stockData = data.data || [];
        renderView2();
    } catch (err) {
        console.error(err);
    }
}

function renderView1() {
    const tbody = document.querySelector('#view-1 tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (dailyPrintsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 20px;">ไม่พบข้อมูล</td></tr>`;
        return;
    }
    
    dailyPrintsData.forEach(item => {
        let timeStr = item.date;
        tbody.innerHTML += `
            <tr>
                <td class="report-td-left-padded">Order ID: ${item.order_id}</td>
                <td>-</td>
                <td>-</td>
                <td>${item.copy_amount || 0}</td>
                <td>${item.status}</td>
                <td>${timeStr}</td>
                <td><span class="text-blue">${item.total_price || 0}</span> บาท</td>
            </tr>
        `;
    });
}

function renderView2() {
    const tbody = document.querySelector('#view-2 tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (stockData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding: 20px;">ไม่พบข้อมูล</td></tr>`;
        return;
    }
    
    stockData.forEach(item => {
        const isLow = (item.quantity <= 25);
        const stockTdClass = isLow ? 'text-red' : '';
        const trClass = isLow ? 'bg-gray-lighter' : '';
        tbody.innerHTML += `
            <tr class="${trClass}">
                <td>${item.category || '-'}</td>
                <td>${item.material_name || '-'}</td>
                <td class="${stockTdClass}">${(item.quantity || 0).toLocaleString()} ${item.unit || ''}</td>
                <td>${item.price_per_unit || 0}</td>
            </tr>
        `;
    });
    
    filterLowStock();
}

function renderView3() {
    const tbody = document.querySelector('#view-3 tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (monthlySalesData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center" style="padding: 20px;">ไม่พบข้อมูล</td></tr>`;
        showAllMonthlySales();
        return;
    }
    
    monthlySalesData.forEach(item => {
        let dateStr = item.date;
        const d = new Date(item.date);
        if (!isNaN(d.getTime())) {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            dateStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
        }
        tbody.innerHTML += `
            <tr>
                <td class="report-td-left-wide-padded">${dateStr}</td>
                <td>${item.items.toLocaleString()}</td>
                <td><span class="text-blue">${item.sales.toLocaleString()}</span> บาท</td>
            </tr>
        `;
    });
    
    showAllMonthlySales();
}

document.addEventListener("DOMContentLoaded", function () {
    loadData();
    flatpickr("#report-date-1", {
        mode: "range",
        dateFormat: "d M Y",
        locale: "th",
        defaultDate: [new Date(), new Date()],
        onChange: function (selectedDates) {
            if (selectedDates.length > 0) fetchView1Data(selectedDates);
        },
        onReady: function (selectedDates) {
            if (selectedDates.length > 0) fetchView1Data(selectedDates);
        }
    });
    flatpickr("#report-date-3", {
        plugins: [
            new monthSelectPlugin({
                shorthand: true,
                dateFormat: "M / Y",
                altFormat: "F Y",
                theme: "light"
            })
        ],
        locale: "th",
        defaultDate: new Date(),
        onChange: function (selectedDates) {
            if (selectedDates.length > 0) fetchView3Data(selectedDates[0]);
        },
        onReady: function (selectedDates) {
            if (selectedDates.length > 0) fetchView3Data(selectedDates[0]);
        }
    });

    // Handle Report Downloads
    async function downloadReport(url, defaultFilename) {
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Download failed');
            
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            
            let filename = defaultFilename;
            const contentDisposition = res.headers.get('content-disposition');
            if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
                if (matches != null && matches[1]) { 
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            
        } catch(err) {
            console.error(err);
            alert('ดาวน์โหลดรายงานไม่สำเร็จ');
        }
    }

    document.getElementById('btn-print-1')?.addEventListener('click', () => {
        const fp1 = document.querySelector("#report-date-1")._flatpickr;
        const selectedDates = fp1.selectedDates;
        let startStr, endStr;
        if (selectedDates.length === 2) {
            startStr = formatDateForApi(selectedDates[0]);
            endStr = formatDateForApi(selectedDates[1]);
        } else {
            startStr = formatDateForApi(selectedDates[0] || new Date());
            endStr = startStr;
        }
        const url = `http://18.142.232.26:8070/reports/orders-by-date?start_date=${startStr}&end_date=${endStr}`;
        downloadReport(url, 'Daily_Print_Report.pdf');
    });

    document.getElementById('btn-print-2')?.addEventListener('click', () => {
        const url = `http://18.142.232.26:8070/reports/stockreport`;
        downloadReport(url, 'Inventory_Report.pdf');
    });

    document.getElementById('btn-print-3')?.addEventListener('click', () => {
        const fp3 = document.querySelector("#report-date-3")._flatpickr;
        const selectedDate = fp3.selectedDates[0] || new Date();
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const url = `http://18.142.232.26:8070/reports/orders-by-month?month=${year}-${month}`;
        downloadReport(url, 'Monthly_Sales_Report.pdf');
    });
});

function resetReportDate1() {
    const dateInput = document.getElementById("report-date-1");
    if (dateInput && dateInput._flatpickr) {
        dateInput._flatpickr.setDate(new Date());
    }
}

function showAllMonthlySales() {
    const tbody = document.querySelector('#view-3 .report-table tbody');
    const rows = tbody.querySelectorAll('tr');

    let totalItems = 0;
    let totalSales = 0;
    let visibleRows = 0;

    rows.forEach((row) => {
        row.classList.remove('hidden');
        visibleRows++;

        const itemsStr = row.cells[1].textContent.trim();
        const salesStr = row.cells[2].textContent.trim().replace(/,/g, '').replace('บาท', '').trim();

        totalItems += parseInt(itemsStr) || 0;
        totalSales += parseInt(salesStr) || 0;

        row.style.backgroundColor = (visibleRows % 2 === 1) ? '#fafafa' : '';
    });

    const summaryEls = document.querySelectorAll('#view-3 .report-summary-value');
    if (summaryEls.length >= 2) {
        summaryEls[0].textContent = totalItems.toLocaleString();
        summaryEls[1].textContent = totalSales.toLocaleString();
    }
}

function filterLowStock() {
    const isChecked = document.getElementById('low-stock-checkbox').checked;
    const tbody = document.querySelector('#view-2 .report-table tbody');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr');

    let visibleRows = 0;

    rows.forEach((row) => {
        const stockCell = row.cells[2];
        if (stockCell) {
            const stockText = stockCell.textContent.trim().replace(/,/g, '');
            const stockValue = parseFloat(stockText);

            if (!isChecked || stockValue <= 25) {
                row.classList.remove('hidden');
                visibleRows++;
                row.style.backgroundColor = (visibleRows % 2 === 0) ? '#fafafa' : '';
            } else {
                row.classList.add('hidden');
            }
        }
    });
}

// Old filterMonthlySales removed as data is now fetched directly for the month
function clearMonthlyFilter() {
    const fp = document.querySelector("#report-date-3")._flatpickr;
    if (fp) fp.setDate(new Date());
}

function switchTab(tabId) {
    // Hide all views
    document.querySelectorAll('.report-view').forEach(view => {
        view.classList.remove('active');
    });
    // Untoggle all tabs
    document.querySelectorAll('.report-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected view
    document.getElementById('view-' + tabId).classList.add('active');
    // Toggle selected tab
    document.getElementById('tab-btn-' + tabId).classList.add('active');
}
