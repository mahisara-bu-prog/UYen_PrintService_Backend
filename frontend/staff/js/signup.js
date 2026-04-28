function handleSignup() {
    const userEl    = document.getElementById('signup-username');
    const emailEl   = document.getElementById('signup-email');
    const pwdEl     = document.getElementById('signup-pwd');
    const confirmEl = document.getElementById('signup-confirm');
    const phoneEl   = document.querySelector('input[type="tel"]');
    const roleEl    = document.getElementById('signup-role');

    const username = userEl.value.trim();
    const email    = emailEl ? emailEl.value.trim() : '';
    const pwd      = pwdEl.value;
    const confirm  = confirmEl.value;
    const phoneRaw = phoneEl ? phoneEl.value.replace(/\D/g, '') : '';

    const errors = [];

    if (username.length < 1)
        errors.push({ input: userEl,    label: 'Username',         message: 'กรุณากรอกอย่างน้อย 1 ตัวอักษร' });

    if (!email) {
        errors.push({ input: emailEl,   label: 'Email',            message: 'กรุณากรอก Email' });
    } else if (!isValidEmail(email)) {
        errors.push({ input: emailEl,   label: 'Email',            message: 'รูปแบบไม่ถูกต้อง (เช่น name@example.com)' });
    }

    if (pwd.length < 5)
        errors.push({ input: pwdEl,     label: 'Password',         message: 'ต้องมีอย่างน้อย 5 ตัวอักษร' });
    else if (pwd !== confirm)
        errors.push({ input: confirmEl, label: 'Confirm Password', message: 'ไม่ตรงกับ Password' });

    if (phoneRaw.length > 0 && phoneRaw.length !== 10)
        errors.push({ input: phoneEl,   label: 'Phone',            message: `ต้องมี 10 หลักพอดี (ปัจจุบัน ${phoneRaw.length} หลัก)` });

    if (roleEl && !roleEl.value)
        errors.push({ input: roleEl,    label: 'Role',             message: 'กรุณาเลือกตำแหน่งงาน' });

    if (errors.length > 0) {
        showValidationModal(errors);
        return;
    }
    // ผ่านทุกเงื่อนไข — แสดง Toast แล้ว redirect
    showValidationError(null, 'สมัครสำเร็จ! กำลังพาคุณไปหน้า Login...');
    setTimeout(() => window.location.href = 'index.html', 2000);
}
