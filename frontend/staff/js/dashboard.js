// dashboard.js - Javascript State Management (React-like data handling)

// 1. Define State
let users = [];
let employees = [];

let currentUserEditId = null;
let currentEditType = null; // 'user' or 'employee'

// 2. Render Functions (Update UI from State)
function renderTables() {
    // Render Users Table
    const usersTbody = document.querySelector('#view-users tbody');
    if (usersTbody) {
        usersTbody.innerHTML = '';
        users.forEach(u => {
            const classStat = u.status === 'Blacklist' ? 'status-blacklist' : 'status-normal';
            usersTbody.innerHTML += `
        <tr>
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td class="${classStat}">${u.status}</td>
            <td>
                <button class="custom-btn-edit" onclick="openEditModal('user', '${u.id}')">แก้ไข</button>
                <button class="custom-btn-delete" onclick="openDeleteModal('user', '${u.id}')">ลบ</button>
            </td>
        </tr>
    `;
        });
    }

    // Render Employees Table
    const empTbody = document.querySelector('#view-employees tbody');
    if (empTbody) {
        empTbody.innerHTML = '';
        employees.forEach(e => {
            empTbody.innerHTML += `
        <tr>
            <td>${e.id}</td>
            <td>${e.name}</td>
            <td>${e.role}</td>
            <td style="color: #000; font-weight: 500;">
                ${e.phone && e.phone.length === 10 ? e.phone.substring(0, 3) + ' - ' + e.phone.substring(3, 6) + ' - ' + e.phone.substring(6, 10) : e.phone}
            </td>
            <td>
                <button class="custom-btn-edit" onclick="openEditModal('employee', '${e.id}')">แก้ไข</button>
                <button class="custom-btn-delete" onclick="openDeleteModal('employee', '${e.id}')">ลบ</button>
            </td>
        </tr>
    `;
        });
    }
}

// 3. Actions (Edit & Save Data)
function injectEditModal() {
    if (document.getElementById('modal-edit')) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay hidden';
    overlay.id = 'modal-edit';
    overlay.innerHTML = `
        <div class="modal modal-edit-large p-0">
            <div class="modal-header modal-header-blue modal-edit-header">
                <h2 id="edit-modal-title" class="modal-title-edit fw-700 mb-6">User</h2>
                <p id="edit-modal-subtitle" class="fw-500">แก้ไขข้อมูลผู้ใช้งาน</p>
            </div>
            <div class="modal-body p-30">
                <form id="edit-form" class="form-grid" onsubmit="event.preventDefault(); confirmSaveUserData();">
                    <div class="input-group">
                        <label for="edit-username">ชื่อผู้ใช้ (Username)</label>
                        <input type="text" id="edit-username" placeholder="กรอกชื่อผู้ใช้" maxlength="50" oninput="validateUsername(this)">
                    </div>
                    <div class="input-group">
                        <label for="edit-email">อีเมล (Email)</label>
                        <input type="text" id="edit-email" placeholder="example@email.com" maxlength="100" autocomplete="off" oninput="validateEmail(this)">
                    </div>
                    <div class="input-group">
                        <label for="edit-phone">เบอร์โทรศัพท์ (Phone No.)</label>
                        <input type="tel" id="edit-phone" maxlength="16" placeholder="000 - 000 - 0000" oninput="formatPhoneNumber(this)">
                    </div>
                    <div class="input-group">
                        <label for="edit-password">รหัสผ่าน (Password)</label>
                        <div class="password-wrapper">
                            <input type="text" id="edit-password" placeholder="กรอกรหัสผ่านใหม่" maxlength="100" minlength="5" oninput="validatePassword(this)">
                        </div>
                    </div>
                    <div id="footer-left-side">
                        <div id="status-group-container" class="input-group hidden">
                            <label class="modal-label-status">สถานะการใช้งาน</label>
                            <div class="toggle-container m-0">
                                <button type="button" class="toggle-btn toggle-normal active" onclick="setToggle(this)">ปกติ</button>
                                <button type="button" class="toggle-btn toggle-blacklist" onclick="setToggle(this)">Blacklist</button>
                            </div>
                        </div>
                        <div id="role-group-container" class="input-group hidden">
                            <label class="modal-label-status">ตำแหน่งงาน (Role)</label>
                            <div class="select-wrapper">
                                <select id="edit-role" style="height: 45px;">
                                    <option value="" disabled selected hidden>เลือกตำแหน่งงาน</option>
                                    <option value="Admin">ผู้ดูแลระบบ (Admin)</option>
                                    <option value="Staff">พนักงาน</option>
                                    <option value="Owner">เจ้าของร้าน</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div id="footer-right-side" class="d-flex align-end justify-end">
                        <div class="modal-actions-right d-flex gap-12" style="margin-top: 10;">
                            <button type="submit" class="btn-action btn-save-success">บันทึกข้อมูล</button>
                            <button type="button" class="btn-action btn-close-danger" onclick="confirmCancelEdit()">ยกเลิก</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function removeEditModal() {
    const modal = document.getElementById('modal-edit');
    if (modal) {
        modal.classList.add('closing');
        setTimeout(() => modal.remove(), 250);
    }
}

function openEditModal(type, id) {
    injectEditModal();
    // Clear any previous validation errors
    clearValidationErrors('edit-form');

    currentUserEditId = id;
    currentEditType = type;

    let person;
    if (type === 'user') {
        person = users.find(u => String(u.id) === String(id));
    } else {
        person = employees.find(e => String(e.id) === String(id));
    }

    if (!person) return;

    // Truncate name for header if > 20 chars
    let headerName = person.name;
    if (headerName.length > 20) {
        headerName = headerName.substring(0, 20) + '...';
    }
    document.getElementById('edit-modal-title').innerText = headerName;
    document.getElementById('edit-username').value = person.name;

    let phoneDigits = person.phone || '';
    if (phoneDigits.length === 10) {
        document.getElementById('edit-phone').value = phoneDigits.substring(0, 3) + ' - ' + phoneDigits.substring(3, 6) + ' - ' + phoneDigits.substring(6, 10);
    } else {
        document.getElementById('edit-phone').value = phoneDigits;
    }

    document.getElementById('edit-email').value = person.email || '';
    document.getElementById('edit-password').value = person.password || '12345';

    // Status Toggles logic section
    const toggleNormal = document.querySelector('.toggle-normal');
    const toggleBlacklist = document.querySelector('.toggle-blacklist');
    const statusGroup = document.getElementById('status-group-container');
    const roleGroup = document.getElementById('role-group-container');
    const subtitle = document.getElementById('edit-modal-subtitle');

    if (type === 'user') {
        if (subtitle) subtitle.innerText = 'แก้ไขผู้ใช้งาน';
        if (roleGroup) roleGroup.classList.add('hidden');

        if (person.status === 'Blacklist') {
            toggleBlacklist.classList.add('active');
            toggleNormal.classList.remove('active');
        } else {
            toggleNormal.classList.add('active');
            toggleBlacklist.classList.remove('active');
        }

        if (statusGroup) statusGroup.classList.remove('hidden');

    } else {
        if (subtitle) subtitle.innerText = 'แก้ไขพนักงาน';
        if (roleGroup) roleGroup.classList.remove('hidden');
        document.getElementById('edit-role').value = person.role || '';

        if (statusGroup) statusGroup.classList.add('hidden');
        if (roleGroup) roleGroup.classList.remove('hidden');
    }

    document.getElementById('modal-edit').classList.remove('hidden');
}

function confirmSaveUserData() {
    if (!currentUserEditId || !currentEditType) return;

    const usernameEl = document.getElementById('edit-username');
    const passwordEl = document.getElementById('edit-password');
    const phoneEl = document.getElementById('edit-phone');
    const emailEl = document.getElementById('edit-email');
    const roleEl = document.getElementById('edit-role');

    const username = usernameEl.value.trim();
    const password = passwordEl.value;
    const phoneRaw = phoneEl.value.replace(/\D/g, '');
    const email = emailEl.value.trim();
    const role = roleEl ? roleEl.value : '';

    const errors = [];

    // 1. Username
    if (username.length < 1)
        errors.push({ input: usernameEl, label: 'ชื่อผู้ใช้', message: 'กรุณากรอกชื่อผู้ใช้' });

    // 2. Email
    if (email.length < 1)
        errors.push({ input: emailEl, label: 'อีเมล', message: 'กรุณากรอกอีเมล' });
    else if (!isValidEmail(email))
        errors.push({ input: emailEl, label: 'อีเมล', message: 'รูปแบบไม่ถูกต้อง (เช่น name@example.com)' });

    // 3. Phone (ต้องกรอก และต้องครบ 10 หลัก)
    if (phoneRaw.length < 1)
        errors.push({ input: phoneEl, label: 'เบอร์โทรศัพท์', message: 'กรุณากรอกเบอร์โทรศัพท์' });
    else if (phoneRaw.length !== 10)
        errors.push({ input: phoneEl, label: 'เบอร์โทรศัพท์', message: `ต้องมี 10 หลักพอดี (ปัจจุบัน ${phoneRaw.length} หลัก)` });

    // 4. Password
    if (password.length < 5)
        errors.push({ input: passwordEl, label: 'รหัสผ่าน', message: 'ต้องมีอย่างน้อย 5 ตัวอักษร' });
    else if (password.length > 100)
        errors.push({ input: passwordEl, label: 'รหัสผ่าน', message: 'ยาวได้สูงสุด 100 ตัวอักษร' });

    // 5. Role (ถ้าเป็นพนักงาน ต้องเลือก)
    if (currentEditType === 'employee' && !role) {
        errors.push({ input: roleEl, label: 'ตำแหน่งงาน', message: 'กรุณาเลือกตำแหน่งงาน' });
    }

    if (errors.length > 0) {
        showValidationModal(errors);
        return;
    }

    let displayName = username;
    if (displayName.length > 20) {
        displayName = displayName.substring(0, 20) + '...';
    }

    document.getElementById('modal-edit').classList.add('hidden');

    showConfirmModal({
        title: 'ยืนยันการบันทึกข้อมูล',
        headerClass: 'modal-header-confirm modal-header-save',
        bodyHtml: `
            <h3 class="modal-h3-confirm" style="text-align: center;">
                คุณต้องการบันทึกข้อมูลของ <br> <span class="text-save fw-700">${displayName}</span>
                ใช่หรือไม่ ?
            </h3>
        `,
        confirmText: 'บันทึกข้อมูลผู้ใช้',
        cancelText: 'ยกเลิก',
        confirmBtnClass: 'btn-action btn-save',
        cancelBtnClass: 'btn-action btn-cancel',
        onConfirm: async () => {
            await executeSaveUserData();
        },
        onCancel: () => {
            const el = document.getElementById('modal-edit');
            if (el) el.classList.remove('hidden');
        }
    });
}

function confirmCancelEdit() {
    if (!currentUserEditId || !currentEditType) return;

    let username = document.getElementById('edit-username').value;
    if (username.length > 20) {
        username = username.substring(0, 20) + '...';
    }

    document.getElementById('modal-edit').classList.add('hidden');

    showConfirmModal({
        title: 'ยืนยันการยกเลิกบันทึกข้อมูล',
        headerClass: 'modal-header-confirm modal-header-cancel',
        bodyHtml: `
            <h3 class="modal-h3-confirm" style="text-align: center;">
                คุณต้องยืนยันการยกเลิกบันทึกข้อมูลของ <br> <span class="text-cancel fw-700">${username}</span> ใช่หรือไม่ ?
            </h3>
        `,
        confirmText: 'ยกเลิกบันทึกข้อมูลผู้ใช้',
        cancelText: 'ยกเลิก',
        confirmBtnClass: 'btn-action btn-close',
        cancelBtnClass: 'btn-action btn-cancel',
        onConfirm: () => {
            removeEditModal();
        },
        onCancel: () => {
            const el = document.getElementById('modal-edit');
            if (el) el.classList.remove('hidden');
        }
    });
}

async function executeSaveUserData() {
    if (!currentUserEditId || !currentEditType) return;

    const newName = document.getElementById('edit-username').value;
    const newPhone = document.getElementById('edit-phone').value.replace(/\D/g, ''); // strip to digits before saving
    const newEmail = document.getElementById('edit-email').value;
    const newPass = document.getElementById('edit-password').value;

    let newStatus = 'ปกติ';
    if (document.querySelector('.toggle-blacklist') && document.querySelector('.toggle-blacklist').classList.contains('active')) {
        newStatus = 'Blacklist';
    }

    // Update State
    if (currentEditType === 'user') {
        const idx = users.findIndex(u => String(u.id) === String(currentUserEditId));
        if (idx !== -1) {
            const token = localStorage.getItem("authToken");
            const originalUsername = users[idx].username || newName; // Preserve original username if not editable

            try {
                const response = await fetch(`http://18.142.232.26:8070/customer/${currentUserEditId}`, {
                    method: 'PUT',
                    headers: {
                        'accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: originalUsername,
                        NAME: newName,
                        Email: newEmail,
                        Phone_no: newPhone,
                        password_hash: newPass,
                        suspended_status: newStatus === 'ปกติ'
                    })
                });

                if (!response.ok) throw new Error('Failed to update customer');

                users[idx].name = newName;
                users[idx].phone = newPhone;
                users[idx].email = newEmail;
                users[idx].password = newPass;
                users[idx].status = newStatus;
            } catch (err) {
                console.error(err);
                alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้");
                return;
            }
        }
    } else {
        const idx = employees.findIndex(e => String(e.id) === String(currentUserEditId));
        if (idx !== -1) {
            const roleEl = document.getElementById('edit-role');
            const newRole = roleEl && roleEl.value ? roleEl.value : employees[idx].role;
            const token = localStorage.getItem("authToken");

            try {
                const response = await fetch(`http://18.142.232.26:8070/staff/${currentUserEditId}`, {
                    method: 'PUT',
                    headers: {
                        'accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: newName,
                        email: newEmail,
                        phone: newPhone,
                        password: newPass,
                        user_role: newRole,
                        user_status: true // API expects boolean
                    })
                });

                if (!response.ok) throw new Error('Failed to update employee');

                employees[idx].name = newName;
                employees[idx].phone = newPhone;
                employees[idx].email = newEmail;
                employees[idx].password = newPass;
                employees[idx].role = newRole;
            } catch (err) {
                console.error(err);
                alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูลพนักงาน");
                return;
            }
        }
    }

    // Re-Render interface from state
    renderTables();

    currentUserEditId = null;
    currentEditType = null;
    removeEditModal();

}

function openDeleteModal(type, id) {
    let person = type === 'user' ? users.find(u => String(u.id) === String(id)) : employees.find(e => String(e.id) === String(id));
    if (!person) return;

    showConfirmModal({
        title: 'ยืนยันการลบข้อมูล',
        headerClass: 'modal-header-confirm modal-header-cancel',
        bodyHtml: `
            <h3 class="modal-h3-confirm" style="text-align: center;">
                คุณต้องการลบชื่อผู้ใช้ : <br>
                <span class="text-cancel fw-700">${person.name}</span> ใช่หรือไม่ ?
            </h3>
        `,
        confirmText: 'ยืนยันการลบ',
        cancelText: 'ยกเลิก',
        confirmBtnClass: 'btn-action btn-close',
        cancelBtnClass: 'btn-action btn-cancel',
        onConfirm: async () => {
            if (type === 'user') {
                try {
                    const token = localStorage.getItem("authToken");
                    const response = await fetch(`http://18.142.232.26:8070/customer/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) throw new Error('Failed to delete customer');

                    users = users.filter(u => String(u.id) !== String(id));
                } catch (err) {
                    console.error(err);
                    alert("เกิดข้อผิดพลาดในการลบผู้ใช้งาน");
                    return;
                }
            } else {
                try {
                    const token = localStorage.getItem("authToken");
                    const response = await fetch(`http://18.142.232.26:8070/staff/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) throw new Error('Failed to delete staff');

                    employees = employees.filter(e => String(e.id) !== String(id));
                } catch (err) {
                    console.error(err);
                    alert("เกิดข้อผิดพลาดในการลบพนักงาน");
                    return;
                }
            }
            renderTables();
        }
    });
}

// ─── Register Employee Modal ──────────────────────────────────────────────────
function showRegisterEmployeeModal() {
    const existing = document.getElementById('register-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'register-modal-overlay';
    overlay.style.cssText = [
        'position:fixed', 'inset:0', 'background:rgba(0,0,0,0.45)',
        'z-index:9999', 'display:flex', 'justify-content:center',
        'align-items:center', 'backdrop-filter:blur(3px)', 'padding:20px'
    ].join(';');

    const modal = document.createElement('div');
    modal.style.cssText = [
        'background:#fff', 'border-radius:24px', 'overflow:hidden',
        'max-width:440px', 'width:100%',
        'box-shadow:0 25px 60px rgba(0,0,0,0.15)',
        'font-family:"Prompt",sans-serif', 'padding:30px',
        'opacity:0', 'transform:scale(0.95) translateY(-10px)',
        'transition:all 0.3s ease-out', 'position:relative'
    ].join(';');

    // Close Button (Red X)
    const closeX = document.createElement('button');
    closeX.innerHTML = '&#10005;'; // X character
    closeX.style.cssText = [
        'position:absolute', 'top:25px', 'right:25px',
        'background:none', 'border:none', 'color:#ef4444',
        'font-size:24px', 'font-weight:700', 'cursor:pointer',
        'padding:5px', 'line-height:1'
    ].join(';');
    closeX.onclick = () => {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.95) translateY(-10px)';
        setTimeout(() => overlay.remove(), 300);
    };

    // Title
    const title = document.createElement('h2');
    title.innerText = 'ลงทะเบียนพนักงาน';
    title.style.cssText = 'font-size:24px;font-weight:700;color:#1f2937;margin-bottom:25px;';

    // Form Container
    const form = document.createElement('div');
    form.style.cssText = 'display:flex;flex-direction:column;gap:18px;';

    const createField = (label, id, type = 'text', placeholder = '', oninput = null) => {
        const group = document.createElement('div');
        group.className = 'input-group';
        group.style.cssText = 'display:flex;flex-direction:column;gap:6px;position:relative;';

        const lb = document.createElement('label');
        lb.innerText = label;
        lb.style.cssText = 'font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;';

        const input = document.createElement('input');
        input.id = id;
        input.type = type;
        input.placeholder = placeholder;
        input.style.cssText = [
            'padding:12px 14px', 'border:1px solid #e5e7eb',
            'border-radius:8px', 'font-size:14px', 'background:#f9fafb',
            'transition:all 0.2s', 'font-family:"Prompt",sans-serif'
        ].join(';');
        input.onfocus = () => {
            input.style.borderColor = '#0088ff';
            input.style.background = '#fff';
            input.style.boxShadow = '0 0 0 4px rgba(0,136,255,0.1)';
        };
        input.onblur = () => {
            input.style.borderColor = '#e5e7eb';
            input.style.background = '#f9fafb';
            input.style.boxShadow = 'none';
        };
        if (oninput) input.oninput = () => oninput(input);

        group.append(lb, input);
        return { group, input };
    };

    // Password fields need a wrapper for SHOW/HIDE
    const createPasswordField = (label, id, placeholder) => {
        const { group, input } = createField(label, id, 'password', placeholder, (el) => validatePassword(el));

        const wrapper = document.createElement('div');
        wrapper.className = 'password-wrapper';
        wrapper.style.cssText = 'position:relative;';

        // Move input into wrapper
        input.style.paddingRight = '50px';
        wrapper.appendChild(input);

        const toggle = document.createElement('span');
        toggle.innerText = 'SHOW';
        toggle.style.cssText = [
            'position:absolute', 'right:14px', 'top:50%',
            'transform:translateY(-50%)', 'font-size:10px',
            'font-weight:700', 'color:#9ca3af', 'cursor:pointer',
            'user-select:none'
        ].join(';');
        toggle.onclick = () => togglePassword(id, toggle);

        wrapper.appendChild(toggle);
        group.appendChild(wrapper);
        // Remove the original input from group since it's now in wrapper
        // group.removeChild(input); // Wait, createField already appended it.
        // Actually, let's fix createField to support wrappers or just do it manually.
        return { group, input };
    };

    const usernameRes = createField('USERNAME', 'reg-username', 'text', 'Username', (el) => validateUsername(el));
    const emailRes = createField('EMAIL', 'reg-email', 'text', 'example@gmail.com', (el) => validateEmail(el));

    // Manually handle password fields to avoid double appending
    const createPw = (label, id, placeholder) => {
        const group = document.createElement('div');
        group.className = 'input-group';
        group.style.cssText = 'display:flex;flex-direction:column;gap:6px;position:relative;';
        const lb = document.createElement('label');
        lb.innerText = label;
        lb.style.cssText = 'font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;';
        const wrapper = document.createElement('div');
        wrapper.className = 'password-wrapper';
        wrapper.style.cssText = 'position:relative;';
        const input = document.createElement('input');
        input.id = id;
        input.type = 'password';
        input.placeholder = placeholder;
        input.style.cssText = [
            'width:100%', 'padding:12px 14px', 'padding-right:50px',
            'border:1px solid #e5e7eb', 'border-radius:8px',
            'font-size:14px', 'background:#f9fafb',
            'transition:all 0.2s', 'font-family:"Prompt",sans-serif'
        ].join(';');
        input.onfocus = () => {
            input.style.borderColor = '#0088ff';
            input.style.background = '#fff';
            input.style.boxShadow = '0 0 0 4px rgba(0,136,255,0.1)';
        };
        input.onblur = () => {
            input.style.borderColor = '#e5e7eb';
            input.style.background = '#f9fafb';
            input.style.boxShadow = 'none';
        };
        input.oninput = () => validatePassword(input);
        const toggle = document.createElement('span');
        toggle.innerText = 'SHOW';
        toggle.style.cssText = 'position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:10px;font-weight:700;color:#9ca3af;cursor:pointer;user-select:none;';
        toggle.onclick = () => togglePassword(id, toggle);
        wrapper.append(input, toggle);
        group.append(lb, wrapper);
        return { group, input };
    };

    const passwordRes = createPw('PASSWORD', 'reg-password', '');
    const confirmPwRes = createPw('COMFIRM PASSWORD', 'reg-confirm-password', '');
    const phoneRes = createField('PHONE NO.', 'reg-phone', 'text', '000 - 000 - 0000', (el) => formatPhoneNumber(el));

    // Role Dropdown
    const roleGroup = document.createElement('div');
    roleGroup.className = 'input-group';
    roleGroup.style.cssText = 'display:flex;flex-direction:column;gap:6px;position:relative;';
    const roleLabel = document.createElement('label');
    roleLabel.innerText = 'ROLE';
    roleLabel.style.cssText = 'font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;';
    const roleWrapper = document.createElement('div');
    roleWrapper.className = 'select-wrapper';
    roleWrapper.style.cssText = 'position:relative;';
    const roleSelect = document.createElement('select');
    roleSelect.id = 'reg-role';
    roleSelect.style.cssText = [
        'width:100%', 'padding:12px 14px', 'border:1px solid #e5e7eb',
        'border-radius:8px', 'font-size:14px', 'background:#f9fafb',
        'appearance:none', 'font-family:"Prompt",sans-serif', 'color:#1f2937'
    ].join(';');
    roleSelect.innerHTML = `
        <option value="" disabled selected hidden>เลือกตำแหน่งงาน</option>
        <option value="Admin">ผู้ดูแลระบบ (Admin)</option>
        <option value="Staff">พนักงาน</option>
        <option value="Owner">เจ้าของร้าน</option>
    `;
    const arrow = document.createElement('span');
    arrow.innerHTML = '&#9660;'; // Down arrow
    arrow.style.cssText = 'position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:10px;color:#9ca3af;pointer-events:none;';
    roleWrapper.append(roleSelect, arrow);
    roleGroup.append(roleLabel, roleWrapper);

    // Register Button
    const regBtn = document.createElement('button');
    regBtn.innerText = 'ลงทะเบียน';
    regBtn.style.cssText = [
        'width:100%', 'padding:15px', 'margin-top:10px',
        'background:#0088ff', 'color:white', 'border:none',
        'border-radius:10px', 'font-size:18px', 'font-weight:700',
        'cursor:pointer', 'transition:background 0.2s',
        'font-family:"Prompt",sans-serif',
        'box-shadow:0 4px 12px rgba(0,136,255,0.2)'
    ].join(';');
    regBtn.onmouseover = () => { regBtn.style.background = '#0077ee'; };
    regBtn.onmouseout = () => { regBtn.style.background = '#0088ff'; };
    regBtn.onclick = () => handleEmployeeRegistration();

    form.append(
        usernameRes.group,
        emailRes.group,
        passwordRes.group,
        confirmPwRes.group,
        phoneRes.group,
        roleGroup,
        regBtn
    );

    modal.append(closeX, title, form);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            modal.style.opacity = '1';
            modal.style.transform = 'scale(1) translateY(0)';
        });
    });
}

async function handleEmployeeRegistration() {
    const usernameEl = document.getElementById('reg-username');
    const emailEl = document.getElementById('reg-email');
    const passwordEl = document.getElementById('reg-password');
    const confirmPwEl = document.getElementById('reg-confirm-password');
    const phoneEl = document.getElementById('reg-phone');
    const roleEl = document.getElementById('reg-role');

    const username = usernameEl.value.trim();
    const email = emailEl.value.trim();
    const password = passwordEl.value;
    const confirmPw = confirmPwEl.value;
    const phoneRaw = phoneEl.value.replace(/\D/g, '');
    const role = roleEl.value;

    const errors = [];

    // 1. Username
    if (!username)
        errors.push({ input: usernameEl, label: 'ชื่อผู้ใช้', message: 'กรุณากรอกชื่อผู้ใช้' });

    // 2. Email
    if (!email)
        errors.push({ input: emailEl, label: 'อีเมล', message: 'กรุณากรอกอีเมล' });
    else if (!isValidEmail(email))
        errors.push({ input: emailEl, label: 'อีเมล', message: 'รูปแบบอีเมลไม่ถูกต้อง' });

    // 3. Password
    if (!password)
        errors.push({ input: passwordEl, label: 'รหัสผ่าน', message: 'กรุณากรอกรหัสผ่าน' });
    else if (password.length < 5)
        errors.push({ input: passwordEl, label: 'รหัสผ่าน', message: 'รหัสผ่านต้องมีอย่างน้อย 5 ตัวอักษร' });

    // 4. Confirm Password
    if (password !== confirmPw)
        errors.push({ input: confirmPwEl, label: 'ยืนยันรหัสผ่าน', message: 'รหัสผ่านไม่ตรงกัน' });

    // 5. Phone
    if (phoneRaw.length < 1)
        errors.push({ input: phoneEl, label: 'เบอร์โทรศัพท์', message: 'กรุณากรอกเบอร์โทรศัพท์' });
    else if (phoneRaw.length !== 10)
        errors.push({ input: phoneEl, label: 'เบอร์โทรศัพท์', message: 'เบอร์โทรศัพท์ต้องมี 10 หลัก' });

    // 6. Role
    if (!role)
        errors.push({ input: roleEl, label: 'ตำแหน่งงาน', message: 'กรุณาเลือกตำแหน่งงาน' });

    if (errors.length > 0) {
        showValidationModal(errors);
        return;
    }

    const payload = {
        name: username,
        email: email,
        phone: phoneRaw,
        user_name: username, 
        password: password,
        user_role: role
    };

    try {
        const token = localStorage.getItem("authToken");
        const response = await fetch('http://18.142.232.26:8070/staff_register', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Failed to register staff');
        }

        // Close Modal
        const overlay = document.getElementById('register-modal-overlay');
        if (overlay) overlay.remove();

        // Refresh Data
        await loadData();
        window.showStatusModal('ลงทะเบียนสำเร็จ', 'พนักงานใหม่ถูกเพิ่มเข้าระบบแล้ว', 'success');
    } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการลงทะเบียนพนักงาน');
    }
}

// 4. Tab & Modal Helpers
function switchTab(tabIndex) {
    const btn1 = document.getElementById('tab1-btn');
    const btn2 = document.getElementById('tab2-btn');
    const view1 = document.getElementById('view-users');
    const view2 = document.getElementById('view-employees');
    const title = document.getElementById('page-title');
    const btnAddEmp = document.getElementById('btn-add-employee');

    if (tabIndex === 1) {
        btn1.classList.add('active');
        btn2.classList.remove('active');
        view1.classList.remove('hidden');
        view2.classList.add('hidden');
        title.innerText = 'จัดการผู้ใช้งาน';
        if (btnAddEmp) btnAddEmp.classList.add('hidden');
    } else {
        btn2.classList.add('active');
        btn1.classList.remove('active');
        view2.classList.remove('hidden');
        view1.classList.add('hidden');
        title.innerText = 'จัดการข้อมูลพนักงาน';
        if (btnAddEmp) btnAddEmp.classList.remove('hidden');
    }
}

function openModal(modalId, username = '', role = '') {
    document.getElementById(modalId).classList.remove('hidden');

    if (modalId === 'modal-delete' && username) {
        document.getElementById('delete-username-text').innerText = username;
    }
}

function setToggle(btn) {
    const container = btn.parentElement;
    const buttons = container.querySelectorAll('.toggle-btn');
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

let activeSortStatus = '';

function sortByStatus(direction) {
    if (activeSortStatus === direction) {
        activeSortStatus = '';
        document.querySelectorAll('.sort-up, .sort-down').forEach(btn => btn.classList.remove('active'));
        // Restore original order by user ID
        users.sort((a, b) => a.id.localeCompare(b.id));
    } else {
        activeSortStatus = direction;
        document.querySelectorAll('.sort-up, .sort-down').forEach(btn => btn.classList.remove('active'));
        if (direction === 'asc') {
            document.querySelector('.sort-up').classList.add('active');
            users.sort((a, b) => {
                if (a.status === b.status) return a.id.localeCompare(b.id);
                return a.status === 'ปกติ' ? -1 : 1;
            });
        } else if (direction === 'desc') {
            document.querySelector('.sort-down').classList.add('active');
            users.sort((a, b) => {
                if (a.status === b.status) return a.id.localeCompare(b.id);
                return a.status === 'Blacklist' ? -1 : 1;
            });
        }
    }
    renderTables();
}

// 5. Initialize Data from Mock API
async function loadData() {
    try {
        // Show Loaders
        const usersTbody = document.querySelector('#view-users tbody');
        const empTbody = document.querySelector('#view-employees tbody');
        if (usersTbody) usersTbody.innerHTML = createLoadingSpinner(4);
        if (empTbody) empTbody.innerHTML = createLoadingSpinner(5);

        // Fetch concurrently
        const token = localStorage.getItem("authToken");
        const fetchOptions = {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const userRole = localStorage.getItem('userRole') || 'Staff';

        const promises = [
            fetch('http://18.142.232.26:8070/customer_fetch/', fetchOptions).then(res => {
                if (!res.ok) throw new Error('Failed to fetch customers');
                return res.json();
            })
        ];

        // Fetch staff only if Admin
        if (userRole === 'Admin' || userRole === 'ผู้ดูแลระบบ') {
            promises.push(
                fetch('http://18.142.232.26:8070/staff_fetch/', fetchOptions).then(res => {
                    if (!res.ok) throw new Error('Failed to fetch staff');
                    return res.json();
                })
            );
        }

        const results = await Promise.all(promises);
        
        const usersRes = results[0] || [];
        const empRes = results.length > 1 ? results[1] : [];

        users = usersRes.map(u => ({
            id: u.Customer_ID,
            name: u.NAME,
            email: u.Email,
            phone: u.Phone_No,
            username: u.username,
            password: u.password_hash,
            status: u.suspended_status ? 'ปกติ' : 'Blacklist'
        }));
        employees = empRes.map(e => ({
            id: e.user_id,
            name: e.name,
            email: e.email,
            phone: e.phone,
            role: e.user_role,
            user_name: e.user_name,
            user_status: e.user_status
        }));

        renderTables();
    } catch (err) {
        alert(err.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole') || 'พนักงาน';
    if (userRole !== 'Admin' && userRole !== 'ผู้ดูแลระบบ') {
        const tab2Btn = document.getElementById('tab2-btn');
        if (tab2Btn) tab2Btn.style.display = 'none';
    }
    loadData();
});
