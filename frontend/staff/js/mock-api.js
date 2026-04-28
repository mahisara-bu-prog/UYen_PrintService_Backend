/**
 * MOCK API & JWT AUTHENTICATION FLOW
 * Simulated Database and API endpoints for future JWT connection
 */

// Simulated Local Database (In-Memory)
const MockDatabase = {
    users: [
        { id: 'USER_01', name: 'Natchanon', status: 'Blacklist', phone: '0622360567', email: 'natchanon@bumail.net', password: '12345' },
        { id: 'USER_02', name: 'Jeerapat', status: 'ปกติ', phone: '0621112222', email: 'jeerapat@bumail.net', password: '12345' },
        { id: 'USER_03', name: 'Akkarawin', status: 'ปกติ', phone: '0623334444', email: 'akkarawin@bumail.net', password: '12345' },
        { id: 'USER_04', name: 'Stefan', status: 'ปกติ', phone: '0625556666', email: 'stefan@bumail.net', password: '12345' }
    ],
    employees: [
        { id: 'USER_01', name: 'Somporn', role: 'Admin', phone: '0871234550', email: 'somporn@bumail.net', password: '12345' },
        { id: 'USER_02', name: 'Pornchai', role: 'พนักงาน', phone: '0872223333', email: 'pornchai@bumail.net', password: '12345' },
        { id: 'USER_03', name: 'Anutin', role: 'พนักงาน', phone: '0874445555', email: 'anutin@bumail.net', password: '12345' },
        { id: 'USER_04', name: 'Prakob', role: 'พนักงาน', phone: '0876667777', email: 'prakob@bumail.net', password: '12345' }
    ],
    inventory: [
        { id: 'INV_01', name: 'กระดาษ', subType: 'A4', type: 'กระดาษปอนด์ 70 แกรม', qty: 22, unit: 'รีม', price: 5, reorder: 10, statusInfo: 'instock' },
        { id: 'INV_02', name: 'หมึกพิมพ์', subType: 'เครื่องอิงค์เจ็ท (Inkjet)', type: 'สีดำ (Black - K)', qty: 3, unit: 'ขวด', price: 3, reorder: 10, statusInfo: 'low' },
        { id: 'INV_03', name: 'กระดาษ', subType: 'A4', type: 'กระดาษอาร์ตมัน 120g', qty: 0, unit: 'รีม', price: 6, reorder: 15, statusInfo: 'out' },
        { id: 'INV_04', name: 'กระดาษ', subType: 'นามบัตร (54x90 mm)', type: 'กระดาษอาร์ตมัน 160g', qty: 300, unit: 'กล่อง', price: 7, reorder: 50, statusInfo: 'instock' },
        { id: 'INV_05', name: 'หมึกพิมพ์', subType: 'เครื่องเลเซอร์ (Laser)', type: 'สีน้ำเงินอ่อน (Light Cyan)', qty: 2, unit: 'ตลับ', price: 10, reorder: 15, statusInfo: 'low' },
        { id: 'INV_06', name: 'กระดาษ', subType: 'A3', type: 'สติ๊กเกอร์ PVC (ใส)', qty: 70, unit: 'รีม', price: 22, reorder: 10, statusInfo: 'instock' },
        { id: 'INV_07', name: 'หมึกพิมพ์', subType: 'หมึกพิมพ์ใบเสร็จ', type: 'สีดำ (Black - K)', qty: 3, unit: 'ม้วน', price: 45, reorder: 3, statusInfo: 'low' },
        { id: 'INV_08', name: 'กระดาษ', subType: 'F4', type: 'กระดาษปอนด์ 80 แกรม', qty: 15, unit: 'รีม', price: 8, reorder: 5, statusInfo: 'instock' },
        { id: 'INV_09', name: 'กระดาษ', subType: 'A2', type: 'กระดาษคราฟท์ (สีน้ำตาล)', qty: 5, unit: 'รีม', price: 15, reorder: 10, statusInfo: 'low' },
        { id: 'INV_10', name: 'หมึกพิมพ์', subType: 'อิงค์แทงค์ (Ink Tank)', type: 'สีเหลือง (Yellow - Y)', qty: 8, unit: 'ขวด', price: 12, reorder: 5, statusInfo: 'instock' }
    ],
    receiveMaterials: [
        // Dummy data for receive materials log
        { id: 'RM_01', name: 'Somyot', matName: 'กระดาษ', subType: 'A4', matType: 'กระดาษปอนด์ 70 แกรม (กระดาษปกติ)', qty: 10, date: '2026-04-12T08:00:00Z', note: '-' },
        { id: 'RM_02', name: 'Somyot', matName: 'หมึกพิมพ์', subType: 'เครื่องอิงค์เจ็ท (Inkjet)', matType: 'สีดำ (Black - K)', qty: 5, date: '2026-04-12T08:00:00Z', note: 'เติมด่วน' }
    ],
    receivePrints: [
        { 
            id: 'Q_001', theme: 'online', status: 'รอพิมพ์เอกสาร', totalPrice: 23, orderDate: '2026-03-20T08:00:00Z', receiveDate: '2026-03-21T09:00:00Z',
            items: [
                { fileName: 'Sad_Project2.PDF', printTypeHtml: '<span class="text-color-green">สี</span>', docSize: 'A4', docType: 'ร้อยปอนด์', qty: 1, price: 23, note: 'ปริ้นงานสี', fileUrl: 'item/receiveprint1.png' }
            ]
        },
        { 
            id: 'Q_002', theme: 'online', status: 'รอพิมพ์เอกสาร', totalPrice: 18, orderDate: '2026-03-20T08:00:00Z', receiveDate: '2026-03-21T09:10:00Z',
            items: [
                { fileName: 'Sad_Project2.PDF', printTypeHtml: 'ขาว - ดำ', docSize: 'A4', docType: 'ธรรมดา', qty: 2, price: 9, note: '-', fileUrl: 'item/receiveprint2.png' }
            ]
        },
        { 
            id: 'Q_004', theme: 'walkin', status: 'รอพิมพ์เอกสาร', totalPrice: 85, orderDate: '2026-04-21T08:00:00Z', receiveDate: '2026-04-21T10:30:00Z',
            items: [
                { fileName: 'Walkin_Report.PDF', printTypeHtml: '<span class="text-color-green">สี</span>', docSize: 'A4', docType: 'อาตมัน', qty: 2, price: 42, note: '-', fileUrl: 'item/receiveprint3.png' }
            ]
        }
    ],
    recordPrintHistory: [
        { id: 'REC_01', paper: 'A4', type: 'กระดาษธรรมดา 70 แกรม', qty: 1, amount: 16, note: '-', date: '2026-03-21T08:00:00Z' },
        { id: 'REC_02', paper: 'A4', type: 'กระดาษธรรมดา 80 แกรม', qty: 3, amount: 55, note: 'ปรินท์งานสี', date: '2026-03-21T08:00:00Z' },
        { id: 'REC_03', paper: 'A4', type: 'กระดาษร้อยปอนด์ (ผิวหยาบ)', qty: 4, amount: 67, note: '-', date: '2026-03-21T08:00:00Z' },
        { id: 'REC_04', paper: 'A4', type: 'กระดาษอาร์ตมัน 100g', qty: 10, amount: 166, note: '-', date: '2026-03-21T08:00:00Z' },
        { id: 'REC_05', paper: 'A4', type: 'อาร์ตด้าน 120g', qty: 1, amount: 20, note: '-', date: '2026-03-21T08:00:00Z' },
        { id: 'REC_06', paper: 'A4', type: 'สติกเกอร์กระดาษ (ผิวมัน)', qty: 2, amount: 30, note: '-', date: '2026-03-21T08:00:00Z' },
        { id: 'REC_07', paper: 'A4', type: 'สติกเกอร์ PVC (ใส)', qty: 1, amount: 16, note: '-', date: '2026-03-21T08:00:00Z' },
        { id: 'REC_08', paper: 'A4', type: 'กระดาษคราฟท์ (สีน้ำตาล)', qty: 2, amount: 30, note: '-', date: '2026-03-21T08:00:00Z' }
    ],
    withdraws: [
        // Dummy data for withdraw log
        { id: 'WD_01', name: 'Somporn', matName: 'เทป', subType: 'ชนิดใส', matType: 'แกนเล็ก 1 นิ้ว', qty: 2, date: '2026-04-13T08:00:00Z', note: 'ใช้งานออฟฟิศ' },
        { id: 'WD_02', name: 'Amporn', matName: 'กระดาษ', subType: 'A4', matType: 'กระดาษปอนด์ 70 แกรม (กระดาษปกติ)', qty: 5, date: '2026-03-05T08:00:00Z', note: 'เบิกใช้ในสำนักงาน' }
    ],
    reportDailyPrints: [
        { customer: 'สมชาติ ทองเหม็น', material: 'A4', type: 'ร้อยปอนด์', qty: 1, printType: 'สี', time: '2026-04-24T12:49:00Z', price: 17 },
        { customer: 'สมชาย แซ่ตั้ง', material: 'A5', type: 'สติ๊กเกอร์', qty: 1, printType: 'ขาวดำ', time: '2026-04-24T15:21:00Z', price: 34 },
        { customer: 'User_Genrate(WalkIn)', material: 'A4', type: 'ธรรมดา', qty: 2, printType: 'ขาวดำ', time: '2026-04-24T13:11:00Z', price: 14 }
    ],
    reportStock: [
        { material: 'A4', type: 'สติ๊กเกอร์', qty: 1112, price: 15 },
        { material: 'A4', type: 'ร้อยปอนด์', qty: 25, price: 10, lowStock: true },
        { material: 'A3', type: 'ธรรมดา', qty: 2234, price: 10 }
    ],
    reportMonthlySales: [
        { date: '2026-05-18T00:00:00Z', items: 154, sales: 170000 },
        { date: '2026-05-17T00:00:00Z', items: 269, sales: 34000 },
        { date: '2026-05-16T00:00:00Z', items: 121, sales: 2000 }
    ],
    reports: [
        // Dummy data for reports
        { id: 'RPT_01', date: '2026-04-12', totalWithdraw: 1200, totalReceive: 3500, expenses: 1500 }
    ],
    materialOptions: {
        inventory: {
            "กระดาษ": {
                subTypes: ["A0", "A1", "A2", "A3", "A4", "A5", "F4", "นามบัตร (54x90 mm)"],
                types: [
                    "กระดาษปอนด์ 70 แกรม (กระดาษปกติ)", "กระดาษปอนด์ 80 แกรม", "กระดาษร้อยปอนด์ (ผิวหยาบ)",
                    "กระดาษร้อยปอนด์ (ผิวเรียบ)", "กระดาษอาร์ตมัน 100g", "กระดาษอาร์ตมัน 120g",
                    "กระดาษอาร์ตมัน 160g", "อาร์ตด้าน 100g", "อาร์ตด้าน 120g", "อาร์ตด้าน 160g",
                    "กระดาษโฟโต้", "สติ๊กเกอร์กระดาษ (ผิวมัน)", "สติ๊กเกอร์กระดาษ (ผิวด้าน)",
                    "สติ๊กเกอร์ PVC (ใส)", "สติ๊กเกอร์ PVC (ขาวเงา)", "สติ๊กเกอร์ PVC (ขาวด้าน)",
                    "กระดาษคราฟท์ (สีน้ำตาล)", "เทรซิ่ง (กระดาษไข)"
                ]
            },
            "หมึกพิมพ์": {
                subTypes: ["เครื่องอิงค์เจ็ท (Inkjet)", "เครื่องเลเซอร์ (Laser)", "อิงค์แทงค์ (Ink Tank)", "หมึกพิมพ์ใบเสร็จ"],
                types: ["สีดำ (Black - K)", "สีฟ้า (Cyan - C)", "สีชมพู (Magenta - M)", "สีเหลือง (Yellow - Y)", "สีฟ้าอ่อน (Light Cyan)", "สีชมพูอ่อน (Light Magenta)"]
            },
            "วัสดุเข้าเล่ม": {
                subTypes: ["สันห่วงกระดูกงูพลาสติก", "สันเกลียวพลาสติก", "สันรูดพลาสติก", "สันกระดูกงูเหล็ก (สันขดลวดคู่)", "สันเกลียวเหล็ก"],
                types: [
                    "3 mm", "5 mm", "6 mm", "6.4 mm", "7 mm", "8 mm", "9.5 mm", "10 mm", "11 mm", "12 mm",
                    "12.7 mm", "14 mm", "14.3 mm", "15 mm", "16 mm", "17 mm", "18 mm", "19 mm", "20 mm",
                    "22 mm", "25 mm", "25.4 mm", "28 mm", "30 mm", "32 mm", "38 mm", "45 mm", "50 mm", "51 mm"
                ]
            },
            "วัสดุเคลือบ": {
                subTypes: ["ขนาด A3", "ขนาด A4", "ขนาด F4", "ขนาด บัตรประชาชน/นามบัตร", "ขนาด A5", "ขนาด B4", "ขนาด B5", "ขนาด A6 (4x6 นิ้ว)"],
                types: [
                    "แบบใส 75 ไมครอน", "แบบใส 100 ไมครอน", "แบบใส 125 ไมครอน", "แบบใส 150 ไมครอน",
                    "แบบใส 250 ไมครอน", "แบบด้าน (Matte)", "แบบมีกาวในตัว"
                ]
            },
            "อื่น": {
                subTypes: [
                    "กรรไกร", "คัตเตอร์", "ใบมีดคัตเตอร์", "แผ่นรองตัด", "เครื่องเจาะรูตุ๊ดตู่",
                    "เครื่องเย็บกระดาษ (แม็ก)", "ลวดเย็บกระดาษ", "ที่ถอนลวดเย็บ", "คลิปดำหนีบกระดาษ",
                    "ลวดเสียบกระดาษ", "เทปกาวใส", "เทปขุ่น (เทปเขียนทับได้)", "เทปกาวสองหน้า (แบบบาง)",
                    "เทปกาวสองหน้า (แบบหนา/โฟม)", "เทปผ้า", "กาวน้ำ", "กาวแท่ง", "กาวสองหน้าแบบลูกกลิ้ง",
                    "ซองเอกสารสีน้ำตาล (แบบเรียบ)", "ซองเอกสารสีน้ำตาล (แบบขยายข้าง)", "ซองเอกสารสีขาว",
                    "ซองพลาสติกใส", "ซองกันกระแทก (มีบับเบิ้ล)", "แฟ้มซองสอดพลาสติก"
                ],
                typesBySubType: {
                    "ลวดเย็บกระดาษ": ["เบอร์ 10", "เบอร์ 3", "เบอร์ 35", "เบอร์ 23/6", "เบอร์ 23/8", "เบอร์ 23/10", "เบอร์ 23/13", "เบอร์ 23/15", "เบอร์ 23/17", "เบอร์ 23/20", "เบอร์ 23/24"],
                    "คลิปดำหนีบกระดาษ": ["15 mm (เบอร์ 113)", "19 mm (เบอร์ 112)", "25 mm (เบอร์ 111)", "32 mm (เบอร์ 110)", "41 mm (เบอร์ 109)", "51 mm (เบอร์ 108)"],
                    "ซองเอกสารสีน้ำตาล (แบบเรียบ)": ["4.5 x 7 นิ้ว", "7 x 10 นิ้ว", "9 x 12.75 นิ้ว", "9 x 12 นิ้ว", "10 x 13 นิ้ว", "11 x 14 นิ้ว"],
                    "ซองเอกสารสีน้ำตาล (แบบขยายข้าง)": ["4.5 x 7 นิ้ว", "7 x 10 นิ้ว", "9 x 12.75 นิ้ว", "9 x 12 นิ้ว", "10 x 13 นิ้ว", "11 x 14 นิ้ว"],
                    "ซองเอกสารสีขาว": ["4.5 x 7 นิ้ว", "7 x 10 นิ้ว", "9 x 12.75 นิ้ว", "9 x 12 นิ้ว", "10 x 13 นิ้ว", "11 x 14 นิ้ว"],
                    "ซองพลาสติกใส": ["4.5 x 7 นิ้ว", "7 x 10 นิ้ว", "9 x 12.75 นิ้ว", "9 x 12 นิ้ว", "10 x 13 นิ้ว", "11 x 14 นิ้ว"],
                    "ซองกันกระแทก (มีบับเบิ้ล)": ["4.5 x 7 นิ้ว", "7 x 10 นิ้ว", "9 x 12.75 นิ้ว", "9 x 12 นิ้ว", "10 x 13 นิ้ว", "11 x 14 นิ้ว"],
                    "เทปกาวใส": ["1/2 นิ้ว (12 mm)", "3/4 นิ้ว (18 mm)", "1 นิ้ว (24 mm)", "1.5 นิ้ว (36 mm)", "2 นิ้ว (48 mm)"],
                    "เทปขุ่น (เทปเขียนทับได้)": ["1/2 นิ้ว (12 mm)", "3/4 นิ้ว (18 mm)", "1 นิ้ว (24 mm)", "1.5 นิ้ว (36 mm)", "2 นิ้ว (48 mm)"],
                    "เทปกาวสองหน้า (แบบบาง)": ["1/2 นิ้ว (12 mm)", "3/4 นิ้ว (18 mm)", "1 นิ้ว (24 mm)", "1.5 นิ้ว (36 mm)", "2 นิ้ว (48 mm)"],
                    "เทปกาวสองหน้า (แบบหนา/โฟม)": ["1/2 นิ้ว (12 mm)", "3/4 นิ้ว (18 mm)", "1 นิ้ว (24 mm)", "1.5 นิ้ว (36 mm)", "2 นิ้ว (48 mm)"],
                    "เทปผ้า": ["1/2 นิ้ว (12 mm)", "3/4 นิ้ว (18 mm)", "1 นิ้ว (24 mm)", "1.5 นิ้ว (36 mm)", "2 นิ้ว (48 mm)"],
                    "ใบมีดคัตเตอร์": ["ขนาด 9 mm มุม 30 องศา", "ขนาด 9 mm มุม 45 องศา", "ขนาด 18 mm มุม 30 องศา", "ขนาด 18 mm มุม 45 องศา"],
                    "default": ["เล็ก", "กลาง", "ใหญ่"]
                }
            }
        },
        units: ['เล่ม', 'รีม', 'แผ่น', 'แพ็ค', 'หลอด', 'ขวด', 'เส้น', 'กล่อง', 'ด้าม', 'ตัว', 'ใบ', 'ซอง', 'ชิ้น', 'แท่ง', 'ตลับ', 'อัน', 'ม้วน', 'ก้อน', 'ถุง', 'กระป๋อง', 'ชุด'].sort((a, b) => a.localeCompare(b, 'th'))
    },
    printOptions: {
        paperTypes: ["A0", "A1", "A2", "A3", "A4", "A5", "F4", "นามบัตร (54x90 mm)"],
        printTypes: [
            "กระดาษปอนด์ 70 แกรม (กระดาษปกติ)", "กระดาษปอนด์ 80 แกรม", "กระดาษร้อยปอนด์ (ผิวหยาบ)",
            "กระดาษร้อยปอนด์ (ผิวเรียบ)", "กระดาษอาร์ตมัน 100g", "กระดาษอาร์ตมัน 120g", "กระดาษอาร์ตมัน 160g",
            "อาร์ตด้าน 100g", "อาร์ตด้าน 120g", "อาร์ตด้าน 160g", "กระดาษโฟโต้",
            "สติ๊กเกอร์กระดาษ (ผิวมัน)", "สติ๊กเกอร์กระดาษ (ผิวด้าน)", "สติ๊กเกอร์ PVC (ใส)",
            "สติ๊กเกอร์ PVC (ทึบ)", "กระดาษคราฟท์ (สีน้ำตาล)"
        ]
    }
};

/**
 * 1. Simulates Authentication API
 */
const generateMockToken = () => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa("dummy_payload") + ".Signature";

// Return promise bridging to login success
const fakeLogin = (username, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (username && password) {
                // In a real API, it would check the db
                const token = generateMockToken();
                localStorage.setItem("authToken", token);
                localStorage.setItem("currentUser", username);
                resolve({ success: true, token: token });
            } else {
                reject(new Error("Missing credentials"));
            }
        }, 800);
    });
};

const fakeLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
};

/**
 * 2. MAIN FETCH API SIMULATION
 * Replace native fetch() calls with this function to mimic latency & JWT auth validation
 */
const fetchApi = (endpoint, options = {}) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const token = localStorage.getItem("authToken");

            // Ignore JWT validation if login endpoint
            if (endpoint !== "/api/login") {
                // 1. Verify Authentication 
                if (!token || !token.startsWith("eyJ")) {
                    console.error("401 Unauthorized: No valid JWT token found");
                    // In real API, we automatically kick to login
                    // window.location.href = "index.html";
                    // But we won't kick here so UI can handle error
                    return reject(new Error("401 Unauthorized: Please login again."));
                }
            }

            // 2. Map endpoints to mock database
            let responseData = [];
            switch (endpoint) {
                case "/api/users":
                    responseData = MockDatabase.users;
                    break;
                case "/api/employees":
                    responseData = MockDatabase.employees;
                    break;
                case "/api/inventory":
                    responseData = MockDatabase.inventory;
                    break;
                case "/api/receive-materials":
                    responseData = MockDatabase.receiveMaterials;
                    break;
                case "/api/receive-prints":
                    responseData = MockDatabase.receivePrints;
                    break;
                case "/api/record-print-history":
                    responseData = MockDatabase.recordPrintHistory;
                    break;
                case "/api/withdraws":
                    responseData = MockDatabase.withdraws;
                    break;
                case "/api/reports":
                    responseData = MockDatabase.reports;
                    break;
                case "/api/report-daily-prints":
                    responseData = MockDatabase.reportDailyPrints;
                    break;
                case "/api/report-stock":
                    responseData = MockDatabase.reportStock;
                    break;
                case "/api/report-monthly-sales":
                    responseData = MockDatabase.reportMonthlySales;
                    break;
                case "/api/material-options":
                    responseData = MockDatabase.materialOptions;
                    break;
                case "/api/print-options":
                    responseData = MockDatabase.printOptions;
                    break;
                default:
                    return reject(new Error(`404 Not Found: Endpoint ${endpoint}`));
            }

            // 3. Simulated Methods (GET, POST logic etc)
            // Currently assuming GET. If POST/PUT, we manipulate MockDatabase array.
            const method = (options.method || "GET").toUpperCase();
            
            if (method === "GET") {
                resolve(responseData);
            } else if (method === "POST") {
                // Example of simple append
                const payload = JSON.parse(options.body || "{}");
                payload.id = 'NEW_' + Date.now();
                responseData.unshift(payload); // add to top
                
                resolve({ success: true, data: payload });
            } else if (method === "DELETE") {
                // Simple pass through for mock
                resolve({ success: true });
            }

        }, Math.floor(Math.random() * 500) + 300); // 300ms to 800ms random latency
    });
};

/**
 * 3. Loading Spinner UI Helper
 */
const createLoadingSpinner = (colspan = 1) => {
    return `<tr><td colspan="${colspan}" style="text-align: center; padding: 3rem 0;">
                <div class="loader-spinner" style="margin: 0 auto 10px auto;"></div>
                <p style="color: #64748b; font-weight: 500;">กำลังโหลดข้อมูลจำลองผ่าน JWT Flow...</p>
            </td></tr>`;
};

// Add spinner CSS to head dynamically if it doesn't exist
const injectSpinnerCSS = () => {
    if (!document.getElementById("mock-api-styles")) {
        const style = document.createElement("style");
        style.id = "mock-api-styles";
        style.innerHTML = `
            .loader-spinner {
                border: 4px solid rgba(59, 130, 246, 0.2);
                border-top: 4px solid #3b82f6;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
};

document.addEventListener("DOMContentLoaded", injectSpinnerCSS);
