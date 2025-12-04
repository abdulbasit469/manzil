# 📧 Email Setup Instructions - Gmail

## Step 1: Gmail App Password Generate Karo

1. **Google Account mein jao:**
   - https://myaccount.google.com/ pe jao
   - Left side se **Security** select karo

2. **2-Step Verification Enable Karo:**
   - **2-Step Verification** pe click karo
   - Agar already enabled hai to next step pe jao
   - Agar nahi hai to enable karo (phone number se verify hoga)

3. **App Password Generate Karo:**
   - Security page pe hi, scroll down karo
   - **App passwords** section dhundo
   - "Select app" dropdown se **Mail** select karo
   - "Select device" se **Other (Custom name)** select karo
   - Name likh do: "Manzil App"
   - **Generate** button click karo
   - **16-character password** copy karo (spaces ignore karo)
     - Example: `abcd efgh ijkl mnop` → Copy as `abcdefghijklmnop`

## Step 2: .env File Update Karo

### Backend folder mein `.env` file kholo:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password-here
```

### Example:
```env
EMAIL_USER=abdulbasitattique89@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

**Important:**
- `EMAIL_USER` mein apna Gmail address likho
- `EMAIL_PASS` mein jo 16-character App Password mila wo paste karo (spaces ke bina)
- Regular Gmail password mat use karo - sirf App Password

## Step 3: Backend Server Restart Karo

1. Backend server ko **Ctrl+C** se stop karo
2. Phir se start karo:
   ```bash
   cd backend
   npm run dev
   ```

## Step 4: Test Karo

1. Forgot Password page pe jao
2. Email enter karo
3. Submit karo
4. Ab email inbox check karo - reset link mil jayega!

---

## Troubleshooting

### Agar email nahi ja raha:

1. **Check karo `.env` file:**
   - `EMAIL_USER` aur `EMAIL_PASS` properly set hain?
   - Spaces ya extra characters to nahi?

2. **Server restart kiya?**
   - `.env` file change ke baad server restart zaroori hai

3. **App Password sahi hai?**
   - Regular password mat use karo
   - Sirf App Password use karo

4. **2-Step Verification enabled hai?**
   - App Password ke liye 2-Step Verification zaroori hai

5. **Server console check karo:**
   - Agar email fail ho raha hai to error message dikhega




