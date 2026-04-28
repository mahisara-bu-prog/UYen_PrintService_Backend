/**
 * navbar.js
 * Automatically loads navbar.html into #navbar-placeholder and highlights the active link.
 */

document.addEventListener('DOMContentLoaded', function () {
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) return;

    fetch('navbar.html')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load navbar.html');
            return response.text();
        })
        .then(html => {
            placeholder.innerHTML = html;
            
            const userRole = localStorage.getItem('userRole') || 'พนักงาน';
            const currentUser = localStorage.getItem('currentUser') || 'Unknown';
            
            // Update profile
            const usernameEl = placeholder.querySelector('.username');
            const roleBadgeEl = placeholder.querySelector('.role-badge');
            if (usernameEl) usernameEl.textContent = currentUser;
            if (roleBadgeEl) {
                roleBadgeEl.textContent = userRole;
                if (userRole === 'Admin' || userRole === 'ผู้ดูแลระบบ') {
                    roleBadgeEl.className = 'role-badge nav-role-badge-purple';
                } else if (userRole === 'เจ้าของร้าน' || userRole === 'Owner') {
                    roleBadgeEl.className = 'role-badge nav-role-badge-orange';
                } else {
                    roleBadgeEl.className = 'role-badge nav-role-badge-blue';
                }
            }

            // Filter Navbar links based on role
            const navLinks = placeholder.querySelectorAll('.nav-links li');
            navLinks.forEach(li => {
                const page = li.getAttribute('data-page');
                let allowed = false;

                if (userRole === 'Admin' || userRole === 'ผู้ดูแลระบบ') {
                    allowed = true; // Admin sees everything
                } else if (userRole === 'เจ้าของร้าน' || userRole === 'Owner') {
                    if (page === 'report.html') allowed = true;
                } else {
                    // Employee (พนักงาน)
                    const allowedPages = ['receive-print.html', 'dashboard.html', 'inventory.html', 'withdraw.html', 'receive-material.html'];
                    if (allowedPages.includes(page)) allowed = true;
                }

                if (!allowed) {
                    li.remove();
                }
            });

            highlightActiveLink();
        })
        .catch(error => {
            console.error('Navbar error:', error);
            // Fallback in case fetch fails
            placeholder.innerHTML = '<div style="padding:10px; color:red; border:1px solid red; margin:10px; border-radius:8px;">Navbar failed to load.</div>';
        });
});

/**
 * Detects the current page and adds the .active class to the corresponding nav link.
 */
function highlightActiveLink() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    // Find the link that matches the current page
    const navLinks = document.querySelectorAll('.nav-links li');
    navLinks.forEach(li => {
        const dataPage = li.getAttribute('data-page');
        if (dataPage === page) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });
}

/**
 * Shows a premium confirmation modal when the user clicks Logout.
 */
function showLogoutModal() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'logout-modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        backdrop-filter: blur(4px);
        padding: 20px;
    `;

    // Create modal container
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: #fff;
        border-radius: 16px;
        overflow: hidden;
        max-width: 440px;
        width: 100%;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
        font-family: 'Prompt', sans-serif;
        opacity: 0;
        transform: scale(0.9) translateY(-15px);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
        background: linear-gradient(135deg, #ef4444, #dc2626);
        padding: 22px 30px;
        color: white;
    `;
    header.innerHTML = '<h2 style="margin:0; font-size:20px; font-weight:700;">ยืนยันการออกจากระบบ</h2>';

    // Body
    const body = document.createElement('div');
    body.style.cssText = `
        padding: 35px 30px;
        text-align: center;
    `;
    body.innerHTML = `
        <h3 style="margin:0; font-size:17px; font-weight:500; color:#1f2937; line-height:1.6;">
            คุณต้องการออกจากระบบใช่หรือไม่ ?
        </h3>
    `;

    // Footer
    const footer = document.createElement('div');
    footer.style.cssText = `
        padding: 20px 30px 30px;
        display: flex;
        justify-content: center;
        gap: 12px;
    `;

    // Buttons
    const confirmBtn = document.createElement('button');
    confirmBtn.innerText = 'ยืนยันออกจากระบบ';
    confirmBtn.style.cssText = `
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 24px;
        font-size: 14px;
        font-weight: 700;
        font-family: 'Prompt', sans-serif;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        transition: all 0.2s;
    `;
    confirmBtn.onmouseover = () => confirmBtn.style.filter = 'brightness(0.95)';
    confirmBtn.onmouseout = () => confirmBtn.style.filter = 'none';
    confirmBtn.onclick = () => window.location.href = 'index.html';

    const stayBtn = document.createElement('button');
    stayBtn.innerText = 'คงอยู่ต่อ';
    stayBtn.style.cssText = `
        background: #f1f5f9;
        color: #475569;
        border: none;
        border-radius: 8px;
        padding: 10px 24px;
        font-size: 14px;
        font-weight: 700;
        font-family: 'Prompt', sans-serif;
        cursor: pointer;
        transition: all 0.2s;
    `;
    stayBtn.onmouseover = () => stayBtn.style.background = '#e2e8f0';
    stayBtn.onmouseout = () => stayBtn.style.background = '#f1f5f9';
    stayBtn.onclick = () => {
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.9) translateY(-15px)';
        setTimeout(() => overlay.remove(), 300);
    };

    footer.append(confirmBtn, stayBtn);
    modal.append(header, body, footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Fade in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.style.transform = 'scale(1) translateY(0)';
        });
    });

    // Close on overlay click
    overlay.onclick = (e) => {
        if (e.target === overlay) stayBtn.click();
    };
}

