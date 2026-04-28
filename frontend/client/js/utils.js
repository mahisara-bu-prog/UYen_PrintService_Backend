// utils.js — Shared Utility Functions (UYEN Dashboard - pond edition)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Toast Notification ───────────────────────────────────────────────────────
function showValidationError(input, message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = [
            'position:fixed', 'top:20px', 'right:20px', 'z-index:9999',
            'display:flex', 'flex-direction:column', 'gap:10px', 'pointer-events:none'
        ].join(';');
        document.body.appendChild(container);
    }
    if (Array.from(container.children).some(t => t.dataset.msg === message)) return;
    if (input) {
        input.classList.remove('input-error');
        void input.offsetWidth; // force reflow เพื่อให้ animation รีเซ็ต
        input.classList.add('input-error');
        setTimeout(() => input.classList.remove('input-error'), 2500);
    }
    const toast = document.createElement('div');
    toast.dataset.msg = message;
    toast.style.cssText = [
        'background-color:#ef4444', 'color:white', 'padding:12px 20px',
        'border-radius:8px', 'font-size:14px', 'font-weight:500',
        'font-family:"Prompt",sans-serif',
        'box-shadow:0 4px 12px rgba(239,68,68,0.4)',
        'opacity:0', 'transform:translateY(-10px)', 'transition:all 0.3s ease',
        'pointer-events:auto', 'max-width:320px', 'line-height:1.4'
    ].join(';');
    toast.innerText = message;
    container.appendChild(toast);
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}


// ─── Validation Error Modal (แสดงข้อผิดพลาดทั้งหมด + ไฮไลต์ field เมื่อกด ตกลง) ────
function showValidationModal(errors) {
    const existing = document.getElementById('validation-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'validation-modal-overlay';
    overlay.style.cssText = [
        'position:fixed', 'inset:0', 'background:rgba(0,0,0,0.55)',
        'z-index:99999', 'display:flex', 'justify-content:center',
        'align-items:center', 'backdrop-filter:blur(3px)', 'padding:20px'
    ].join(';');

    const modal = document.createElement('div');
    modal.style.cssText = [
        'background:#fff', 'border-radius:14px', 'overflow:hidden',
        'max-width:440px', 'width:100%',
        'box-shadow:0 25px 60px rgba(0,0,0,0.25)',
        'font-family:"Prompt",sans-serif',
        'opacity:0', 'transform:scale(0.9) translateY(-16px)',
        'transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1)'
    ].join(';');

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'background:linear-gradient(135deg,#ef4444,#dc2626);padding:20px 25px;color:white;';
    header.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
            <span style="font-size:22px;">⚠️</span>
            <h2 style="font-size:17px;font-weight:700;margin:0;">พบข้อมูลที่ไม่ถูกต้อง</h2>
        </div>
        <p style="font-size:12px;font-weight:400;margin:0;opacity:0.85;padding-left:32px;">
            กรุณาตรวจสอบและแก้ไขข้อมูลต่อไปนี้ (${errors.length} รายการ)
        </p>`;

    // Body — list of errors
    const body = document.createElement('div');
    body.style.cssText = 'padding:20px 25px;max-height:320px;overflow-y:auto;';
    const list = document.createElement('ul');
    list.style.cssText = 'list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:9px;';
    errors.forEach((err, i) => {
        const label   = typeof err === 'object' ? (err.label || '') : '';
        const message = typeof err === 'object' ? err.message : err;
        const item = document.createElement('li');
        item.style.cssText = [
            'display:flex', 'align-items:flex-start', 'gap:10px',
            'padding:10px 13px', 'background:#fff5f5',
            'border:1px solid #fecaca', 'border-left:3px solid #ef4444',
            'border-radius:8px', 'font-size:13px', 'color:#7f1d1d',
            'font-weight:500', 'line-height:1.5'
        ].join(';');
        item.innerHTML = `<span style="flex-shrink:0;color:#ef4444;font-weight:700;">${i + 1}.</span>`
            + `<span>${label ? '<strong>' + label + '</strong>: ' : ''}${message}</span>`;
        list.appendChild(item);
    });
    body.appendChild(list);

    // Footer
    const footer = document.createElement('div');
    footer.style.cssText = 'padding:15px 25px;display:flex;justify-content:flex-end;border-top:1px solid #f3f4f6;background:#fafafa;';
    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'ตกลง';
    closeBtn.style.cssText = [
        'background:#ef4444', 'color:white', 'border:none',
        'border-radius:8px', 'padding:10px 28px',
        'font-size:14px', 'font-weight:700',
        'font-family:"Prompt",sans-serif', 'cursor:pointer',
        'transition:background 0.2s'
    ].join(';');
    closeBtn.onmouseover = () => { closeBtn.style.background = '#dc2626'; };
    closeBtn.onmouseout  = () => { closeBtn.style.background = '#ef4444'; };

    // เมื่อกด ตกลง — ปิด modal แล้วไฮไลต์ field + แสดงข้อความใต้ช่อง
    closeBtn.onclick = () => {
        overlay.remove();
        errors.forEach(err => {
            const input   = typeof err === 'object' ? err.input   : null;
            const message = typeof err === 'object' ? err.message : err;
            if (!input) return;

            // shake + red border
            input.classList.remove('input-error');
            void input.offsetWidth;
            input.classList.add('input-error');

            // หา input-group: ถ้าอยู่ใน .password-wrapper ให้ขึ้นไปถึง input-group
            const pwWrapper = input.closest ? input.closest('.password-wrapper') : null;
            const anchor = pwWrapper || input;
            const inputGroup = anchor.parentElement;

            // ทำให้ inputGroup เป็น position:relative เพื่อรองรับ absolute positioning
            inputGroup.style.position = 'relative';

            // ลบ error msg เดิมของ field นี้ (ถ้ามี)
            if (input.id) {
                const old = inputGroup.querySelector(`.field-error-msg[data-for="${input.id}"]`);
                if (old) old.remove();
            }

            // สร้าง error message — position:absolute ลอยใต้ช่อง ไม่ดัน layout
            const msgEl = document.createElement('span');
            msgEl.className = 'field-error-msg';
            if (input.id) msgEl.setAttribute('data-for', input.id);
            msgEl.style.cssText = [
                'position:absolute', 'left:0', 'right:0', 'top:100%',
                'margin-top:3px', 'z-index:100',
                'color:#ef4444', 'font-size:11px', 'font-weight:500',
                'line-height:1.3', 'font-family:"Prompt",sans-serif',
                'white-space:nowrap', 'overflow:hidden', 'text-overflow:ellipsis',
                'pointer-events:none'
            ].join(';');
            msgEl.textContent = '⚠ ' + message;
            inputGroup.appendChild(msgEl);

            // ลบ error state เมื่อผู้ใช้เริ่มแก้ไข
            const cleanup = () => {
                input.classList.remove('input-error');
                if (msgEl.parentElement) msgEl.remove();
                inputGroup.style.position = '';
                input.removeEventListener('input',  cleanup);
                input.removeEventListener('focus',  cleanup);
                input.removeEventListener('change', cleanup);
            };
            input.addEventListener('input',  cleanup);
            input.addEventListener('focus',  cleanup);
            input.addEventListener('change', cleanup);
        });
    };

    footer.appendChild(closeBtn);
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    modal.append(header, body, footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1) translateY(0)';
    }));
}

// ─── Email Format Validator (RFC-like) ────────────────────────────────────────
function isValidEmail(email) {
    if (!email) return false;
    const atIdx = email.indexOf('@');
    if (atIdx <= 0) return false;
    if ((email.match(/@/g) || []).length > 1) return false;
    const local = email.slice(0, atIdx);
    const domain = email.slice(atIdx + 1);
    if (local.length === 0 || local.length > 64) return false;
    if (/^[.\-_]|[.\-_]$/.test(local)) return false;
    if (/\.{2,}/.test(local)) return false;
    if (!/^[a-zA-Z0-9._\-]+$/.test(local)) return false;
    if (!domain || !domain.includes('.')) return false;
    if (/^[\-.]|[\-.]$/.test(domain)) return false;
    if (/\.{2,}/.test(domain)) return false;
    const labels = domain.split('.');
    for (const lbl of labels) {
        if (!lbl || /^-|-$/.test(lbl)) return false;
        if (!/^[a-zA-Z0-9\-]+$/.test(lbl)) return false;
    }
    const tld = labels[labels.length - 1];
    return tld.length >= 2 && /^[a-zA-Z]+$/.test(tld);
}

// ─── Toggle Password Visibility ───────────────────────────────────────────────
function togglePassword(inputId, el) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        el.innerText = 'HIDE';
    } else {
        input.type = 'password';
        el.innerText = 'SHOW';
    }
}

// ─── Username Validation ──────────────────────────────────────────────────────
function validateUsername(input) {
    const original = input.value;
    let value = original.replace(/[^a-zA-Z0-9]/g, '');
    if (value !== original) {
        showValidationError(input, 'Username กรอกได้เฉพาะ A-Z, a-z และ 0-9 เท่านั้น');
    }
    if (value.length > 50) {
        value = value.substring(0, 50);
        showValidationError(input, 'Username ยาวได้สูงสุด 50 ตัวอักษร');
    }
    input.value = value;
}

// ─── Password Validation ──────────────────────────────────────────────────────
function validatePassword(input) {
    const original = input.value;
    let value = original.replace(/[^a-zA-Z0-9@#$%&*®™©฿€¥+\-×÷=≠≤≥_ ().,\"']/g, '');
    if (value !== original) {
        showValidationError(input, 'Password มีตัวอักษรที่ไม่รองรับ กรุณาตรวจสอบ');
    }
    if (value.length > 100) {
        value = value.substring(0, 100);
        showValidationError(input, 'Password ยาวได้สูงสุด 100 ตัวอักษร');
    }
    input.value = value;
}

// ─── Email Input Sanitizer (oninput) ─────────────────────────────────────────
function validateEmail(input) {
    const original = input.value;
    let value = original.replace(/[^a-zA-Z0-9\.@\-_]/g, '');
    value = value.replace(/^@/, '');
    const firstAt = value.indexOf('@');
    if (firstAt !== -1) {
        const beforeAt = value.substring(0, firstAt + 1);
        const afterAt = value.substring(firstAt + 1).replace(/@/g, '');
        value = beforeAt + afterAt;
    }
    value = value.replace(/\.{2,}/g, '.');
    value = value.replace(/^\./, '');
    value = value.replace(/\.@/g, '@');
    if (value !== original) {
        showValidationError(input, 'Email มีตัวอักษรที่ไม่รองรับ กรุณาตรวจสอบรูปแบบ');
    }
    if (value.length > 100) {
        value = value.substring(0, 100);
        showValidationError(input, 'Email ยาวได้สูงสุด 100 ตัวอักษร');
    }
    input.value = value;
}

// ─── Phone Number Formatter ───────────────────────────────────────────────────
function formatPhoneNumber(input) {
    const original = input.value;

    // ตรวจว่ามีตัวอักษรที่ไม่ใช่ตัวเลข, space หรือ dash (จาก formatting ' - ')
    const hasInvalidChars = original.replace(/[\d\s\-]/g, '').length > 0;
    if (hasInvalidChars) {
        showValidationError(input, 'Phone No. กรอกได้เฉพาะตัวเลข 0-9 เท่านั้น');
    }

    const raw = original.replace(/\D/g, '');
    let value = raw;
    if (value.length > 0 && value[0] !== '0') {
        value = '';
        showValidationError(input, 'เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0');
    }
    if (value.length > 10) value = value.substring(0, 10);
    let formatted = '';
    if (value.length > 0) formatted += value.substring(0, 3);
    if (value.length > 3) formatted += ' - ' + value.substring(3, 6);
    if (value.length > 6) formatted += ' - ' + value.substring(6, 10);
    input.value = formatted;
}

// ─── Number Validation ────────────────────────────────────────────────────────
function validateInteger(input) {
    let value = input.value;
    // Remove anything that is not a digit
    value = value.replace(/[^0-9]/g, '');

    // Limit to 4 digits for consistency with price logic
    if (value.length > 4) {
        value = value.substring(0, 4);
    }

    input.value = value;
}

// ─── Clear Validation Errors ──────────────────────────────────────────────────
function clearValidationErrors(containerId = null) {
    const root = containerId ? document.getElementById(containerId) : document;
    if (!root) return;

    // Remove red borders
    root.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    
    // Remove error message spans
    root.querySelectorAll('.field-error-msg').forEach(el => el.remove());
}

function clearSingleFieldError(element) {
    if (!element) return;
    element.classList.remove('input-error');
    const inputGroup = element.parentElement;
    if (inputGroup) {
        const msg = inputGroup.querySelector(`.field-error-msg[data-for="${element.id}"]`);
        if (msg) msg.remove();
        // also check for messages without data-for if they were appended directly
        inputGroup.querySelectorAll('.field-error-msg').forEach(m => {
            if (!m.getAttribute('data-for') || m.getAttribute('data-for') === element.id) {
                m.remove();
            }
        });
    }
}

// ─── Dynamic Modal Generators ────────────────────────────────────────────────

function showStatusModal(title, message, type = 'success', duration = 2000) {
    const existing = document.getElementById('dynamic-status-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'dynamic-status-modal';
    overlay.className = 'modal-overlay z-2000';
    
    // Setup styles based on type
    let headerClass = 'modal-header-status-success';
    let iconRegion = '<div class="modal-icon-circle-large-success mb-20"><div class="modal-checkmark-white"></div></div>';

    if (type === 'error') {
        headerClass = 'modal-header-status-error';
        iconRegion = '<div class="modal-icon-circle-large-error mb-20"><div class="fw-bold f-30 lh-1 text-white">♻</div></div>';
    } else if (type === 'warning') {
        headerClass = 'modal-header-status-warning';
        iconRegion = '<div class="modal-icon-circle-large-warning mb-20"><div class="fw-bold f-30 lh-1 text-white">♻</div></div>';
    } else if (type === 'error-upload') {
        headerClass = 'modal-header-status-error';
        iconRegion = '<div class="modal-icon-circle-large-error mb-20"><div class="fw-bold f-30 lh-1 pb-8 text-white">⬆</div></div>';
    }

    overlay.innerHTML = `
        <div class="modal modal-status-mini">
            <div class="${headerClass} modal-header-compact">
                <h2 class="modal-title-status-smaller">${title}</h2>
            </div>
            <div class="modal-body-status-compact">
                ${iconRegion}
                <h3 class="modal-h3-status fw-700">${message}</h3>
                <p class="modal-p-timer">หน้าต่างจะถูกปิดใน ${duration/1000} วินาที</p>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Force layout recalculation for nice CSS transitions if defined
    void overlay.offsetWidth;

    // Close after duration
    setTimeout(() => {
        if(overlay.parentElement) {
            overlay.classList.add('closing');
            setTimeout(() => overlay.remove(), 250);
        }
    }, duration);
}

function showConfirmModal(options) {
    const {
        title = 'ยืนยัน',
        bodyHtml = '',
        confirmText = 'ยืนยัน',
        cancelText = 'ยกเลิก',
        confirmBtnClass = 'btn-action btn-save',
        cancelBtnClass = 'btn-action btn-cancel',
        headerClass = 'modal-header-confirm modal-header-cancel',
        bodyClass = 'modal-body-standard d-flex flex-col align-center text-center',
        actionsContainerClass = 'modal-actions-center d-flex gap-15 justify-center mt-20',
        onConfirm = () => {},
        onCancel = () => {}
    } = options;

    const existing = document.getElementById('dynamic-confirm-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'dynamic-confirm-modal';
    overlay.className = 'modal-overlay z-2000';
    
    // Using string templates as an easy way to construct complex modals on the fly
    overlay.innerHTML = `
        <div class="modal modal-confirm-small p-0">
            <div class="${headerClass}">
                <h2 class="modal-title-confirm text-white">${title}</h2>
            </div>
            <div class="${bodyClass}">
                ${bodyHtml}
                <div class="${actionsContainerClass}">
                    <button class="${confirmBtnClass}" id="dyn-confirm-btn">${confirmText}</button>
                    <button type="button" class="${cancelBtnClass}" id="dyn-cancel-btn">${cancelText}</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const closeModal = () => {
        overlay.classList.add('closing');
        setTimeout(() => overlay.remove(), 250);
    };

    document.getElementById('dyn-confirm-btn').addEventListener('click', () => {
        onConfirm();
        closeModal();
    });

    document.getElementById('dyn-cancel-btn').addEventListener('click', () => {
        onCancel();
        closeModal();
    });
}
