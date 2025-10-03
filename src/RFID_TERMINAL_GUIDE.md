# RFID Terminal Guide

## Overview

The NDKC RFID Terminal has been upgraded with automatic scanning, strict schedule validation, and fullscreen kiosk mode optimized for Hoba RFID readers.

## Key Features

### ✅ Automatic RFID Scanning
- Automatically reads RFID cards from Hoba reader
- No manual entry required
- Continuous scanning capability
- Auto-focus ensures reader input is always captured

### ✅ Strict Schedule Validation
- Validates day of week (Monday-Friday)
- Checks time against teacher's schedule
- Enforces classroom/terminal location matching
- **Grace Period**: ±15 minutes before/after scheduled time

### ✅ Smart Tap In/Out Detection
- Automatically detects if teacher should tap in or out
- If no active session exists: validates schedule and taps IN
- If active session exists: taps OUT (no validation needed)

### ✅ Fullscreen Kiosk Mode
- Optimized for dedicated terminal displays
- Large, clear visual feedback
- Touch-friendly interface
- ESC key to exit fullscreen

### ✅ Visual & Audio Feedback
- Large success/failure indicators
- Teacher name display
- Timestamp logging
- Configurable sound notifications
- Color-coded status (green = success, red = failure)

## How to Use the Terminal

### For Administrators

#### Setting Up a Terminal

1. **Log in to Admin Dashboard**
   - Navigate to "RFID Terminal" section
   - You'll see the terminal management interface

2. **Select Classroom**
   - Choose the classroom where the terminal is physically located
   - This is crucial for validation - teachers can only tap at their scheduled classroom

3. **Open Terminal Window**
   - Click "Open Terminal Window" button
   - A new window will open with the terminal setup page
   - Allow pop-ups if prompted

4. **Launch Fullscreen Mode**
   - In the terminal window, verify the classroom selection
   - Click "Launch Terminal in Fullscreen Mode"
   - The terminal will enter fullscreen kiosk mode

5. **Position the Terminal**
   - Place the Hoba RFID reader near the screen
   - Ensure teachers can easily access it
   - The terminal is now ready for use

#### Testing the Terminal

The Admin Dashboard includes a "Testing Simulator" that allows you to:
- Test RFID scanning without strict validation
- Quick-select teachers for testing
- Manually trigger tap in/out events
- View live status and today's attendance

### For Teachers

#### Using the Terminal

1. **Approach the Terminal**
   - Locate the RFID terminal at your scheduled classroom
   - Check the "Today's Schedule" section to verify your class time

2. **Tap Your RFID Card**
   - Place your RFID card on the Hoba reader
   - Wait for visual and audio confirmation
   - The system will automatically determine if you're tapping in or out

3. **Verify the Result**
   - **Green checkmark**: Successful tap in/out
   - **Red X**: Failed - see the message for details
   - Common failure reasons:
     - Not scheduled for this classroom
     - Outside of scheduled time (even with grace period)
     - Already tapped in elsewhere
     - Invalid RFID card

#### Important Rules

- ⚠️ **You must tap at the correct classroom** - The terminal validates your schedule
- ⚠️ **You must tap during your scheduled time** - ±15 minute grace period applies
- ⚠️ **One active session at a time** - You cannot tap in at multiple classrooms
- ⚠️ **Automatic detection** - The system knows if you need to tap in or out

## Schedule Validation Details

### Grace Period

The system allows a **15-minute grace period** before and after your scheduled time:

**Example:**
- **Scheduled Time**: 09:00 - 11:00
- **Allowed Tap In**: 08:45 - 11:15
- **Allowed Tap Out**: 08:45 - 11:15

### Day of Week Validation

The terminal checks that you have a schedule for the current day:
- If today is Monday, it looks for your Monday schedules
- If you're not scheduled for today, you cannot tap in

### Classroom Validation

You must tap at the correct terminal:
- Each terminal is assigned to a specific classroom
- Your schedule must include that classroom for the current time
- You cannot tap at a different classroom's terminal

## Error Messages

### Common Error Messages and Solutions

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Invalid RFID - Teacher not found" | RFID card not registered | Contact admin to register your RFID |
| "No schedule found for [Day] in this classroom" | You're not scheduled for this room today | Check your schedule or go to correct classroom |
| "Not within scheduled time" | Outside your scheduled time + grace period | Wait until your scheduled time or check schedule |
| "Tap in failed - Already tapped in elsewhere" | You have an active session in another classroom | Tap out from the other classroom first |
| "Terminal offline - Cannot process scan" | Network or system issue | Wait a moment or contact IT support |

## Terminal Display Information

### Header Section
- **NDKC RFID Terminal** branding
- **Classroom Name & Location** - Shows which classroom this terminal serves
- **Sound Toggle** - Mute/unmute audio feedback
- **Connection Status** - Online/Offline indicator
- **Current Time & Date** - Live clock display

### Main Scanning Area
- **Large Status Display** - Shows scan results
- **Teacher Name** - Displays after successful identification
- **Success/Failure Message** - Clear feedback
- **Timestamp** - When the scan occurred

### Bottom Information Section

#### Left: Today's Schedule
- Shows all classes scheduled for this classroom today
- Teacher names, times, and subjects
- Helps teachers verify they're at the right place

#### Right: Active Now
- Shows teachers currently tapped in at this classroom
- Duration of their session
- Real-time updates

## Technical Specifications

### Hardware Requirements
- **RFID Reader**: Hoba RFID reader (HID-compatible)
- **Display**: Touch screen recommended (but not required)
- **Connection**: Network connection for data sync
- **Browser**: Modern web browser with fullscreen support

### Software Requirements
- **Operating Mode**: Fullscreen browser window
- **Auto-focus**: Automatic input focus for continuous scanning
- **Session Storage**: localStorage for offline capability
- **Real-time Updates**: Live data synchronization

### Security Features
- RFID validation against teacher database
- Schedule-based access control
- Classroom location enforcement
- Session management and tracking
- Audit trail for all tap events

## Troubleshooting

### Terminal Not Reading Cards
1. Check if the input field is focused (click anywhere on screen)
2. Verify Hoba reader is properly connected
3. Test the reader with a known working card
4. Check browser console for errors

### Schedule Validation Not Working
1. Verify the classroom is correctly selected
2. Check that teacher has schedules in the system
3. Confirm current day and time match schedule
4. Remember the ±15 minute grace period

### Terminal Won't Go Fullscreen
1. Press F11 key manually
2. Check browser fullscreen permissions
3. Try using Chrome or Edge browser
4. Click the "Launch Terminal" button again

### Audio Not Working
1. Check sound toggle (speaker icon in header)
2. Verify browser audio permissions
3. Check system volume settings
4. Test with different browser

## Best Practices

### For Administrators
- ✅ Test terminal before deploying to classroom
- ✅ Ensure schedules are up-to-date
- ✅ Position reader at comfortable height
- ✅ Provide clear signage for teachers
- ✅ Monitor terminal status regularly
- ✅ Keep RFID database synchronized

### For Teachers
- ✅ Tap your card at the start of class
- ✅ Remember to tap out at the end
- ✅ Verify the success message
- ✅ Report any issues immediately
- ✅ Keep your RFID card secure
- ✅ Check the schedule display if unsure

### For IT Support
- ✅ Keep browser updated
- ✅ Maintain network connectivity
- ✅ Regular backups of attendance data
- ✅ Monitor system logs
- ✅ Test RFID readers periodically
- ✅ Document any configuration changes

## Accessing the Terminal

### Direct URL Access
You can access the terminal setup page directly:
```
https://your-domain.com/terminal
```

Or with a pre-selected classroom:
```
https://your-domain.com/terminal?classroom=classroom-1
```

### From Admin Dashboard
1. Log in as admin
2. Navigate to "RFID Terminal"
3. Select classroom from dropdown
4. Click "Open Terminal Window"

## Support

For technical support or questions about the RFID terminal system:
- Contact IT Support: itsupport@ndkc.edu.ph
- Admin Dashboard: System Settings > Support
- Emergency: Check the "Offline Mode" in Testing Simulator

---

**Last Updated**: October 2025  
**Version**: 2.0  
**System**: NDKC RFID Classroom Attendance System
