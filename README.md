# 🚗 Vehicle Token System - Receipt Management

একটি পেশাদার গাড়ির টোকেন সিস্টেম যা রিসিপ্ট প্রিন্ট করতে এবং ডাটাবেসে সব রেকর্ড সেভ করতে সাহায্য করে।

## Features (বৈশিষ্ট্য)

- ✅ **Unique Receipt Numbers** - প্রতিটি রিসিপ্টের জন্য অনন্য রিসিপ্ট নম্বর
- ✅ **Database Storage** - SQLite ডাটাবেসে সব রেকর্ড সংরক্ষণ
- ✅ **POS Print Ready** - 80mm (3 inch) thermal printer এর জন্য অপ্টিমাইজ করা
- ✅ **Professional Design** - আধুনিক এবং পেশাদার UI/UX
- ✅ **Bengali Font Support** - Noto Sans Bengali ফন্ট ব্যবহার
- ✅ **Record Management** - সব রেকর্ড দেখা এবং পরিচালনা

## Installation (ইনস্টলেশন)

### 1. Node.js ইনস্টল করুন
যদি আপনার কম্পিউটারে Node.js না থাকে, তাহলে [nodejs.org](https://nodejs.org/) থেকে ইনস্টল করুন।

### 2. Dependencies ইনস্টল করুন
প্রজেক্ট ফোল্ডারে টার্মিনাল খুলে নিচের কমান্ড চালান:

```bash
npm install
```

### 3. Server চালু করুন
```bash
npm start
```

অথবা development mode এ:
```bash
npm run dev
```

### 4. ব্রাউজারে ওপেন করুন
```
http://localhost:3000
```

## File Structure (ফাইল স্ট্রাকচার)

```
vehicle-token-system/
├── index.html          # Frontend (Website)
├── server.js           # Backend Server (Express + SQLite)
├── package.json        # Node.js Dependencies
├── vehicletokens.db    # SQLite Database (auto-created)
└── README.md          # Documentation
```

## API Endpoints (API এন্ডপয়েন্ট)

### POST `/api/save`
নতুন রিসিপ্ট সেভ করতে

**Request Body:**
```json
{
  "car": "গাড়ীর নাম্বার",
  "dname": "ড্রাইভারের নাম",
  "dnum": "ড্রাইভারের নাম্বার",
  "hname": "হেল্পার নাম (optional)",
  "hnum": "হেল্পার নাম্বার (optional)",
  "route": "রুট",
  "time": "সময়",
  "date": "তারিখ"
}
```

### GET `/api/records`
সব রেকর্ড পেতে

### GET `/api/record/:receiptNo`
নির্দিষ্ট রিসিপ্ট নম্বর দিয়ে রেকর্ড পেতে

### GET `/api/search?query=search_term`
রেকর্ড সার্চ করতে

### DELETE `/api/record/:id`
রেকর্ড ডিলিট করতে

## Database Schema (ডাটাবেস স্কিমা)

```sql
CREATE TABLE vehicle_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  receipt_no TEXT UNIQUE NOT NULL,
  car_number TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_number TEXT NOT NULL,
  helper_name TEXT,
  helper_number TEXT,
  route TEXT NOT NULL,
  time TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Print Settings (প্রিন্ট সেটিংস)

রিসিপ্টটি **80mm (3 inch) thermal printer** এর জন্য অপ্টিমাইজ করা হয়েছে। 

প্রিন্ট করার জন্য:
1. ফর্ম পূরণ করুন
2. "সেভ করুন এবং প্রিন্ট করুন" বাটনে ক্লিক করুন
3. Print dialog থেকে আপনার printer select করুন
4. Print করুন

## Technologies Used (ব্যবহৃত প্রযুক্তি)

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Fonts:** Noto Sans Bengali, Roboto

## Support (সাপোর্ট)

যদি কোনো সমস্যা হয়, তাহলে:
1. Server চালু আছে কিনা দেখুন
2. Database file (`vehicletokens.db`) সঠিকভাবে create হয়েছে কিনা দেখুন
3. Browser console এ error messages দেখুন

## License (লাইসেন্স)

ISC License

---

**Made with ❤️ for Vehicle Token Management**
