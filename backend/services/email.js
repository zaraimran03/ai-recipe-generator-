const emailjs = require('@emailjs/nodejs');

// Initialize EmailJS with your Public Key
// We use placeholder values, but you should use env vars in production
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'YOUR_EMAILJS_PUBLIC_KEY';
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || 'YOUR_EMAILJS_PRIVATE_KEY';
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'YOUR_EMAILJS_SERVICE_ID';
const EMAILJS_TEMPLATE_ID_VERIFY = process.env.EMAILJS_TEMPLATE_ID_VERIFY || 'YOUR_EMAILJS_TEMPLATE_ID_VERIFY';
const EMAILJS_TEMPLATE_ID_RESET = process.env.EMAILJS_TEMPLATE_ID_RESET || 'YOUR_EMAILJS_TEMPLATE_ID_RESET';

// Only init if we actually have a real key, otherwise skip to prevent errors in dummy mode
if (EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
    emailjs.init({
        publicKey: EMAILJS_PUBLIC_KEY,
        privateKey: EMAILJS_PRIVATE_KEY,
    });
}

exports.sendOTPEmail = async (email, otp) => {
    console.log(`\n\n--- [DEV] MOCK EMAIL SENT ---`);
    console.log(`To: ${email}`);
    console.log(`OTP: [HIDDEN FOR SECURITY]`);
    console.log(`-----------------------------\n\n`);

    if (EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') {
        // Skip actual EmailJS sending in dummy mode, just rely on console.log
        return;
    }

    try {
        await emailjs.send(
            EMAILJS_SERVICE_ID, 
            EMAILJS_TEMPLATE_ID_VERIFY, 
            {
                to_email: email,
                otp: otp,
                reply_to: "noreply@airecipegenerator.com"
            },
            {
                publicKey: EMAILJS_PUBLIC_KEY,
                privateKey: EMAILJS_PRIVATE_KEY,
            }
        );
        console.log('OTP Email sent successfully via EmailJS');
    } catch (error) {
        console.error('Failed to send OTP email', error);
    }
};

exports.sendPasswordResetOTPEmail = async (email, otp) => {
    console.log(`\n\n--- [DEV] MOCK PASSWORD RESET EMAIL SENT ---`);
    console.log(`To: ${email}`);
    console.log(`Reset OTP: [HIDDEN FOR SECURITY]`);
    console.log(`-----------------------------\n\n`);

    if (EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') {
        return;
    }

    try {
        await emailjs.send(
            EMAILJS_SERVICE_ID, 
            EMAILJS_TEMPLATE_ID_RESET, 
            {
                to_email: email,
                otp: otp,
                reply_to: "noreply@airecipegenerator.com"
            },
            {
                publicKey: EMAILJS_PUBLIC_KEY,
                privateKey: EMAILJS_PRIVATE_KEY,
            }
        );
        console.log('Password reset OTP Email sent successfully');
    } catch (error) {
        console.error('Failed to send password reset OTP email', error);
    }
};
