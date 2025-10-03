# Quick Start Guide - RFID Terminal

## 🚀 Getting Started (3 Steps)

### Step 1: Open the Terminal
1. Log in as **Admin**
2. Click **"RFID Terminal"** in the sidebar
3. Select a **classroom** from the dropdown
4. Click **"Open Terminal Window"**

### Step 2: Launch Fullscreen
1. In the new window, verify the classroom
2. Click **"Launch Terminal in Fullscreen Mode"**
3. Terminal is now active! ✅

### Step 3: Use the Terminal
Teachers simply **tap their RFID card** on the Hoba reader. That's it!

---

## ⚡ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **Automatic** | No buttons to press - just tap the card |
| ✅ **Smart** | Knows when to tap in or out automatically |
| 🔒 **Strict** | Validates schedule, time, and classroom |
| ⏰ **Grace Period** | ±15 minutes flexibility |
| 🔊 **Feedback** | Audio beeps + large visual confirmation |
| 📅 **Schedule** | Shows today's classes for this room |
| 👥 **Active** | Displays who's currently in the classroom |

---

## 📋 Validation Rules

### ✓ To tap IN successfully:
- Must have a schedule for **today** (day of week)
- Must be **within scheduled time** ± 15 minutes
- Must be at the **correct classroom** terminal
- Cannot already be tapped in elsewhere

### ✓ To tap OUT successfully:
- Must have an **active session** (already tapped in)
- That's it! No other validation needed for tap out

---

## 🎯 Example Scenarios

### ✅ SUCCESS: Valid Tap In
```
Teacher: Maria Santos
Day: Monday
Time: 8:50 AM
Schedule: Monday 9:00-11:00 AM, Room 101
Terminal: Room 101

Result: ✓ TAPPED IN (within grace period)
```

### ❌ FAIL: Wrong Classroom
```
Teacher: Maria Santos
Day: Monday
Time: 9:00 AM
Schedule: Monday 9:00-11:00 AM, Room 101
Terminal: Room 201 (WRONG!)

Result: ✗ No schedule for Monday in this classroom
```

### ❌ FAIL: Wrong Time
```
Teacher: Maria Santos
Day: Monday
Time: 7:30 AM
Schedule: Monday 9:00-11:00 AM, Room 101
Terminal: Room 101

Result: ✗ Not within scheduled time
Reason: Too early (even with 15 min grace period)
```

### ✅ SUCCESS: Valid Tap Out
```
Teacher: Maria Santos
Status: Currently tapped in
Time: 11:00 AM

Result: ✓ TAPPED OUT
```

---

## 🖥️ Terminal Display Layout

```
┌─────────────────────────────────────────────────────┐
│ 🎙️ NDKC RFID Terminal    [🔊] [📶 ONLINE] [🕐 9:15 AM] │
│ Room 101 - Main Building 1st Floor                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│              ┌─────────────────────┐               │
│              │    ✓ SUCCESS        │               │
│              │                     │               │
│              │  Maria Santos       │               │
│              │  Tapped IN          │               │
│              │  Business Math      │               │
│              │  9:15 AM           │               │
│              └─────────────────────┘               │
│                                                     │
│           [Ready to Scan]                          │
│           Please tap your RFID card                │
│                                                     │
├─────────────────────────────────────────────────────┤
│ 📅 Today's Schedule    │ 👥 Active Now (2)          │
│ ─────────────────────  │ ──────────────────────     │
│ Maria Santos           │ Maria Santos               │
│ 9:00-11:00 AM          │ In: 9:15 AM (45 min)      │
│ Business Math          │                            │
│                        │ John Dela Cruz             │
│ John Dela Cruz         │ In: 10:05 AM (10 min)     │
│ 10:00-12:00 PM         │                            │
│ Programming            │                            │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Visual Feedback

| Status | Display | Sound |
|--------|---------|-------|
| ✅ Success | Large green checkmark | High-pitched beep (short) |
| ❌ Failure | Large red X | Low-pitched buzz (long) |
| ⏳ Scanning | Pulsing icon | Silent |
| 📡 Offline | Red banner | Silent |

---

## 🔧 Troubleshooting

### Problem: Terminal won't read cards
**Solution:**
- Click anywhere on the screen to ensure focus
- Check if Hoba reader is connected
- Try pressing F5 to refresh

### Problem: Always says "No schedule"
**Solution:**
- Verify the correct classroom is selected
- Check that teacher has schedules in the system
- Confirm it's the right day of the week

### Problem: Says "Not within scheduled time"
**Solution:**
- Check current time vs. schedule
- Remember: ±15 minute grace period only
- If it's 8:44 AM and class is 9:00 AM, still too early

### Problem: Can't tap in, already tapped in
**Solution:**
- Teacher must tap out from their previous session first
- Check the "Active Now" section to see where they're tapped in
- Use Testing Simulator in Admin Dashboard to manually tap out if needed

---

## 📱 For Teachers: Quick Reference Card

```
╔═══════════════════════════════════════╗
║   RFID ATTENDANCE - HOW TO USE       ║
╠═══════════════════════════════════════╣
║                                       ║
║  1. Arrive at your scheduled class   ║
║  2. Tap your RFID card on reader     ║
║  3. Wait for ✓ green checkmark       ║
║                                       ║
║  At end of class:                    ║
║  4. Tap your RFID card again         ║
║  5. Wait for ✓ green checkmark       ║
║                                       ║
╠═══════════════════════════════════════╣
║  ⚠️ IMPORTANT RULES:                  ║
║                                       ║
║  • Tap at the RIGHT classroom        ║
║  • Tap at the RIGHT time             ║
║  • One tap in at a time              ║
║  • Always tap out when done          ║
║                                       ║
╠═══════════════════════════════════════╣
║  ❓ If you see a RED ✗:              ║
║                                       ║
║  Read the error message!             ║
║  Common issues:                       ║
║  - Wrong classroom                    ║
║  - Wrong time (too early/late)       ║
║  - Already tapped in elsewhere       ║
║                                       ║
║  Contact IT if problem persists      ║
║                                       ║
╚═══════════════════════════════════════╝
```

---

## 🧪 Testing Checklist

Before deploying to production:

- [ ] Test with actual Hoba RFID reader
- [ ] Verify all teachers can tap in during their schedules
- [ ] Test grace period (15 min before/after)
- [ ] Confirm classroom validation works
- [ ] Check that tap out works without validation
- [ ] Test sound feedback (success and failure)
- [ ] Verify fullscreen mode on terminal display
- [ ] Check "Today's Schedule" displays correctly
- [ ] Confirm "Active Now" updates in real-time
- [ ] Test offline/online status indicators
- [ ] Try edge cases (multiple tap attempts, wrong cards, etc.)

---

## 📞 Support

**Questions?** Check the full guide: `RFID_TERMINAL_GUIDE.md`

**Issues?** Contact IT Support or use the Testing Simulator in Admin Dashboard

**Emergency?** Use Testing Simulator to manually manage attendance

---

**Quick Tip:** The grace period is set to 15 minutes. If teachers often arrive late or leave early, you can adjust this in the code: `GRACE_PERIOD_MINUTES = 15`

