async function handleLogin() {
    const userEl = document.getElementById('login-username');
    const pwdEl = document.getElementById('login-pwd');
    const errors = [];

    if (!userEl.value.trim())
        errors.push({ input: userEl, label: 'Username', message: 'กรุณากรอก Username' });
    if (!pwdEl.value)
        errors.push({ input: pwdEl, label: 'Password', message: 'กรุณากรอก Password' });

    if (errors.length > 0) {
        showValidationModal(errors);
        return;
    }

    try {
        const btn = document.querySelector('.btn-primary');
        btn.innerText = "กำลังเข้าสู่ระบบ...";
        btn.disabled = true;

        const response = await fetch('http://18.142.232.26:8070/staff_login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({
                user_name: userEl.value.trim(),
                password: pwdEl.value
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => null);
            throw new Error((errData && errData.detail) ? errData.detail : 'Login failed');
        }

        const data = await response.json();

        localStorage.setItem("authToken", data.access_token);
        localStorage.setItem("currentUser", data.username);
        if (data.role) localStorage.setItem("userRole", data.role);

        // ผ่าน → เข้าสู่ระบบ (Redirect based on Role)
        if (data.role === 'เจ้าของร้าน' || data.role === 'Owner') {
            window.location.href = 'report.html';
        } else {
            window.location.href = 'receive-print.html';
        }
    } catch (err) {
        showValidationModal([{ input: userEl, label: 'Login', message: err.message === 'Login failed' ? 'Username หรือ Password ไม่ถูกต้อง' : 'ระบบขัดข้อง หรือชื่อผู้ใช้งาน/รหัสผ่านไม่ถูกต้อง' }]);
        const btn = document.querySelector('.btn-primary');
        btn.innerText = "LOGIN";
        btn.disabled = false;
    }
}
