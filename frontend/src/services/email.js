import emailjs from '@emailjs/browser';

const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';

const TEMPLATES = {
  WELCOME_EMAIL: 'YOUR_EMAILJS_TEMPLATE_ID_WELCOME',
  PASSWORD_RESET: 'YOUR_EMAILJS_TEMPLATE_ID_RESET',
  IMPORTANT_NOTIFICATION: 'YOUR_EMAILJS_TEMPLATE_ID_NOTIFICATION',
};

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    if (EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') return; // Skip if not configured
    
    await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATES.WELCOME_EMAIL, {
      to_email: userEmail,
      to_name: userName,
      message: 'Welcome to SaaDish AI! We are excited to have you on board. Start exploring and generating delicious recipes right away.'
    });
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Failed to send welcome email', error);
  }
};

export const sendPasswordResetEmail = async (userEmail, resetLink) => {
  try {
    if (EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') return; // Skip if not configured

    await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATES.PASSWORD_RESET, {
      to_email: userEmail,
      reset_link: resetLink,
      message: 'You have requested a password reset. Click the link below to securely create a new password.'
    });
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Failed to send password reset email', error);
  }
};

export const sendImportantNotification = async (userEmail, subject, content) => {
  try {
    if (EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') return; // Skip if not configured

    await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATES.IMPORTANT_NOTIFICATION, {
      to_email: userEmail,
      subject: subject,
      message: content
    });
    console.log('Important notification email sent successfully');
  } catch (error) {
    console.error('Failed to send important notification email', error);
  }
};
