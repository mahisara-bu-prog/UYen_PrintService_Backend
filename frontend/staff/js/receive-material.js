// receive-material.js

const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
let currentDate = new Date();
let selectedDate = new Date();

let RECEIVE_MATERIAL_DATA = null;

let selectedMaterial = "";
let selectedSubType = "";
let selectedType = "";

let receiveData = [];

function findMaterialId() {
    if (!selectedMaterial || !selectedType) return null;
    const catData = RECEIVE_MATERIAL_DATA[selectedMaterial];
    if (!catData) return null;
    const matchedItem = catData.items.find(i => i.material_name === selectedType);
    return matchedItem ? matchedItem.material_id : null;
}

async function loadData() {
    try {
        const tbody = document.querySelector('.receive-table tbody');
        if (tbody) tbody.innerHTML = createLoadingSpinner(7);
        
        const token = localStorage.getItem("authToken");
        const fetchOptions = {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        // Fetch options and data in parallel
        const [materialsRes, materialsRaw] = await Promise.all([
            fetch('http://18.142.232.26:8070/materials', fetchOptions).then(r => r.json()),
            fetch('http://18.142.232.26:8070/report-fetch/receive_report_fetch/', fetchOptions).then(r => r.json())
        ]);
        
        let MATERIALS_API_DATA = materialsRes;

        RECEIVE_MATERIAL_DATA = {};
        MATERIALS_API_DATA.forEach(mat => {
            const cat = mat.category || 'ทั่วไป';
            
            let subType = 'ทั่วไป';
            if (mat.properties && mat.properties.length > 0) {
                const sizeProp = mat.properties.find(p => p.property_name.toLowerCase() === 'size');
                if (sizeProp) subType = sizeProp.property_value;
                else subType = mat.properties[0].property_value;
            }

            const typeName = mat.material_name;

            if (!RECEIVE_MATERIAL_DATA[cat]) {
                RECEIVE_MATERIAL_DATA[cat] = {
                    subTypes: new Set(),
                    types: new Set(),
                    items: [],
                    stock: 0,
                    unit: mat.unit || 'หน่วย'
                };
            }
            
            RECEIVE_MATERIAL_DATA[cat].subTypes.add(subType);
            RECEIVE_MATERIAL_DATA[cat].types.add(typeName);
            RECEIVE_MATERIAL_DATA[cat].items.push(mat);
            RECEIVE_MATERIAL_DATA[cat].stock += mat.quantity;
        });

        Object.keys(RECEIVE_MATERIAL_DATA).forEach(cat => {
            RECEIVE_MATERIAL_DATA[cat].subTypes = Array.from(RECEIVE_MATERIAL_DATA[cat].subTypes);
            RECEIVE_MATERIAL_DATA[cat].types = Array.from(RECEIVE_MATERIAL_DATA[cat].types);
        });

        receiveData = (materialsRaw.data || []).map(w => {
            const matInfo = MATERIALS_API_DATA.find(m => m.material_id === w.material_id) || {};
            
            let subType = '-';
            if (matInfo.properties && matInfo.properties.length > 0) {
                const sizeProp = matInfo.properties.find(p => p.property_name.toLowerCase() === 'size');
                if (sizeProp) subType = sizeProp.property_value;
                else subType = matInfo.properties[0].property_value;
            }

            return {
                name: w.username || '-',
                matName: matInfo.category || '-',
                subType: subType,
                matType: w.material_name || '-',
                qty: w.amount || 0,
                date: w.created_at,
                note: w.note || '-'
            };
        });

        initReceiveDropdowns();
        renderReceiveTable();
    } catch (err) {
        alert(err.message);
    }
}

function renderReceiveTable() {
    const tbody = document.querySelector('.receive-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    receiveData.forEach((item, index) => {
        const tr = document.createElement('tr');
        if (index % 2 === 1) tr.classList.add('alt-row');
        
        const dateObj = new Date(item.date);
        const formattedDate = !isNaN(dateObj.getTime()) 
            ? `${String(dateObj.getDate()).padStart(2, '0')} ${["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][dateObj.getMonth()]} ${dateObj.getFullYear()}`
            : item.date;
        
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.matName}</td>
            <td>${item.subType || "-"}</td>
            <td>${item.matType}</td>
            <td>${item.qty}</td>
            <td>${formattedDate}</td>
            <td class="dash-red">${item.note}</td>
        `;
        tbody.appendChild(tr);
    });
}


function renderCalendar() {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    // Header shows the selected date similar to mockup
    document.querySelector('.current-month').innerText = `${String(selectedDate.getDate()).padStart(2, '0')} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear() + 543}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    const calendarDays = document.getElementById('calendar-days');
    let html = `
        <div class="calendar-day-header sunday">Su</div>
        <div class="calendar-day-header">Mo</div>
        <div class="calendar-day-header">Tu</div>
        <div class="calendar-day-header">We</div>
        <div class="calendar-day-header">Th</div>
        <div class="calendar-day-header">Fr</div>
        <div class="calendar-day-header">Sa</div>
    `;

    for (let i = 0; i < firstDayIndex; i++) {
        html += `<div></div>`;
    }

    for (let i = 1; i <= lastDay; i++) {
        const isSunday = new Date(year, month, i).getDay() === 0;
        const isSelected = selectedDate.getDate() === i && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;

        let classes = 'calendar-day';
        if (isSunday) classes += ' sunday';
        if (isSelected) classes += ' active';

        html += `<div class="${classes}" onclick="selectDate(${year}, ${month}, ${i})">${i}</div>`;
    }

    calendarDays.innerHTML = html;
}

function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    renderCalendar();
}

/**
 * Custom Dropdown Logic
 */
function toggleReceiveDropdown(listId) {
    // Close other dropdowns
    document.querySelectorAll('.custom-dropdown-list').forEach(el => {
        if (el.id !== listId) {
            el.classList.add('hidden');
            el.closest('.custom-dropdown-container').classList.remove('open');
        }
    });

    const list = document.getElementById(listId);
    const container = list.closest('.custom-dropdown-container');
    const isHidden = list.classList.contains('hidden');

    if (isHidden) {
        list.classList.remove('hidden');
        container.classList.add('open');
    } else {
        list.classList.add('hidden');
        container.classList.remove('open');
    }
}

function initReceiveDropdowns() {
    const matList = document.getElementById('list-receive-material');
    matList.innerHTML = '';
    Object.keys(RECEIVE_MATERIAL_DATA).forEach(mat => {
        const li = document.createElement('li');
        li.textContent = mat;
        li.onclick = () => selectMaterialItem(mat);
        matList.appendChild(li);
    });

    updateSubTypeList();
    updateTypeList();
}

function updateSubTypeList() {
    const subList = document.getElementById('list-receive-subtype');
    if (!subList) return;
    subList.innerHTML = '';

    const subTypes = selectedMaterial ? RECEIVE_MATERIAL_DATA[selectedMaterial].subTypes : getAllUniqueSubTypes();
    subTypes.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        li.onclick = () => selectSubTypeItem(s);
        if (s === selectedSubType) li.classList.add('selected');
        subList.appendChild(li);
    });
}

function updateTypeList() {
    const typeList = document.getElementById('list-receive-type');
    typeList.innerHTML = '';

    let types = [];
    if (selectedMaterial) {
        const data = RECEIVE_MATERIAL_DATA[selectedMaterial];
        if (data.types) {
            types = data.types;
        } else if (data.typesBySubType) {
            types = data.typesBySubType[selectedSubType] || data.typesBySubType['default'] || [];
        }
    } else {
        types = getAllUniqueTypes();
    }
    
    types.forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        li.onclick = () => selectTypeItem(t);
        if (t === selectedType) li.classList.add('selected');
        typeList.appendChild(li);
    });
}

function getAllUniqueSubTypes() {
    let all = [];
    Object.values(RECEIVE_MATERIAL_DATA).forEach(data => {
        all = all.concat(data.subTypes);
    });
    return [...new Set(all)];
}

function getAllUniqueTypes() {
    let all = [];
    Object.values(RECEIVE_MATERIAL_DATA).forEach(data => {
        if (data.types) {
            all = all.concat(data.types);
        } else if (data.typesBySubType) {
            Object.values(data.typesBySubType).forEach(tList => {
                all = all.concat(tList);
            });
        }
    });
    return [...new Set(all)];
}

function selectMaterialItem(mat) {
    selectedMaterial = mat;
    document.getElementById('receive-material-display').textContent = mat;
    document.getElementById('receive-material-display').style.color = '#1f2937';
    
    // Reset SubType and Type if not compatible
    if (selectedSubType && !RECEIVE_MATERIAL_DATA[mat].subTypes.includes(selectedSubType)) {
        selectedSubType = "";
        const subDisplay = document.getElementById('receive-subtype-display');
        if (subDisplay) {
            subDisplay.textContent = "เลือกชนิดวัสดุ";
            subDisplay.style.color = '#3b82f6';
        }
    }

    if (selectedType && !RECEIVE_MATERIAL_DATA[mat].types.includes(selectedType)) {
        selectedType = "";
        const typeDisplay = document.getElementById('receive-type-display').textContent = "เลือกประเภทวัสดุ";
        document.getElementById('receive-type-display').style.color = '#3b82f6';
    }

    updateSubTypeList();
    updateTypeList();
    clearSingleFieldError(document.getElementById('receive-material-display'));
    toggleReceiveDropdown('list-receive-material');
}

function selectSubTypeItem(sub) {
    selectedSubType = sub;
    const display = document.getElementById('receive-subtype-display');
    if (display) {
        display.textContent = sub;
        display.style.color = '#1f2937';
    }

    // Find Material if not selected
    if (!selectedMaterial) {
        for (const mat in RECEIVE_MATERIAL_DATA) {
            if (RECEIVE_MATERIAL_DATA[mat].subTypes.includes(sub)) {
                selectedMaterial = mat;
                document.getElementById('receive-material-display').textContent = mat;
                document.getElementById('receive-material-display').style.color = '#1f2937';
                updateSubTypeList();
                updateTypeList();
                break;
            }
        }
    }

    updateTypeList();
    clearSingleFieldError(display);
    toggleReceiveDropdown('list-receive-subtype');
}

function selectTypeItem(type) {
    selectedType = type;
    document.getElementById('receive-type-display').textContent = type;
    document.getElementById('receive-type-display').style.color = '#1f2937';

    // Find Material if not selected
    if (!selectedMaterial) {
        for (const mat in RECEIVE_MATERIAL_DATA) {
            if (RECEIVE_MATERIAL_DATA[mat].types.includes(type)) {
                selectedMaterial = mat;
                document.getElementById('receive-material-display').textContent = mat;
                document.getElementById('receive-material-display').style.color = '#1f2937';
                updateSubTypeList();
                updateTypeList();
                break;
            }
        }
    }

    clearSingleFieldError(document.getElementById('receive-type-display'));
    toggleReceiveDropdown('list-receive-type');
}

// Click outside to close
document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown-container')) {
        document.querySelectorAll('.custom-dropdown-list').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.custom-dropdown-container').forEach(el => el.classList.remove('open'));
    }
});

function flashError(element) {
    const originalBorder = element.style.borderColor;
    element.style.borderColor = '#ef4444';
    setTimeout(() => {
        element.style.borderColor = originalBorder || '';
    }, 2000);
}

function openConfirmModal() {
    const qtyInput = document.getElementById('receive-qty');
    const noteInput = document.getElementById('receive-note');

    const errors = [];

    if (!selectedMaterial) {
        errors.push({ input: document.getElementById('receive-material-display'), label: 'วัสดุที่รับ', message: 'กรุณาเลือกวัสดุ' });
    }

    if (!selectedSubType) {
        errors.push({ input: document.getElementById('receive-subtype-display'), label: 'ชนิดวัสดุที่รับ', message: 'กรุณาเลือกชนิดวัสดุ' });
    }

    if (!selectedType) {
        errors.push({ input: document.getElementById('receive-type-display'), label: 'ประเภทวัสดุที่รับ', message: 'กรุณาเลือกประเภทวัสดุ' });
    }

    const qtyValue = qtyInput.value.trim();
    if (!qtyValue) {
        errors.push({ input: qtyInput, label: 'จำนวนที่รับ', message: 'กรุณากรอกจำนวน' });
    } else {
        const qtyNum = parseInt(qtyValue, 10);
        if (qtyNum < 1) {
            errors.push({ input: qtyInput, label: 'จำนวนที่รับ', message: 'จำนวนต้องไม่น้อยกว่า 1' });
        }
    }

    if (errors.length > 0) {
        showValidationModal(errors);
        return;
    }

    const nameVal = document.getElementById('receive-name').value;
    const noteText = noteInput.value.trim() === '' ? '-' : noteInput.value;
    const formattedDate = `${String(selectedDate.getDate()).padStart(2, '0')} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear() + 543}`;

    const bodyHtml = `
        <div class="mb-15" style="text-align: left;>
            <label class="modal-label-standard">ชื่อผู้รับวัสดุ</label>
            <input type="text" class="modal-input-readonly-gray" readonly value="${nameVal}">
        </div>
        <div class="mb-15" style="text-align: left;>
            <label class="modal-label-standard">วัสดุที่รับ</label>
            <input type="text" class="modal-input-readonly-gray" readonly value="${selectedMaterial}">
        </div>
        <div class="mb-15" style="text-align: left;>
            <label class="modal-label-standard">ชนิดวัสดุที่รับ</label>
            <input type="text" class="modal-input-readonly-gray" readonly value="${selectedSubType}">
        </div>
        <div class="mb-15" style="text-align: left;>
            <label class="modal-label-standard">ประเภทวัสดุที่รับ</label>
            <input type="text" class="modal-input-readonly-gray" readonly value="${selectedType}">
        </div>
        <div class="mb-15" style="text-align: left;>
            <label class="modal-label-standard">จำนวนที่รับ</label>
            <input type="text" class="modal-input-readonly-gray" readonly value="${qtyInput.value}">
        </div>
        <div class="mb-15" style="text-align: left;>
            <label class="modal-label-standard">วันที่รับวัสดุ</label>
            <input type="text" class="modal-input-readonly-gray" readonly value="${formattedDate}">
        </div>
        <div class="mb-15" style="text-align: left;>
            <label class="modal-label-standard">หมายเหตุ</label>
            <input type="text" class="modal-input-readonly-gray" readonly value="${noteText}">
        </div>
    `;

    // Save values for table row generation
    window.__pendingReceiveData = {
        name: nameVal,
        matName: selectedMaterial,
        subType: selectedSubType,
        matType: selectedType,
        qty: qtyInput.value,
        date: `${String(selectedDate.getDate()).padStart(2, '0')} ${["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][selectedDate.getMonth()]} ${selectedDate.getFullYear()}`,
        note: noteText
    };

    showConfirmModal({
        title: 'ต้องการ รับวัสดุ ใช่หรือไม่ ?',
        bodyHtml: bodyHtml,
        confirmText: 'ยืนยันการรับวัสดุ',
        cancelText: 'ยกเลิก',
        confirmBtnClass: 'btn-confirm-receive-action',
        cancelBtnClass: 'btn-cancel-receive-action',
        headerClass: 'modal-receive-header',
        bodyClass: 'modal-receive-body text-center',
        actionsContainerClass: 'modal-receive-footer flex-center',
        onConfirm: async () => {
            await submitReceive();
        }
    });
}

async function submitReceive() {
    const data = window.__pendingReceiveData || {};
    const qty = parseInt(data.qty) || 0;
    const note = data.note || "-";
    const username = data.name || "Unknown";
    const material_id = findMaterialId();

    if (!material_id) {
        alert("ไม่พบรหัสวัสดุในระบบ กรุณาตรวจสอบการเลือกวัสดุ");
        return;
    }

    try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`http://18.142.232.26:8070/materials/${material_id}/receive`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: qty,
                note: note,
                username: username
            })
        });

        if (!res.ok) throw new Error("Failed to receive material");
        
        addReceiveRowToTable();
        resetReceiveForm();
        
        if (typeof window.showStatusModal === 'function') {
            window.showStatusModal('สำเร็จ', 'รับวัสดุสำเร็จ', 'success');
        }

        // Background refresh stock data
        await loadData();
    } catch (e) {
        console.error(e);
        alert("เกิดข้อผิดพลาดในการรับวัสดุ");
    }
}

function addReceiveRowToTable() {
    const data = window.__pendingReceiveData || {};
    const name = data.name || "-";
    const matName = data.matName || "-";
    const subType = data.subType || "-";
    const matType = data.matType || "-";
    const qty = data.qty || "0";
    const note = data.note || "-";
    const dateStr = data.date || "-";
    
    const tbody = document.querySelector('.receive-table tbody');
    if (!tbody) return;

    // Use selectedDate and a RANDOM time between 08:00 and 17:00
    const thaiShortMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    

    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
        <td>${name}</td>
        <td>${matName}</td>
        <td>${subType}</td>
        <td>${matType}</td>
        <td>${qty}</td>
        <td>${dateStr}</td>
        <td class="dash-red">${note}</td>
    `;

    // Prepend to show latest at top
    tbody.insertBefore(newRow, tbody.firstChild);

    // Update alternating row colors
    Array.from(tbody.rows).forEach((row, index) => {
        if (index % 2 === 1) {
            row.classList.add('alt-row');
        } else {
            row.classList.remove('alt-row');
        }
    });
}

function resetReceiveForm() {
    selectedMaterial = "";
    selectedSubType = "";
    selectedType = "";
    document.getElementById('receive-material-display').textContent = "เลือกวัสดุ";
    document.getElementById('receive-material-display').style.color = '#3b82f6';
    document.getElementById('receive-subtype-display').textContent = "เลือกชนิดวัสดุ";
    document.getElementById('receive-subtype-display').style.color = '#3b82f6';
    document.getElementById('receive-type-display').textContent = "เลือกประเภทวัสดุ";
    document.getElementById('receive-type-display').style.color = '#3b82f6';
    
    document.getElementById('receive-qty').value = '0';
    document.getElementById('receive-note').value = '';
    
    updateTypeList();
}

document.querySelector('.prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);

    // Auto select a valid day in the new month so the display header changes
    const maxDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const newDay = Math.min(selectedDate.getDate(), maxDays);
    selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), newDay);

    renderCalendar();
});

document.querySelector('.next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);

    const maxDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const newDay = Math.min(selectedDate.getDate(), maxDays);
    selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), newDay);

    renderCalendar();
});

window.onload = () => {
    loadData();
    syncReceiverName();
    renderCalendar();
};

/**
 * Syncs the name input with the username displayed in the navbar
 */
function syncReceiverName() {
    // Wait for navbar to load
    const checkNavbar = setInterval(() => {
        const navbarUsername = document.querySelector('.username');
        const nameInput = document.getElementById('receive-name');
        
        if (navbarUsername && nameInput) {
            nameInput.value = navbarUsername.innerText.trim();
            clearInterval(checkNavbar);
        }
    }, 100);

    // Timeout after 3 seconds
    setTimeout(() => clearInterval(checkNavbar), 3000);
}
