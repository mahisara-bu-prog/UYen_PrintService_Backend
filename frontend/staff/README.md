# U-YEN Receive Print Management System

A management system for employees to control and track the status of customer print jobs, categorized by online and walk-in queues.

## 📋 Workflow

The system is designed to work in the following sequence:

1. **Waiting Queue:**
* New jobs will enter the status **"Waiting to Print"** (blue badge).
* The download button will be **green**.
2. **Processing:**
* When the employee clicks the **"⬇ Download File"** button, the system will automatically download the file to the computer.
* The status will immediately change to **"Processing"** (orange badge).
* The download button will turn **gray** to indicate that the file has been viewed.
3. **Completed:**
* When printing is complete, the employee clicks the **"Confirm Print Completed"** button.
* The status will change to... **"Operation Successful"** (Green Badge)
* The download button will turn **red** and be locked (disabled) to prevent duplicate file access.

---

## 🔍 Key Features

### 1. Queue Separation Mode
* **Online Mode**: Displays job queues from applications or websites (Q_001 - Q_003)
* **Walk In Mode**: Displays job queues specifically for customers visiting the store (Q_004 - Q_010)
* *Note: When the screen is opened for the first time, the system will display Online mode by default.*

### 2. Filtering System
* **Filter by Status**: Allows you to view only jobs that are "Pending Print", "In Progress", or "Completed".
* **Filter by Date**: Allows you to view print history by order date (supports Thai calendar).

### 3. Remarks System
* Supports displaying short and long remarks. If the remarks are too long, Employees can hover their mouse over the text to view the full message.

---

## 🎨 Meaning of Color Symbols

| Symbol | Meaning | Represents |
| :--- | :--- | :--- |
| **Blue Badge** | Document awaiting printing | Work has not yet started |
| **Orange Badge** | In progress | File downloaded for printing |
| **Green Badge** | Completed | Job finished |
| **Green Button** | Ready to download | New file not yet opened |
| **Red Button** | Access restricted | Job completed. Do not re-download. |

---

## 🛠 Technological Information
* **HTML5/CSS3**: Responsive design and Theme Toggle system
* **JavaScript (Vanilla)**: Controls state transition logic using DOM queries (Queue IDs)
* **Flatpickr**: Easy-to-use date selection library with Thai language support
