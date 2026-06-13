const nodemailer = require('nodemailer');

function createTransport() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
}

async function send(to, subject, html) {
  const t = createTransport();
  if (!t) return;
  await t.sendMail({ from: `"JobBoard" <${process.env.EMAIL_USER}>`, to, subject, html });
}

async function sendWelcomeEmail(email, name, role) {
  await send(email, 'Welcome to JobBoard!', `
    <h2>Welcome, ${name}!</h2>
    <p>Your ${role} account has been created successfully.</p>
    <p>Start ${role === 'employer' ? 'posting jobs' : 'exploring opportunities'} today!</p>
    <br/><p>— The JobBoard Team</p>
  `);
}

async function sendApplicationEmail(candidateEmail, candidateName, jobTitle, company) {
  await send(candidateEmail, `Application Submitted — ${jobTitle}`, `
    <h2>Application Received!</h2>
    <p>Hi ${candidateName},</p>
    <p>Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been successfully submitted.</p>
    <p>We'll notify you when the employer reviews your application.</p>
    <br/><p>— The JobBoard Team</p>
  `);
}

async function sendStatusUpdateEmail(candidateEmail, candidateName, jobTitle, status) {
  const messages = {
    reviewed:    'Your application is being reviewed by the employer.',
    shortlisted: '🎉 Congratulations! You have been shortlisted for this position.',
    rejected:    'Unfortunately, you were not selected for this position. Keep applying!',
    hired:       '🎊 Congratulations! You have been hired for this position!'
  };
  await send(candidateEmail, `Application Update — ${jobTitle}`, `
    <h2>Application Status Update</h2>
    <p>Hi ${candidateName},</p>
    <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
    <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
    <p>${messages[status] || ''}</p>
    <br/><p>— The JobBoard Team</p>
  `);
}

module.exports = { sendWelcomeEmail, sendApplicationEmail, sendStatusUpdateEmail };
