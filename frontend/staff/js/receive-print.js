let receivePrintsData = [];
let historyData = [];

let PAPER_SIZES = [];
let PAPER_TYPES = [];

async function loadData() {
    try {
        const jobsList = document.getElementById('jobs-list');
        if (jobsList) jobsList.innerHTML = `<div class="loader-spinner" style="margin: 30px auto; display: block;"></div><div style="text-align:center; margin-bottom: 30px; color:#6b7280;">กำลังโหลดข้อมูลจากเซิร์ฟเวอร์...</div>`;

        const token = localStorage.getItem("authToken");
        const authHeaders = {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const [sizesRes, typesRes, jobsRes, completeRes] = await Promise.all([
            fetch('http://18.142.232.26:8070/orders/meta/paper-sizes', { headers: { 'accept': 'application/json' } }),
            fetch('http://18.142.232.26:8070/orders/meta/paper-types', { headers: { 'accept': 'application/json' } }),
            fetch('http://18.142.232.26:8070/orders/queue/printing', { headers: authHeaders }),
            fetch('http://18.142.232.26:8070/orders/queue/complete', { headers: authHeaders })
        ]);

        PAPER_SIZES = await sizesRes.json();
        PAPER_TYPES = await typesRes.json();
        
        if (jobsRes.ok) {
            receivePrintsData = await jobsRes.json();
        } else {
            receivePrintsData = [];
        }

        if (completeRes.ok) {
            const rawComplete = await completeRes.json();
            historyData = rawComplete.map(item => ({
                paper: getPaperTypeName(item.paper_type_id),
                type: getPaperSizeName(item.paper_size_id),
                qty: item.copy_amount,
                amount: item.total_price,
                note: item.note || '-',
                date: item.created_date
            }));
        } else {
            historyData = [];
        }

        populateFormOptions();

        renderJobsList();
        filterJobs();
        checkRemarks();
    } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการดึงข้อมูลงานพิมพ์");
    }
}

function getPaperSizeName(id) {
    const p = PAPER_SIZES.find(x => x.paper_size_id === id);
    return p ? p.name : 'ไม่ระบุ';
}

function getPaperTypeName(id) {
    const p = PAPER_TYPES.find(x => x.paper_type_id === id);
    return p ? p.name : 'ไม่ระบุ';
}

function renderJobsList() {
    const container = document.getElementById('jobs-list');
    if (!container) return;

    let html = '';

    receivePrintsData.forEach(job => {
        let statusBadgeText = 'รอพิมพ์เอกสาร';
        let badgeColorClass = 'bg-blue';
        let btnClass = 'downloaded';

        if (job.status === 'Printing') {
            statusBadgeText = 'กำลังดำเนินการ';
            badgeColorClass = 'bg-orange';
            btnClass = '';
        } else if (job.status === 'Completed' || job.status === 'Cancelled') {
            statusBadgeText = job.status === 'Completed' ? 'ดำเนินการสำเร็จ' : 'ยกเลิกแล้ว';
            badgeColorClass = job.status === 'Completed' ? 'bg-green' : 'bg-red';
            btnClass = 'finished';
        }

        const confirmDisabled = (job.status === 'Completed' || job.status === 'Cancelled') ? 'disabled' : '';

        // Formatter for DD - MM - YYYY
        const pad2 = (n) => String(n).padStart(2, '0');

        let orderDateStr = '-';
        if (job.created_date) {
            const od = new Date(job.created_date);
            if (!isNaN(od.getTime())) {
                orderDateStr = `${pad2(od.getDate())} - ${pad2(od.getMonth() + 1)} - ${od.getFullYear()}`;
            }
        }

        let receiveDateStr = '-';
        if (job.pickup_date) {
            const rd = new Date(job.pickup_date);
            if (!isNaN(rd.getTime())) {
                receiveDateStr = `${pad2(rd.getDate())} - ${pad2(rd.getMonth() + 1)} - ${rd.getFullYear()} / <span class="text-purple-accent">${pad2(rd.getHours())} : ${pad2(rd.getMinutes())}</span>`;
            }
        }

        const sizeName = getPaperSizeName(job.paper_size_id);
        const typeName = getPaperTypeName(job.paper_type_id);

        let itemsHtml = `
            <tr>
                <td>${job.file_name || '-'}</td>
                <td>${typeName}</td>
                <td>${sizeName}</td>
                <td>${job.file_path ? job.file_path.split('.').pop().toUpperCase() : '-'}</td>
                <td>${job.copy_amount}</td>
                <td>${job.total_price}</td>
                <td><button class="btn-download ${btnClass}" id="btn-${job.order_id}" onclick="initiateDownload('${job.order_id}')">⬇ ดาวน์โหลดไฟล์</button></td>
                <td class="text-color-red" data-fulltext="${job.note || '-'}">
                    <span class="remark-content">${job.note || '-'}</span>
                </td>
            </tr>
        `;

        html += `
            <div class="job-card job-online">
                <div class="job-header">
                    <div class="job-header-item">
                        <span class="job-header-label">คิว</span>
                        <span class="job-header-value">${job.order_id}</span>
                    </div>
                    <div class="job-header-divider"></div>
                    <div class="job-header-item">
                        <span class="job-header-label">สถานะงานพิมพ์</span>
                        <span class="badge-status ${badgeColorClass}" id="status-${job.order_id}">${statusBadgeText}</span>
                    </div>
                    <div class="job-header-divider"></div>
                    <div class="job-header-item">
                        <span class="job-header-label">รวมเงิน</span>
                        <span class="job-header-value">${job.total_price} บาท</span>
                    </div>
                    <div class="job-header-divider"></div>
                    <div class="job-header-item">
                        <span class="job-header-label">วันที่สั่งพิมพ์</span>
                        <span class="job-header-value">${orderDateStr}</span>
                    </div>
                    <div class="job-header-divider"></div>
                    <div class="job-header-item">
                        <span class="job-header-label">วันและเวลารับงานพิมพ์</span>
                        <span class="job-header-value">${receiveDateStr}</span>
                    </div>
                    <div class="job-header-right">
                        <button class="btn-confirm-success" id="btn-confirm-${job.order_id}" onclick="confirmSuccess('${job.order_id}')" ${confirmDisabled}>ยืนยันพิมพ์งานสำเร็จ</button>
                    </div>
                </div>
                <table class="job-table">
                    <thead>
                        <tr>
                            <th class="w-15">ชื่อไฟล์</th>
                            <th class="w-15">ประเภทงานพิมพ์</th>
                            <th class="w-10">ขนาดเอกสาร</th>
                            <th class="w-15">ประเภทเอกสาร</th>
                            <th class="w-10">จำนวน(ชุด)</th>
                            <th class="w-10">ราคา</th>
                            <th class="w-15">ไฟล์เอกสาร</th>
                            <th class="w-10">หมายเหตุ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
            </div>
        `;
    });

    if (receivePrintsData.length === 0) {
        html = '<div style="text-align:center; padding: 20px; color:#6b7280;">ไม่มีรายการงานพิมพ์</div>';
    }

    container.innerHTML = html;
}

function setTheme(theme) {
    document.body.className = '';
    document.body.classList.add('theme-' + theme);

    // Toggle Active Class on Buttons
    document.querySelectorAll('.btn-toggle').forEach(btn => {
        btn.classList.toggle('active', btn.classList.contains(theme));
    });

    const jobsView = document.getElementById('main-jobs-view');
    const recordView = document.getElementById('record-print-view');

    if (theme === 'record') {
        if (jobsView) jobsView.classList.add('hidden');
        if (recordView) recordView.classList.remove('hidden');
        renderHistoryTable();
        initHistoryFlatpickr();
    } else {
        if (jobsView) jobsView.classList.remove('hidden');
        if (recordView) recordView.classList.add('hidden');
        filterJobs();
    }
}


function populateFormOptions() {
    const paperSelect = document.getElementById('rec-paper-type');
    const sizeSelect = document.getElementById('rec-paper-size');

    if (paperSelect) {
        paperSelect.innerHTML = '<option value="" disabled selected hidden>ชนิดของกระดาษ</option>';
        PAPER_TYPES.forEach(opt => {
            const optionEl = document.createElement('option');
            optionEl.value = opt.paper_type_id;
            optionEl.textContent = opt.name;
            paperSelect.appendChild(optionEl);
        });
    }

    if (sizeSelect) {
        sizeSelect.innerHTML = '<option value="" disabled selected hidden>ขนาดกระดาษ</option>';
        PAPER_SIZES.forEach(opt => {
            const optionEl = document.createElement('option');
            optionEl.value = opt.paper_size_id;
            optionEl.textContent = opt.name;
            sizeSelect.appendChild(optionEl);
        });
    }
}

function renderHistoryTable() {
    const tbody = document.getElementById('history-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const dateInput = document.getElementById("historyDateFilter");
    const filterDate = dateInput ? dateInput.value : '';

    historyData.forEach(row => {
        let dateStr = row.date;
        const hd = new Date(row.date);
        if (!isNaN(hd.getTime())) {
            dateStr = `${String(hd.getDate()).padStart(2, '0')}/${String(hd.getMonth() + 1).padStart(2, '0')}/${hd.getFullYear()}`;
        }

        if (filterDate && dateStr !== filterDate) return;

        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${row.paper}</td>
            <td>${row.type}</td>
            <td>${row.qty}</td>
            <td>${row.amount}</td>
            <td class="text-color-red" style="font-size:12px;">${row.note}</td>
            <td>${dateStr}</td>
        `;
        tbody.appendChild(tr);
    });
}

function initHistoryFlatpickr() {
    if (!document.getElementById("historyDateFilter")._flatpickr) {
        flatpickr("#historyDateFilter", {
            dateFormat: "d/m/Y",
            locale: "th",
            onChange: function() {
                renderHistoryTable();
            }
        });
    }
}

function resetHistoryDateFilter() {
    const dateInput = document.getElementById("historyDateFilter");
    if (dateInput && dateInput._flatpickr) {
        dateInput._flatpickr.clear();
        renderHistoryTable();
    }
}

function showConfirmRecordModal() {
    const paperEl = document.getElementById('rec-paper-type');
    const sizeEl = document.getElementById('rec-paper-size');
    const qtyEl = document.getElementById('rec-qty');
    const totalEl = document.getElementById('rec-total');
    const noteEl = document.getElementById('rec-note');
    const fileEl = document.getElementById('rec-file');

    const paper_type_id = paperEl.value;
    const paper_size_id = sizeEl.value;
    const qty = parseFloat(qtyEl.value);
    const total = parseFloat(totalEl.value);
    let note = noteEl.value.trim();

    const qtyRaw = qtyEl.value.toLowerCase();
    const totalRaw = totalEl.value.toLowerCase();

    const errors = [];
    if (!paper_type_id) errors.push({ input: paperEl, label: 'ชนิดกระดาษ', message: 'กรุณาเลือกชนิดกระดาษ' });
    if (!paper_size_id) errors.push({ input: sizeEl, label: 'ขนาดกระดาษ', message: 'กรุณาเลือกขนาดกระดาษ' });
    if (!fileEl.files || fileEl.files.length === 0) errors.push({ input: fileEl, label: 'ไฟล์งานพิมพ์', message: 'กรุณาอัปโหลดไฟล์งานพิมพ์' });

    if (isNaN(qty) || qty < 1 || qty > 1000 || qtyRaw.includes('e')) {
        errors.push({ input: qtyEl, label: 'จำนวนชุด', message: 'กรุณาระบุจำนวนชุดระหว่าง 1 - 1,000 (ห้ามใส่ตัวอักษร e)' });
    }

    if (isNaN(total) || total < 1 || total > 99999 || totalRaw.includes('e')) {
        errors.push({ input: totalEl, label: 'ยอดเงินรวม', message: 'กรุณาระบุยอดเงินรวมระหว่าง 1 - 99,999 (ห้ามใส่ตัวอักษร e)' });
    }

    if (errors.length > 0) {
        if (typeof showValidationModal === 'function') {
            showValidationModal(errors);
        } else {
            alert('กรุณาตรวจสอบข้อมูล: ' + errors.map(e => e.message).join('\n'));
        }
        return;
    }

    // Default note if empty
    if (!note) note = '-';

    const overlay = document.createElement('div');
    overlay.id = 'confirm-record-modal-overlay';
    overlay.style.cssText = [
        'position:fixed', 'inset:0', 'background:rgba(0,0,0,0.5)',
        'z-index:9999', 'display:flex', 'justify-content:center',
        'align-items:center', 'backdrop-filter:blur(3px)', 'padding:20px'
    ].join(';');

    const modal = document.createElement('div');
    modal.style.cssText = [
        'background:#fff', 'border-radius:18px', 'overflow:hidden',
        'max-width:500px', 'width:100%', 'box-shadow:0 20px 40px rgba(0,0,0,0.1)',
        'font-family:"Prompt",sans-serif', 'opacity:0', 'transform:translateY(-10px)',
        'transition:all 0.3s'
    ].join(';');

    // Header - Bright Green
    const header = document.createElement('div');
    header.style.cssText = 'background:#22c55e;padding:20px;color:white;text-align:center;';
    header.innerHTML = '<h2 style="margin:0;font-size:22px;font-weight:700;">ยืนยันบันทึกงานพิมพ์หน้าร้าน</h2>';

    // Body
    const body = document.createElement('div');
    body.style.cssText = 'padding:25px;display:flex;flex-direction:column;gap:15px;';

    const createInfoRow = (label, value) => `
        <div style="display:flex;justify-content:space-between;border-bottom:1px solid #f1f5f9;padding-bottom:10px;">
            <span style="font-weight:600;color:#64748b;">${label}</span>
            <span style="font-weight:500;color:#1e293b;">${value}</span>
        </div>
    `;

    body.innerHTML = `
        ${createInfoRow('ชนิดวัสดุ', getPaperTypeName(parseInt(paper_type_id)))}
        ${createInfoRow('ขนาดกระดาษ', getPaperSizeName(parseInt(paper_size_id)))}
        ${createInfoRow('ไฟล์งาน', fileEl.files[0].name)}
        ${createInfoRow('จำนวนชุด', qty)}
        ${createInfoRow('ยอดเงินรวม', total + ' บาท')}
        <div style="display:flex;flex-direction:column;gap:5px;">
            <span style="font-weight:600;color:#64748b;">หมายเหตุ</span>
            <div style="background:#f8fafc;padding:12px;border-radius:8px;font-size:14px;color:#1e293b;border:1px solid #e2e8f0;">${note}</div>
        </div>
    `;

    // Footer
    const footer = document.createElement('div');
    footer.style.cssText = 'padding:20px;display:flex;justify-content:center;gap:15px;background:#fcfcfc;border-top:1px solid #f1f5f9;';

    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'ยกเลิก';
    cancelBtn.style.cssText = 'padding:10px 30px;border-radius:8px;border:1px solid #d1d5db;background:white;color:#4b5563;cursor:pointer;font-weight:600;';
    cancelBtn.onclick = () => {
        overlay.remove();
    };

    const confirmBtn = document.createElement('button');
    confirmBtn.innerText = 'ยืนยันบันทึกข้อมูล';
    confirmBtn.style.cssText = 'padding:10px 30px;border-radius:8px;border:none;background:#22c55e;color:white;cursor:pointer;font-weight:700;box-shadow:0 4px 10px rgba(34,197,94,0.3);';
    confirmBtn.onclick = () => {
        handleRecordPrint(paper_type_id, paper_size_id, qty, total, note, fileEl.files[0]);
        overlay.remove();
    };

    footer.append(confirmBtn, cancelBtn);
    modal.append(header, body, footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modal.style.transform = 'translateY(0)';
    });
}

async function handleRecordPrint(paper_type_id, paper_size_id, qty, total, note, file) {
    const price_per_unit = total / qty;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const fd = new FormData();
    // Assuming generic walk-in user ID is 1. Alternatively, we could fetch customer if it's not walk-in, 
    // but the API requires a user_id.
    fd.append('user_id', '1'); 
    fd.append('paper_size_id', paper_size_id);
    fd.append('paper_type_id', paper_type_id);
    fd.append('copy_amount', qty);
    fd.append('price_per_unit', price_per_unit);
    fd.append('pickup_date', tomorrow.toISOString().split('T')[0]);
    fd.append('note', note);
    fd.append('file', file);

    try {
        const token = localStorage.getItem("authToken");
        const res = await fetch('http://18.142.232.26:8070/orders/create', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: fd
        });

        if (!res.ok) throw new Error("Failed to create order");
        
        document.getElementById('record-form').reset();
        await loadData();
        
        if (typeof window.showStatusModal === 'function') {
            window.showStatusModal('บันทึกสำเร็จ', 'ข้อมูลถูกบันทึกเข้าสู่ระบบเรียบร้อยแล้ว', 'success');
        } else {
            alert('บันทึกสำเร็จ');
        }
    } catch (e) {
        console.error(e);
        alert("เกิดข้อผิดพลาดในการบันทึกงาน");
    }
}

function resetDateFilter() {
    const dateInput = document.getElementById("dateFilter");
    if (dateInput && dateInput._flatpickr) {
        dateInput._flatpickr.clear();
    }
}

function filterJobs() {
    const statusFilter = document.getElementById('statusFilter') ? document.getElementById('statusFilter').value : 'ทั้งหมด';
    const dateFilter = document.getElementById('dateFilter') ? document.getElementById('dateFilter').value : '';

    const jobCards = document.querySelectorAll('.job-card');

    jobCards.forEach(card => {
        let showCard = true;

        // 1. Status Match
        if (showCard && statusFilter !== 'ทั้งหมด') {
            const statusElement = card.querySelector('.badge-status');
            const statusText = statusElement ? statusElement.textContent.trim() : '';
            if (statusText !== statusFilter) showCard = false;
        }

        // 2. Date Match
        if (showCard && dateFilter) {
            let dateMatch = false;
            const headerItems = card.querySelectorAll('.job-header-item');
            headerItems.forEach(item => {
                const label = item.querySelector('.job-header-label');
                if (label && label.textContent.includes('วันที่สั่งพิมพ์')) {
                    const val = item.querySelector('.job-header-value');
                    if (val) {
                        const cardDateStr = val.textContent.trim(); // format: "15 - 03 - 2026"
                        if (cardDateStr === dateFilter) {
                            dateMatch = true;
                        }
                    }
                }
            });
            if (!dateMatch) showCard = false;
        }

        card.classList.toggle('hidden', !showCard);
    });
    checkRemarks();
}

async function initiateDownload(queueId) {
    try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`http://18.142.232.26:8070/orders/download/${queueId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Download failed');
        
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        // Extract filename from Content-Disposition if possible
        let filename = `order_${queueId}_file`;
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
        window.URL.revokeObjectURL(url);
        
        // 2. Update Status Badge via API
        const statusBadge = document.getElementById('status-' + queueId);
        if (statusBadge && statusBadge.textContent === 'รอพิมพ์เอกสาร') {
            const updated = await updateOrderStatusAPI(queueId, 'Printing');
            if (updated) {
                statusBadge.textContent = 'กำลังดำเนินการ';
                statusBadge.classList.remove('bg-blue');
                statusBadge.classList.add('bg-orange');
            }
        }

        // 3. Update Button Style
        const btn = document.getElementById('btn-' + queueId);
        if (btn) {
            btn.classList.remove('downloaded');
        }
    } catch(err) {
        console.error(err);
        alert('ดาวน์โหลดไฟล์ไม่สำเร็จ');
    }
}

async function updateOrderStatusAPI(queueId, status) {
    try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`http://18.142.232.26:8070/orders/${queueId}/status?status=${status}`, {
            method: 'PUT',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) {
            console.error("Failed to update status on server");
            return false;
        }
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

async function confirmSuccess(queueId) {
    const success = await updateOrderStatusAPI(queueId, 'Completed');
    if (!success) {
        alert("ไม่สามารถอัปเดตสถานะเป็น ดำเนินการสำเร็จ ได้");
        return;
    }

    // 1. Update Status Badge
    const statusBadge = document.getElementById('status-' + queueId);
    if (statusBadge) {
        statusBadge.textContent = 'ดำเนินการสำเร็จ';
        statusBadge.classList.remove('bg-blue', 'bg-orange');
        statusBadge.classList.add('bg-green');
    }

    // 2. Disable Download Button (Turn Red)
    const downloadBtn = document.getElementById('btn-' + queueId);
    if (downloadBtn) {
        downloadBtn.classList.remove('downloaded');
        downloadBtn.classList.add('finished');
    }

    // 3. Disable Confirm Button
    const confirmBtn = document.getElementById('btn-confirm-' + queueId);
    if (confirmBtn) {
        confirmBtn.disabled = true;
    }
}

function checkRemarks() {
    const remarks = document.querySelectorAll('.remark-content');
    remarks.forEach(span => {
        const td = span.closest('td');
        const fullText = td.getAttribute('data-fulltext');

        // If text overflows, we just keep the CSS tooltip ready
        if (span.scrollWidth > span.clientWidth) {
            td.classList.add('has-overflow');
        } else {
            td.classList.remove('has-overflow');
        }
    });
}

window.addEventListener('resize', checkRemarks);

document.addEventListener("DOMContentLoaded", function () {
    flatpickr("#dateFilter", {
        dateFormat: "d - m - Y",
        locale: "th",
        onChange: function (selectedDates, dateStr, instance) {
            filterJobs();
        }
    });
    loadData();
});
