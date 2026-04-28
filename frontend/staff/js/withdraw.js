// withdraw.js
let withdrawData = [];

async function loadData() {
    try {
        const tbody = document.querySelector('.withdraw-table tbody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 30px;"><div class="loader-spinner" style="margin: 0 auto 10px;"></div><div style="color:#6b7280;">กำลังโหลดข้อมูลจำลองผ่าน JWT Flow...</div></td></tr>`;
        
        const token = localStorage.getItem("authToken");
        const fetchOptions = {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const [materialsRes, withdrawsRaw] = await Promise.all([
            fetch('http://18.142.232.26:8070/materials', fetchOptions).then(r => r.json()),
            fetch('http://18.142.232.26:8070/report-fetch/withdraw_report_fetch/', fetchOptions).then(r => r.json())
        ]);

        let MATERIALS_API_DATA = materialsRes;

        MATERIAL_DATA = {};
        MATERIALS_API_DATA.forEach(mat => {
            const cat = mat.category || 'ทั่วไป';
            
            let subType = 'ทั่วไป';
            if (mat.properties && mat.properties.length > 0) {
                const sizeProp = mat.properties.find(p => p.property_name.toLowerCase() === 'size');
                if (sizeProp) subType = sizeProp.property_value;
                else subType = mat.properties[0].property_value;
            }

            const typeName = mat.material_name;

            if (!MATERIAL_DATA[cat]) {
                MATERIAL_DATA[cat] = {
                    subTypes: new Set(),
                    types: new Set(),
                    items: [],
                    stock: 0,
                    unit: mat.unit || 'หน่วย'
                };
            }
            
            MATERIAL_DATA[cat].subTypes.add(subType);
            MATERIAL_DATA[cat].types.add(typeName);
            MATERIAL_DATA[cat].items.push(mat);
            MATERIAL_DATA[cat].stock += mat.quantity;
        });

        Object.keys(MATERIAL_DATA).forEach(cat => {
            MATERIAL_DATA[cat].subTypes = Array.from(MATERIAL_DATA[cat].subTypes);
            MATERIAL_DATA[cat].types = Array.from(MATERIAL_DATA[cat].types);
        });

        withdrawData = (withdrawsRaw.data || []).map(w => {
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

        initWithdrawDropdowns();
        updateSummary();
        renderWithdrawTable();
    } catch (err) {
        alert(err.message);
    }
}

function renderWithdrawTable() {
    const tbody = document.querySelector('.withdraw-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    withdrawData.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.className = index % 2 === 0 ? 'bg-white' : 'alt-row bg-gray-light';
        const tdClass = index % 2 === 0 ? 'bold-text withdraw-td-std' : 'bold-text withdraw-td-std withdraw-alt-td';
        
        const dateObj = new Date(item.date);
        const formattedDate = !isNaN(dateObj.getTime()) 
            ? `${String(dateObj.getDate()).padStart(2, '0')} ${["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][dateObj.getMonth()]} ${dateObj.getFullYear()}`
            : item.date;

        tr.innerHTML = `
            <td class="${tdClass}">${item.name}</td>
            <td class="${tdClass}">${item.matName}</td>
            <td class="${tdClass}">${item.subType || "-"}</td>
            <td class="${tdClass}">${item.matType}</td>
            <td class="${tdClass}">${item.qty}</td>
            <td class="${tdClass}">${formattedDate}</td>
            <td class="${tdClass}">${item.note}</td>
        `;
        tbody.appendChild(tr);
    });
}

let MATERIAL_DATA = null;

let selectedMaterial = "";
let selectedSubType = "";
let selectedType = "";

function findMaterialId() {
    if (!selectedMaterial || !selectedType) return null;
    const catData = MATERIAL_DATA[selectedMaterial];
    if (!catData) return null;
    const matchedItem = catData.items.find(i => i.material_name === selectedType);
    return matchedItem ? matchedItem.material_id : null;
}

function updateSummary() {
    const qty = document.getElementById('withdraw-qty').value;

    const matNameBox = document.getElementById('summary-mat-name');
    const matTypeBox = document.getElementById('summary-mat-type');
    const stockBox = document.getElementById('summary-stock');
    const qtyBox = document.getElementById('summary-qty');

    // Update Material Name + SubType
    if (selectedMaterial) {
        const data = MATERIAL_DATA[selectedMaterial];
        let stock = data ? data.stock : "คลัง";
        const unit = data ? data.unit : "หน่วย";

        // If specific type is selected, show its stock instead of aggregate
        if (selectedType && data) {
            const matchedItem = data.items.find(i => i.material_name === selectedType);
            if (matchedItem) stock = matchedItem.quantity;
        }

        const displayName = selectedSubType ? `${selectedMaterial} + ${selectedSubType}` : selectedMaterial;
        if (matNameBox) matNameBox.innerText = displayName;
        
        if (stockBox) {
            stockBox.innerHTML = '<div style="font-size: 32px; font-weight: 700; color: #0f172a; line-height: 1.2;">' + stock + '</div><div class="unit-text" style="font-size: 22px; color: #0ea5e9; font-weight: 500;">' + unit + '</div>';
        }
    } else {
        if (matNameBox) matNameBox.innerText = 'วัสดุ + ชนิดวัสดุ';
        if (stockBox) {
            stockBox.innerHTML = '<div style="font-size: 32px; font-weight: 700; color: #0f172a; line-height: 1.2;">คลัง</div><div class="unit-text" style="font-size: 22px; color: #0ea5e9; font-weight: 500;">หน่วย</div>';
        }
    }

    // Update Material Type
    if (selectedType) {
        if (matTypeBox) matTypeBox.innerText = selectedType;
    } else {
        if (matTypeBox) matTypeBox.innerText = 'ประเภทวัสดุ';
    }

    if (qtyBox) qtyBox.innerText = qty ? qty : '';
}

/**
 * Custom Dropdown Logic
 */
function toggleWithdrawDropdown(listId) {
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

function initWithdrawDropdowns() {
    const matList = document.getElementById('list-withdraw-material');
    matList.innerHTML = '';
    Object.keys(MATERIAL_DATA).forEach(mat => {
        const li = document.createElement('li');
        li.textContent = mat;
        li.onclick = () => selectMaterialItem(mat);
        matList.appendChild(li);
    });

    updateSubTypeList();
    updateTypeList();
}

function updateSubTypeList() {
    const subList = document.getElementById('list-withdraw-subtype');
    if (!subList) return;
    subList.innerHTML = '';

    const subTypes = selectedMaterial ? MATERIAL_DATA[selectedMaterial].subTypes : getAllUniqueSubTypes();
    subTypes.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        li.onclick = () => selectSubTypeItem(s);
        if (s === selectedSubType) li.classList.add('selected');
        subList.appendChild(li);
    });
}

function updateTypeList() {
    const typeList = document.getElementById('list-withdraw-type');
    typeList.innerHTML = '';

    let types = [];
    if (selectedMaterial) {
        const data = MATERIAL_DATA[selectedMaterial];
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
    Object.values(MATERIAL_DATA).forEach(data => {
        all = all.concat(data.subTypes);
    });
    return [...new Set(all)];
}

function getAllUniqueTypes() {
    let all = [];
    Object.values(MATERIAL_DATA).forEach(data => {
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
    const display = document.getElementById('withdraw-material-display');
    display.textContent = mat;
    display.style.color = '#1f2937';

    // Reset SubType and Type if not compatible
    if (selectedSubType && !MATERIAL_DATA[mat].subTypes.includes(selectedSubType)) {
        selectedSubType = "";
        const subDisplay = document.getElementById('withdraw-subtype-display');
        if (subDisplay) {
            subDisplay.textContent = "เลือกชนิดวัสดุ";
            subDisplay.style.color = '#3b82f6';
        }
    }

    if (selectedType && !MATERIAL_DATA[mat].types.includes(selectedType)) {
        selectedType = "";
        const typeDisplay = document.getElementById('withdraw-type-display');
        typeDisplay.textContent = "เลือกประเภท";
        typeDisplay.style.color = '#3b82f6';
    }

    updateSubTypeList();
    updateTypeList();
    updateSummary();
    clearSingleFieldError(display);
    toggleWithdrawDropdown('list-withdraw-material');
}

function selectSubTypeItem(sub) {
    selectedSubType = sub;
    const display = document.getElementById('withdraw-subtype-display');
    if (display) {
        display.textContent = sub;
        display.style.color = '#1f2937';
    }

    // Find Material if not selected
    if (!selectedMaterial) {
        for (const mat in MATERIAL_DATA) {
            if (MATERIAL_DATA[mat].subTypes.includes(sub)) {
                selectedMaterial = mat;
                const matDisplay = document.getElementById('withdraw-material-display');
                matDisplay.textContent = mat;
                matDisplay.style.color = '#1f2937';
                updateSubTypeList();
                updateTypeList();
                break;
            }
        }
    }

    updateSummary();
    updateTypeList();
    clearSingleFieldError(display);
    toggleWithdrawDropdown('list-withdraw-subtype');
}

function selectTypeItem(type) {
    selectedType = type;
    const display = document.getElementById('withdraw-type-display');
    display.textContent = type;
    display.style.color = '#1f2937';

    // Find Material if not selected
    if (!selectedMaterial) {
        for (const mat in MATERIAL_DATA) {
            if (MATERIAL_DATA[mat].types.includes(type)) {
                selectedMaterial = mat;
                const matDisplay = document.getElementById('withdraw-material-display');
                matDisplay.textContent = mat;
                matDisplay.style.color = '#1f2937';
                updateSubTypeList();
                updateTypeList();
                break;
            }
        }
    }

    updateSummary();
    clearSingleFieldError(display);
    toggleWithdrawDropdown('list-withdraw-type');
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
    element.style.borderColor = '#ef4444'; // Red color
    setTimeout(() => {
        element.style.borderColor = originalBorder;
    }, 2000);
}

function openConfirmModal() {
    const nameInput = document.getElementById('withdrawer-name');
    const qtyInput = document.getElementById('withdraw-qty');

    const errors = [];

    if (!nameInput.value.trim()) {
        errors.push({ input: nameInput, label: 'ชื่อผู้เบิกวัสดุ', message: 'กรุณากรอกชื่อผู้เบิก' });
    }
    if (!selectedMaterial) {
        errors.push({ input: document.getElementById('withdraw-material-display'), label: 'วัสดุ', message: 'กรุณาเลือกวัสดุ' });
    }
    if (!selectedSubType) {
        errors.push({ input: document.getElementById('withdraw-subtype-display'), label: 'ชนิดวัสดุ', message: 'กรุณาเลือกชนิดวัสดุ' });
    }
    if (!selectedType) {
        errors.push({ input: document.getElementById('withdraw-type-display'), label: 'ประเภทวัสดุ', message: 'กรุณาเลือกประเภท' });
    }
    
    const qtyValue = qtyInput.value.trim();
    if (!qtyValue) {
        errors.push({ input: qtyInput, label: 'จำนวนที่ต้องการเบิก', message: 'กรุณากรอกจำนวน' });
    } else {
        const qtyNum = parseInt(qtyValue, 10);
        if (qtyNum < 1) {
            errors.push({ input: qtyInput, label: 'จำนวนที่ต้องการเบิก', message: 'จำนวนต้องไม่น้อยกว่า 1' });
        }
    }

    if (errors.length > 0) {
        showValidationModal(errors);
        return;
    }

    const noteText = document.getElementById('withdraw-note').value || '';
    const bodyHtml = `
        <div class="mb-15" style="text-align: left;">
            <label class="modal-label-standard">ชื่อผู้เบิกวัสดุ</label>
            <input type="text" class="modal-input-readonly-gray" readonly value="${nameInput.value}">
        </div>
        <div class="mb-15" style="text-align: left;">
            <label class="modal-label-standard">วัสดุที่ต้องการเบิก</label>
            <input type="text" class="modal-input-readonly-gray" readonly value="${selectedMaterial}">
        </div>
        <div class="mb-15" style="text-align: left;">
            <label class="modal-label-standard">ชนิดวัสดุที่ต้องการเบิก</label>
            <input type="text" class="modal-input-readonly-gray" readonly value="${selectedSubType}">
        </div>
        <div class="mb-15" style="text-align: left;">
            <label class="modal-label-standard">ประเภทวัสดุที่ต้องการเบิก</label>
            <input type="text" class="modal-input-readonly-gray" readonly value="${selectedType}">
        </div>
        <div class="mb-15" style="text-align: left;">
            <label class="modal-label-standard">จำนวนวัสดุที่ต้องการเบิก</label>
            <input type="text" class="modal-input-readonly-gray" readonly value="${qtyInput.value}">
        </div>
        <div class="mb-30" style="text-align: left;">
            <label class="modal-label-standard">หมายเหตุ</label>
            <input type="text" class="modal-input-readonly-gray" readonly value="${noteText}">
        </div>
    `;

    // Save values for table row generation
    window.__pendingWithdrawData = {
        name: nameInput.value,
        matName: selectedMaterial,
        subType: selectedSubType,
        matType: selectedType,
        qty: qtyInput.value,
        note: noteText
    };

    showConfirmModal({
        title: 'ต้องการเบิกวัสดุ ใช่หรือไม่ ?',
        bodyHtml: bodyHtml,
        confirmText: 'ยืนยันการเบิกวัสดุ',
        cancelText: 'ยกเลิก',
        confirmBtnClass: 'btn-save-success nowrap',
        cancelBtnClass: 'btn-cancel-abort-action nowrap',
        headerClass: 'modal-withdraw-header-blue',
        bodyClass: 'modal-withdraw-body text-center',
        actionsContainerClass: 'modal-withdraw-footer flex-center',
        onConfirm: async () => {
            await submitWithdraw();
        }
    });
}

async function submitWithdraw() {
    const data = window.__pendingWithdrawData || {};
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
        const res = await fetch(`http://18.142.232.26:8070/materials/${material_id}/withdraw`, {
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

        if (!res.ok) throw new Error("Failed to withdraw material");
        
        addWithdrawRowToTable();
        resetWithdrawForm();
        
        if (typeof window.showStatusModal === 'function') {
            window.showStatusModal('สำเร็จ', 'เบิกวัสดุสำเร็จ', 'success');
        }

        // Background refresh stock data
        await loadData();
    } catch (e) {
        console.error(e);
        alert("เกิดข้อผิดพลาดในการเบิกวัสดุ");
    }
}

function addWithdrawRowToTable() {
    const data = window.__pendingWithdrawData || {};
    const name = data.name || "-";
    const matName = data.matName || "-";
    const subType = data.subType || "-";
    const matType = data.matType || "-";
    const qty = data.qty || "0";
    const note = data.note || "-";

    const tbody = document.querySelector('.withdraw-table tbody');
    if (!tbody) return;

    const now = new Date();
    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const dateStr = `${String(now.getDate()).padStart(2, '0')} ${thaiMonths[now.getMonth()]} ${now.getFullYear()}`;

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td class="bold-text withdraw-td-std">${name}</td>
        <td class="bold-text withdraw-td-std">${matName}</td>
        <td class="bold-text withdraw-td-std">${subType}</td>
        <td class="bold-text withdraw-td-std">${matType}</td>
        <td class="bold-text withdraw-td-std">${qty}</td>
        <td class="bold-text withdraw-td-std">${dateStr}</td>
        <td class="bold-text withdraw-td-std">${note}</td>
    `;

    tbody.prepend(newRow);

    Array.from(tbody.querySelectorAll('tr')).forEach((row, index) => {
        const tds = row.querySelectorAll('td');
        if (index % 2 === 1) {
            row.className = "alt-row bg-gray-light";
            tds.forEach(td => td.className = "bold-text withdraw-td-std withdraw-alt-td");
        } else {
            row.className = "bg-white";
            tds.forEach(td => td.className = "bold-text withdraw-td-std");
        }
    });
}

function resetWithdrawForm() {
    selectedMaterial = "";
    selectedSubType = "";
    selectedType = "";
    document.getElementById('withdraw-material-display').textContent = "เลือกวัสดุ";
    document.getElementById('withdraw-material-display').style.color = '#3b82f6';
    document.getElementById('withdraw-subtype-display').textContent = "เลือกชนิดวัสดุ";
    document.getElementById('withdraw-subtype-display').style.color = '#3b82f6';
    document.getElementById('withdraw-type-display').textContent = "เลือกประเภท";
    document.getElementById('withdraw-type-display').style.color = '#3b82f6';

    document.getElementById('withdraw-qty').value = '';
    document.getElementById('withdraw-note').value = '';
    updateSummary();
    updateTypeList();
}

window.onload = function () {
    syncWithdrawerName();
    loadData();
};

function syncWithdrawerName() {
    const checkNavbar = setInterval(() => {
        const navbarUsername = document.querySelector('.username');
        const nameInput = document.getElementById('withdrawer-name');

        if (navbarUsername && nameInput) {
            nameInput.value = navbarUsername.innerText.trim();
            clearInterval(checkNavbar);
        }
    }, 100);
    setTimeout(() => clearInterval(checkNavbar), 3000);
}
