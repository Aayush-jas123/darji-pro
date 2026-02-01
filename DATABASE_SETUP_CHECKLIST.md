# 📋 DATABASE SETUP CHECKLIST

Follow these steps **IN ORDER** in Neon SQL Editor.

---

## ⚠️ BEFORE YOU START

1. Open **Neon Console**: https://console.neon.tech
2. Select your **darji-pro** project
3. Go to **SQL Editor**
4. Wait for database to wake up (green "Ready to connect" status)

---

## 📝 STEP-BY-STEP INSTRUCTIONS

### ✅ CHUNK 1: Create ENUM Types
**File:** `chunk_1_enums.sql`

1. Open `chunk_1_enums.sql`
2. Copy **ALL** contents
3. Paste into Neon SQL Editor
4. Click **"Run"** button
5. Wait for: `CHUNK 1 COMPLETE: ENUM types created!`

**Expected Result:** ✅ 5 ENUM types created

---

### ✅ CHUNK 2: Create Users & Branches
**File:** `chunk_2_users_branches.sql`

1. Open `chunk_2_users_branches.sql`
2. Copy **ALL** contents
3. Paste into Neon SQL Editor
4. Click **"Run"** button
5. Wait for: `CHUNK 2 COMPLETE: Users and Branches tables created!`

**Expected Result:** ✅ 2 tables created (users, branches)

---

### ✅ CHUNK 3: Create Measurements & Appointments
**File:** `chunk_3_measurements_appointments.sql`

1. Open `chunk_3_measurements_appointments.sql`
2. Copy **ALL** contents
3. Paste into Neon SQL Editor
4. Click **"Run"** button
5. Wait for: `CHUNK 3 COMPLETE: Measurements and Appointments tables created!`

**Expected Result:** ✅ 4 tables created (measurement_profiles, measurement_versions, appointments, tailor_availability)

---

### ✅ CHUNK 4: Create Orders & Invoices
**File:** `chunk_4_orders_invoices.sql`

1. Open `chunk_4_orders_invoices.sql`
2. Copy **ALL** contents
3. Paste into Neon SQL Editor
4. Click **"Run"** button
5. Wait for: `CHUNK 4 COMPLETE: Orders and Invoices tables created!`

**Expected Result:** ✅ 2 tables created (orders, invoices)

---

### ✅ CHUNK 5: Insert Sample Data
**File:** `chunk_5_sample_data.sql`

1. Open `chunk_5_sample_data.sql`
2. Copy **ALL** contents
3. Paste into Neon SQL Editor
4. Click **"Run"** button
5. Wait for: `✅ ALL CHUNKS COMPLETE! Database is ready!`

**Expected Result:** ✅ Sample admin user and branch inserted

---

## 🎉 VERIFICATION

After completing all 5 chunks, you should see:

**Tables Created:**
- ✅ users
- ✅ branches
- ✅ measurement_profiles
- ✅ measurement_versions
- ✅ appointments
- ✅ tailor_availability
- ✅ orders
- ✅ invoices

**Sample Data:**
- ✅ Admin user: admin@darjipro.com / admin123
- ✅ Main Branch in Mumbai

---

## 🚀 TEST REGISTRATION

Once all chunks are complete:

1. Go to: https://darji-pro.onrender.com/register
2. Fill in your details
3. Click "Sign up"
4. ✅ **Should work!**

---

## ❌ IF YOU GET AN ERROR

### Error: "relation already exists"
**Solution:** This is OK! It means the table was already created. Continue to next chunk.

### Error: "type already exists"
**Solution:** This is OK! The ENUM type already exists. Continue to next chunk.

### Error: "Failed to fetch"
**Solution:** 
1. Wait 30 seconds
2. Refresh the page
3. Try again

### Error: "foreign key constraint"
**Solution:** You skipped a chunk! Go back and run the previous chunks first.

---

## 📞 NEED HELP?

If you get stuck:
1. Take a screenshot of the error
2. Note which chunk number failed
3. Share the error message

---

**Start with CHUNK 1 now!** 🚀
