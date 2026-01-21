const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Database setup
const dbPath = path.join(__dirname, 'vehicletokens.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Database connected successfully!');
    // Create table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS vehicle_tokens (
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
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('✅ Table created/verified successfully!');
      }
    });
  }
});

// Generate unique receipt number (YYYYMMDD-XXXXX format)
function generateReceiptNumber(date) {
  // Get date in YYYYMMDD format
  const dateStr = date.replace(/-/g, ''); // Remove dashes from YYYY-MM-DD
  const datePart = dateStr.substring(0, 8); // First 8 digits (YYYYMMDD)
  
  // Get last 5 unique numbers from database for today
  return new Promise((resolve, reject) => {
    const todayDate = dateStr.substring(0, 8);
    const sql = `SELECT COUNT(*) as count FROM vehicle_tokens 
      WHERE receipt_no LIKE ?`;
    
    db.get(sql, [`${todayDate}-%`], (err, row) => {
      if (err) {
        console.error('Error getting receipt count:', err.message);
        // Fallback to random number
        const randomNum = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
        resolve(`${datePart}-${randomNum}`);
      } else {
        // Generate 5 digit unique number based on count + random
        const count = row.count || 0;
        const uniqueNum = ((count * 7) + Math.floor(Math.random() * 1000)) % 99999;
        const uniqueStr = uniqueNum.toString().padStart(5, '0');
        resolve(`${datePart}-${uniqueStr}`);
      }
    });
  });
}

// API Routes

// Save new token/receipt
app.post('/api/save', (req, res) => {
  const {
    car,
    dname,
    dnum,
    hname,
    hnum,
    route,
    time,
    date
  } = req.body;

  // Validation
  if (!car || !dname || !dnum || !route || !time || !date) {
    return res.status(400).json({
      success: false,
      message: 'সব প্রয়োজনীয় ফিল্ড পূরণ করুন!'
    });
  }

  // Check for duplicate entry (same car, date, and time)
  const checkDuplicateSql = `SELECT id FROM vehicle_tokens 
    WHERE car_number = ? AND date = ? AND time = ?`;

  db.get(checkDuplicateSql, [car, date, time], (err, row) => {
    if (err) {
      console.error('Error checking duplicate:', err.message);
      return res.status(500).json({
        success: false,
        message: 'ডাটা চেক করতে সমস্যা হয়েছে!'
      });
    }

    if (row) {
      return res.status(409).json({
        success: false,
        message: 'এই গাড়ীর নাম্বার, তারিখ এবং সময়ের জন্য ইতিমধ্যে একটি রেকর্ড আছে! অনুগ্রহ করে অন্য সময় বা তারিখ ব্যবহার করুন।'
      });
    }

    // No duplicate found, proceed with insert
    generateReceiptNumber(date).then(receiptNo => {
      const sql = `INSERT INTO vehicle_tokens 
        (receipt_no, car_number, driver_name, driver_number, helper_name, helper_number, route, time, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.run(sql, [
        receiptNo,
        car,
        dname,
        dnum,
        hname || null,
        hnum || null,
        route,
        time,
        date
      ], function(err) {
        if (err) {
          console.error('Error inserting record:', err.message);
          return res.status(500).json({
            success: false,
            message: 'ডাটা সেভ করতে সমস্যা হয়েছে!'
          });
        }

        res.json({
          success: true,
          message: 'ডাটা সফলভাবে সেভ হয়েছে!',
          receiptNo: receiptNo,
          id: this.lastID
        });
      });
    }).catch(err => {
      console.error('Error generating receipt number:', err.message);
      return res.status(500).json({
        success: false,
        message: 'রিসিপ্ট নম্বর তৈরি করতে সমস্যা হয়েছে!'
      });
    });
  });
});

// Get all records
app.get('/api/records', (req, res) => {
  const sql = `SELECT * FROM vehicle_tokens ORDER BY created_at DESC`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching records:', err.message);
      return res.status(500).json({
        success: false,
        message: 'রেকর্ড লোড করতে সমস্যা হয়েছে!'
      });
    }

    res.json({
      success: true,
      records: rows
    });
  });
});

// Get single record by receipt number
app.get('/api/record/:receiptNo', (req, res) => {
  const receiptNo = req.params.receiptNo;
  const sql = `SELECT * FROM vehicle_tokens WHERE receipt_no = ?`;
  
  db.get(sql, [receiptNo], (err, row) => {
    if (err) {
      console.error('Error fetching record:', err.message);
      return res.status(500).json({
        success: false,
        message: 'রেকর্ড খুঁজে পাওয়া যায়নি!'
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        message: 'রেকর্ড খুঁজে পাওয়া যায়নি!'
      });
    }

    res.json({
      success: true,
      record: row
    });
  });
});

// Delete record
app.delete('/api/record/:id', (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM vehicle_tokens WHERE id = ?`;
  
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Error deleting record:', err.message);
      return res.status(500).json({
        success: false,
        message: 'রেকর্ড ডিলিট করতে সমস্যা হয়েছে!'
      });
    }

    res.json({
      success: true,
      message: 'রেকর্ড সফলভাবে ডিলিট হয়েছে!'
    });
  });
});

// Search records by receipt number or driver ID (car_number)
app.get('/api/search', (req, res) => {
  const { receiptNo, driverId } = req.query;
  
  if (!receiptNo && !driverId) {
    return res.status(400).json({
      success: false,
      message: 'রিসিপ্ট নম্বর অথবা ড্রাইভার ID প্রয়োজন!'
    });
  }

  let sql;
  let params;

  if (receiptNo) {
    // Search by receipt number (exact match)
    sql = `SELECT * FROM vehicle_tokens WHERE receipt_no = ? ORDER BY created_at DESC`;
    params = [receiptNo];
  } else if (driverId) {
    // Search by driver ID (car_number) - can be partial match
    sql = `SELECT * FROM vehicle_tokens WHERE car_number LIKE ? ORDER BY created_at DESC`;
    params = [`%${driverId}%`];
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error searching records:', err.message);
      return res.status(500).json({
        success: false,
        message: 'সার্চ করতে সমস্যা হয়েছে!'
      });
    }

    res.json({
      success: true,
      records: rows
    });
  });
});

// Get records by date (sorted by date)
app.get('/api/records-by-date', (req, res) => {
  const sql = `SELECT * FROM vehicle_tokens ORDER BY date DESC, time DESC, created_at DESC`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching records by date:', err.message);
      return res.status(500).json({
        success: false,
        message: 'রেকর্ড লোড করতে সমস্যা হয়েছে!'
      });
    }

    res.json({
      success: true,
      records: rows
    });
  });
});

// Export to Excel - Get all records
app.get('/api/export', (req, res) => {
  const sql = `SELECT * FROM vehicle_tokens ORDER BY date DESC, time DESC, created_at DESC`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching records for export:', err.message);
      return res.status(500).json({
        success: false,
        message: 'রেকর্ড লোড করতে সমস্যা হয়েছে!'
      });
    }

    res.json({
      success: true,
      records: rows
    });
  });
});

// Check duplicate
app.post('/api/check-duplicate', (req, res) => {
  const { car, date, time } = req.body;

  if (!car || !date || !time) {
    return res.json({
      exists: false
    });
  }

  const sql = `SELECT id FROM vehicle_tokens 
    WHERE car_number = ? AND date = ? AND time = ?`;

  db.get(sql, [car, date, time], (err, row) => {
    if (err) {
      console.error('Error checking duplicate:', err.message);
      return res.json({
        exists: false
      });
    }

    res.json({
      exists: !!row
    });
  });
});

// Search records by receipt number or driver ID (car_number)
app.get('/api/search', (req, res) => {
  const { receiptNo, driverId } = req.query;
  
  if (!receiptNo && !driverId) {
    return res.status(400).json({
      success: false,
      message: 'রিসিপ্ট নম্বর অথবা ড্রাইভার ID প্রয়োজন!'
    });
  }

  let sql;
  let params;

  if (receiptNo) {
    // Search by receipt number (exact match)
    sql = `SELECT * FROM vehicle_tokens WHERE receipt_no = ? ORDER BY created_at DESC`;
    params = [receiptNo];
  } else if (driverId) {
    // Search by driver ID (car_number) - can be partial match
    sql = `SELECT * FROM vehicle_tokens WHERE car_number LIKE ? ORDER BY created_at DESC`;
    params = [`%${driverId}%`];
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error searching records:', err.message);
      return res.status(500).json({
        success: false,
        message: 'সার্চ করতে সমস্যা হয়েছে!'
      });
    }

    res.json({
      success: true,
      records: rows
    });
  });
});

// Get records by date (sorted by date)
app.get('/api/records-by-date', (req, res) => {
  const sql = `SELECT * FROM vehicle_tokens ORDER BY date DESC, time DESC, created_at DESC`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching records by date:', err.message);
      return res.status(500).json({
        success: false,
        message: 'রেকর্ড লোড করতে সমস্যা হয়েছে!'
      });
    }

    res.json({
      success: true,
      records: rows
    });
  });
});

// Export to Excel - Get all records
app.get('/api/export', (req, res) => {
  const sql = `SELECT * FROM vehicle_tokens ORDER BY date DESC, time DESC, created_at DESC`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching records for export:', err.message);
      return res.status(500).json({
        success: false,
        message: 'রেকর্ড লোড করতে সমস্যা হয়েছে!'
      });
    }

    res.json({
      success: true,
      records: rows
    });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Database file: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed.');
    }
    process.exit(0);
  });
});
