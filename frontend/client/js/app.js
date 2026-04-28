/**
 * Main Application Logic
 * Handles UI interactions and binds forms to the API service.
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Session Management ---
    const displayUserName = document.getElementById("displayUserName");
    if (displayUserName) {
        const storedName = localStorage.getItem("user_name");
        if (storedName) {
            displayUserName.textContent = storedName;
        }
    }
    
    // --- Fetch Metadata (Dashboard) ---
    const paperTypeSelect = document.getElementById("paperTypeSelect");
    const paperSizeSelect = document.getElementById("paperSizeSelect");
    if (paperTypeSelect && paperSizeSelect) {
        // Fetch Paper Types
        fetch('http://18.142.232.26:8070/orders/meta/paper-types', {
            method: 'GET',
            headers: { 'accept': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            paperTypeSelect.innerHTML = '';
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.paper_type_id;
                option.textContent = item.name;
                paperTypeSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error("Failed to load paper types", err);
            paperTypeSelect.innerHTML = '<option value="1">Plain (Fallback)</option>';
        });

        // Fetch Paper Sizes
        fetch('http://18.142.232.26:8070/orders/meta/paper-sizes', {
            method: 'GET',
            headers: { 'accept': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            paperSizeSelect.innerHTML = '';
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.paper_size_id;
                option.textContent = item.name;
                paperSizeSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error("Failed to load paper sizes", err);
            paperSizeSelect.innerHTML = '<option value="1">A4 (Fallback)</option>';
        });
    }

    // --- Mobile Nav Logic ---
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileMenuDropdown = document.getElementById("mobileMenuDropdown");
    
    if (mobileMenuBtn && mobileMenuDropdown) {
        mobileMenuBtn.addEventListener("click", () => {
            mobileMenuDropdown.classList.toggle("show");
        });

        // Close when clicking outside
        document.addEventListener("click", (e) => {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenuDropdown.contains(e.target)) {
                mobileMenuDropdown.classList.remove("show");
            }
        });
    }

    // --- Auth Forms ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            if (typeof clearValidationErrors === "function") clearValidationErrors();
            
            const btn = loginForm.querySelector("button[type='submit']");
            btn.textContent = "LOGGING IN...";
            btn.disabled = true;

            const usernameInput = loginForm.querySelector('input[name="username"]');
            const passwordInput = loginForm.querySelector('input[name="password"]');
            
            let errors = [];
            if (!usernameInput.value.trim()) {
                errors.push({ input: usernameInput, label: "USERNAME", message: "กรุณากรอก Username" });
            }
            if (!passwordInput.value) {
                errors.push({ input: passwordInput, label: "PASSWORD", message: "กรุณากรอก Password" });
            }
            
            if (errors.length > 0) {
                if (typeof showValidationModal === "function") {
                    showValidationModal(errors);
                } else {
                    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
                }
                btn.textContent = "LOGIN";
                btn.disabled = false;
                return;
            }

            try {
                const response = await fetch('http://18.142.232.26:8070/customer_login/', {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_name: usernameInput.value,
                        password: passwordInput.value
                    })
                });

                let data = null;
                try {
                    data = await response.json();
                } catch (e) {
                    console.warn("Response is not JSON");
                }

                if (data && (data.Not_Suspended === false || data.not_suspended === false || (data.detail && data.detail.toLowerCase().includes('inactive')))) {
                    if (typeof showStatusModal === "function") {
                        showStatusModal('Error', 'คุณโดนBlacklist!', 'error');
                    } else {
                        alert('คุณโดนBlacklist!');
                    }
                    btn.textContent = "LOGIN";
                    btn.disabled = false;
                    return;
                }

                if (response.ok) {
                    if (data && data.customer_id) localStorage.setItem('user_id', data.customer_id);
                    else if (data && data.id) localStorage.setItem('user_id', data.id);
                    
                    localStorage.setItem('user_name', usernameInput.value);
                    window.location.href = loginForm.action;
                } else {
                    if (typeof showStatusModal === "function") {
                        const errorMsg = data && data.detail ? data.detail : 'Invalid username or password';
                        showStatusModal('Error', errorMsg, 'error');
                    } else {
                        alert('Login failed');
                    }
                    btn.textContent = "LOGIN";
                    btn.disabled = false;
                }
            } catch (error) {
                console.error("Login request failed", error);
                if (typeof showStatusModal === "function") {
                    showStatusModal('Error', 'Cannot connect to server', 'error');
                } else {
                    alert('Cannot connect to server');
                }
                btn.textContent = "LOGIN";
                btn.disabled = false;
            }
        });
    }

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            if (typeof clearValidationErrors === "function") clearValidationErrors();
            
            const btn = registerForm.querySelector("button[type='submit']");
            btn.textContent = "REGISTERING...";
            btn.disabled = true;

            const usernameInput = registerForm.querySelector('input[name="username"]');
            const emailInput = registerForm.querySelector('input[name="email"]');
            const passwordInput = registerForm.querySelector('input[name="password"]');
            const confirmInput = registerForm.querySelector('input[name="confirm_password"]');
            const phoneInput = registerForm.querySelector('input[name="phone"]');

            let errors = [];
            
            if (!usernameInput.value.trim()) {
                errors.push({ input: usernameInput, label: "USERNAME", message: "กรุณากรอก Username" });
            }
            
            if (!emailInput.value.trim() || (typeof isValidEmail === 'function' && !isValidEmail(emailInput.value))) {
                errors.push({ input: emailInput, label: "EMAIL", message: "รูปแบบ Email ไม่ถูกต้อง" });
            }
            
            if (!passwordInput.value) {
                errors.push({ input: passwordInput, label: "PASSWORD", message: "กรุณากรอก Password" });
            } else if (passwordInput.value.length < 6) {
                errors.push({ input: passwordInput, label: "PASSWORD", message: "Password ต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
            }
            
            if (passwordInput.value !== confirmInput.value) {
                errors.push({ input: confirmInput, label: "CONFIRM PASSWORD", message: "Password ไม่ตรงกัน" });
            }
            
            const phoneRaw = phoneInput.value.replace(/\D/g, '');
            if (phoneRaw.length < 10) {
                errors.push({ input: phoneInput, label: "PHONE NO.", message: "เบอร์โทรศัพท์ต้องมี 10 หลัก" });
            }

            if (errors.length > 0) {
                if (typeof showValidationModal === "function") {
                    showValidationModal(errors);
                } else {
                    alert("กรุณาตรวจสอบข้อมูลให้ถูกต้อง");
                }
                btn.textContent = "SIGN UP NOW";
                btn.disabled = false;
                return;
            }

            const payload = {
                name: usernameInput.value,
                email: emailInput.value,
                phone_no: phoneInput.value,
                username: usernameInput.value,
                password: passwordInput.value
            };
            
            try {
                const response = await fetch('http://18.142.232.26:8070/customer_reg', {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    if (typeof showStatusModal === "function") {
                        showStatusModal('Success', 'Registration successful! Redirecting...', 'success', 2000);
                        setTimeout(() => {
                            window.location.href = registerForm.action;
                        }, 2000);
                    } else {
                        alert('Registration successful!');
                        window.location.href = registerForm.action;
                    }
                } else {
                    if (typeof showStatusModal === "function") {
                        showStatusModal('Error', 'Registration failed', 'error');
                    } else {
                        alert('Registration failed');
                    }
                    btn.textContent = "SIGN UP NOW";
                    btn.disabled = false;
                }
            } catch (error) {
                console.error("Register request failed", error);
                if (typeof showStatusModal === "function") {
                    showStatusModal('Error', 'Cannot connect to server', 'error');
                } else {
                    alert('Cannot connect to server');
                }
                btn.textContent = "SIGN UP NOW";
                btn.disabled = false;
            }
        });
    }

    // --- Dashboard Interactions ---
    const uploadZone = document.getElementById("uploadZone");
    const fileInput = document.getElementById("fileInput");
    if (uploadZone && fileInput) {
        uploadZone.addEventListener("click", () => {
            fileInput.click();
        });

        fileInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (file) {
                const icon = uploadZone.querySelector('.upload-icon');
                const text = uploadZone.querySelector('p');
                icon.className = "fa-solid fa-spinner fa-spin upload-icon";
                text.textContent = "Uploading...";

                // Mock upload delay
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Reset UI to indicate success
                icon.className = "fa-solid fa-check text-success upload-icon";
                text.textContent = file.name;
            }
        });
        
        // Drag and drop handlers
        uploadZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = "var(--primary-color)";
            uploadZone.style.backgroundColor = "var(--primary-light)";
        });
        
        uploadZone.addEventListener("dragleave", (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = "var(--border-color)";
            uploadZone.style.backgroundColor = "var(--bg-color)";
        });

        uploadZone.addEventListener("drop", (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = "var(--border-color)";
            uploadZone.style.backgroundColor = "var(--bg-color)";
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                fileInput.dispatchEvent(new Event("change"));
            }
        });
    }

    // Print Submit binding
    const dashboardBtn = document.querySelector(".btn-primary");
    if (dashboardBtn && window.location.pathname.includes("dashboard")) {
        // Change default link behavior to API call
        const originalOnclick = dashboardBtn.onclick;
        dashboardBtn.onclick = async (e) => {
            e.preventDefault();
            
            if (typeof clearValidationErrors === "function") clearValidationErrors();

            let errors = [];
            const fileInput = document.getElementById("fileInput");

            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                const uploadZone = document.getElementById("uploadZone");
                errors.push({ input: uploadZone || fileInput, label: "ไฟล์งานพิมพ์", message: "กรุณาอัพโหลดไฟล์" });
            }

            const pickupDate = document.getElementById("pickupDateInput");
            const pickupTime = document.getElementById("timeInput");
            
            // Validate time
            if (pickupDate && pickupTime && pickupDate.value && pickupTime.value) {
                const today = new Date();
                const selDateParts = pickupDate.value.split('-');
                const selYear = parseInt(selDateParts[0], 10);
                const selMonth = parseInt(selDateParts[1], 10) - 1;
                const selDay = parseInt(selDateParts[2], 10);
                
                const isToday = selYear === today.getFullYear() && 
                                selMonth === today.getMonth() && 
                                selDay === today.getDate();
                                
                if (isToday) {
                    const [optHourStr, optMinStr] = pickupTime.value.split(':');
                    const optHour = parseInt(optHourStr, 10);
                    const optMin = parseInt(optMinStr, 10);
                    
                    const currentHours = today.getHours();
                    const currentMinutes = today.getMinutes();
                    
                    if (optHour < currentHours || (optHour === currentHours && optMin <= currentMinutes)) {
                        errors.push({ input: pickupTime, label: "เวลารับงาน", message: "ไม่สามารถเลือกเวลาที่ผ่านไปแล้วได้" });
                    }
                }
            }

            if (errors.length > 0) {
                if (typeof showValidationModal === "function") {
                    showValidationModal(errors);
                } else {
                    alert(errors[0].message);
                }
                return; // Stop submission
            }

            dashboardBtn.textContent = "กำลังส่ง...";
            dashboardBtn.disabled = true;

            const form = document.getElementById("printDetailsForm");
            const formData = form ? Object.fromEntries(new FormData(form).entries()) : {};
            
            // Add date and time from the right column
            if (pickupDate) formData.pickup_date = pickupDate.value;
            if (pickupTime) formData.pickup_time = pickupTime.value;
            
            try {
                const apiFormData = new FormData();
                apiFormData.append('user_id', localStorage.getItem('user_id') || 1);
                apiFormData.append('paper_size_id', formData.paper_size_id || 1);
                apiFormData.append('paper_type_id', formData.paper_type_id || 1);
                apiFormData.append('copy_amount', formData.copies || 1);
                apiFormData.append('price_per_unit', 1);
                let formattedPickupDate = '';
                if (formData.pickup_date && formData.pickup_time) {
                    formattedPickupDate = `${formData.pickup_date}T${formData.pickup_time}:00`;
                } else if (formData.pickup_date) {
                    formattedPickupDate = `${formData.pickup_date}T00:00:00`;
                }
                apiFormData.append('pickup_date', formattedPickupDate);
                apiFormData.append('note', formData.notes || '');
                
                if (fileInput && fileInput.files && fileInput.files.length > 0) {
                    apiFormData.append('file', fileInput.files[0]);
                }

                const response = await fetch('http://18.142.232.26:8070/orders/create', {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json'
                        // Do not set Content-Type header when using FormData, browser will set it with boundary
                    },
                    body: apiFormData
                });

                if (response.ok) {
                    if (typeof showStatusModal === "function") {
                        showStatusModal('Success', 'ส่งงานพิมพ์เรียบร้อย', 'success', 1500);
                        setTimeout(() => {
                            if (originalOnclick) originalOnclick();
                            else window.location.reload();
                        }, 1500);
                    } else {
                        alert('ส่งงานพิมพ์เรียบร้อย');
                        if (originalOnclick) originalOnclick();
                        else window.location.reload();
                    }
                } else {
                    if (typeof showStatusModal === "function") {
                        showStatusModal('Error', 'เกิดข้อผิดพลาดในการส่งงาน', 'error');
                    } else {
                        alert('เกิดข้อผิดพลาดในการส่งงาน');
                    }
                    dashboardBtn.textContent = "ส่งพิมพ์เอกสาร";
                    dashboardBtn.disabled = false;
                }
            } catch (error) {
                console.error("Submit Print Job failed", error);
                if (typeof showStatusModal === "function") {
                    showStatusModal('Error', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
                } else {
                    alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
                }
                dashboardBtn.textContent = "ส่งพิมพ์เอกสาร";
                dashboardBtn.disabled = false;
            }
        };
    }

    // --- Calendar Logic ---
    const monthYearDisplay = document.getElementById("monthYearDisplay");
    const calendarDays = document.getElementById("calendarDays");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");
    const pickupDateInput = document.getElementById("pickupDateInput");
    const timeInput = document.getElementById("timeInput");
    
    if (monthYearDisplay && calendarDays) {
        let currentDate = new Date();
        let selectedDate = new Date(); // default to today
        pickupDateInput.value = selectedDate.toISOString().split('T')[0];

        const renderCalendar = () => {
            calendarDays.innerHTML = "";
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
            monthYearDisplay.textContent = `${thaiMonths[month]} ${year + 543}`;
            
            const firstDayIndex = new Date(year, month, 1).getDay();
            const lastDay = new Date(year, month + 1, 0).getDate();
            const today = new Date();
            
            for (let i = 0; i < firstDayIndex; i++) {
                const emptyDiv = document.createElement("div");
                emptyDiv.classList.add("empty");
                calendarDays.appendChild(emptyDiv);
            }
            
            for (let i = 1; i <= lastDay; i++) {
                const dayDiv = document.createElement("div");
                dayDiv.classList.add("calendar-day");
                dayDiv.textContent = i;
                
                const dayOfWeek = new Date(year, month, i).getDay();
                if (dayOfWeek === 0) dayDiv.classList.add("holiday"); // Sunday
                
                // Disable past days
                if (year < today.getFullYear() || 
                    (year === today.getFullYear() && month < today.getMonth()) ||
                    (year === today.getFullYear() && month === today.getMonth() && i < today.getDate())) {
                    dayDiv.classList.add("disabled");
                }
                
                if (selectedDate && selectedDate.getDate() === i && selectedDate.getMonth() === month && selectedDate.getFullYear() === year) {
                    dayDiv.classList.add("selected");
                }

                dayDiv.addEventListener("click", () => {
                    if (dayDiv.classList.contains("disabled")) return;
                    selectedDate = new Date(year, month, i);
                    pickupDateInput.value = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                    renderCalendar();
                });
                
                calendarDays.appendChild(dayDiv);
            }
        };

        prevMonthBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        nextMonthBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        renderCalendar();
    }

    // --- Queue Interactions ---
    const cancelBtns = document.querySelectorAll(".btn-cancel:not([disabled])");
    cancelBtns.forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const card = e.target.closest(".queue-card");
            if (card) {
                const confirmCancel = confirm("คุณต้องการยกเลิกคิวนี้ใช่หรือไม่? (Mock)");
                if (confirmCancel) {
                    e.target.textContent = "กำลังยกเลิก...";
                    e.target.disabled = true;
                    // Mock delay
                    await new Promise(resolve => setTimeout(resolve, 800));
                    card.style.opacity = "0.5";
                    e.target.textContent = "ยกเลิกแล้ว";
                }
            }
        });
    });

});
