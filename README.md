# GPS Based Attendance System 

A web-based attendance management system that verifies student presence through **QR code scanning** and **geolocation**.
Teachers generate QR codes for each class, and students mark attendance by scanning them within a defined location radius.

---

 🧩 Features

* Teacher-generated QR codes for each lecture.
* Real-time location-based attendance validation.
* Secure API endpoints built with Spring Boot.
* Frontend web app using HTML, CSS, and JavaScript.
* MySQL database for storing students, lectures, and attendance.

---

 🛠 Tech Stack

Backend:Java (Spring Boot), ZXing Library (QR generation)
Frontend: HTML, CSS, JavaScript (with Geolocation API)
Database: MySQL
Version Control: Git & GitHub

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/smart-attendance-system.git
cd GPS-based-attendance-system
```

### 2. Backend setup

* Open the project in **IntelliJ IDEA** or **Eclipse** or **VS Code**
* Configure **application.properties** with your MySQL credentials:

  ```properties
  spring.datasource.url=jdbc:mysql://localhost:3306/attendance
  spring.datasource.username=root
  spring.datasource.password=yourpassword
  ```
* Run the Spring Boot application.

### 3. Database setup

Run this SQL script in MySQL:

```sql
CREATE DATABASE attendance;
USE attendance;

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  roll_no VARCHAR(50)
);

CREATE TABLE lectures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(100),
  class_latitude DOUBLE,
  class_longitude DOUBLE,
  date DATE,
  time TIME
);

CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  lecture_id INT,
  timestamp DATETIME,
  latitude DOUBLE,
  longitude DOUBLE,
  status VARCHAR(10)
);
```

### 4. Frontend setup

* Place frontend files in `/frontend` folder.
* Use a simple local server or Spring Boot static resources to host HTML.
* Test the location access and QR scanning using a mobile browser.

---

## 📍 Location Validation

The backend validates attendance by comparing:

* **Student’s coordinates** vs **Class coordinates**.
* If distance ≤ 50 meters → attendance is marked “Present”.
* Uses the **Haversine formula** for distance calculation.

---

## 🧾 API Endpoints

| Method | Endpoint                      | Description                        |
| ------ | ----------------------------- | ---------------------------------- |
| `POST` | `/api/generate-qr`            | Generate QR for a lecture          |
| `POST` | `/api/mark-attendance`        | Mark attendance using scanned data |
| `GET`  | `/api/attendance/{studentId}` | Get student attendance report      |

---

## 🚀 Future Enhancements

* Add authentication (JWT) for teachers/students.
* Email notifications for attendance summary.
* Admin dashboard with analytics.

---

## 👨‍💻 Authors
Emails of the authors:-

**Ayush Dungrakoti** - ayushdk2005@gmail.com

**Shlok Sathwara**- shloksathwara2@gmail.com

**Abhimanyu Guleria** - abhimanyuguleriaixf@gmail.com

**Kunjal Fadtare**- fadtarekunjal@gmail.com


