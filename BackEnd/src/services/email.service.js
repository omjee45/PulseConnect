const { Resend } = require('resend');
const jwt = require('jsonwebtoken');

const resend = new Resend(process.env.RESEND_API_KEY);

// Send one-click admin approval email
// Wrapped in try/catch to prevent crashing the caller
const sendAdminApprovalEmail = async (donor) => {
  try {
    // Validate required env vars
    if (!process.env.RESEND_API_KEY || !process.env.ADMIN_ACTION_SECRET || !process.env.ADMIN_NOTIFICATION_EMAIL) {
      console.warn('⚠️ Missing email env variables (RESEND_API_KEY, ADMIN_ACTION_SECRET, ADMIN_NOTIFICATION_EMAIL). Email skipped.');
      return;
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8800';
    const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    // Generate tokens valid for 48 hours
    const approveToken = jwt.sign(
      { donorId: donor._id, action: 'approve' },
      process.env.ADMIN_ACTION_SECRET,
      { expiresIn: '48h' }
    );

    const rejectToken = jwt.sign(
      { donorId: donor._id, action: 'reject' },
      process.env.ADMIN_ACTION_SECRET,
      { expiresIn: '48h' }
    );

    const approveLink = `${backendUrl}/api/admin/donor-action?token=${approveToken}`;
    const rejectLink = `${backendUrl}/api/admin/donor-action?token=${rejectToken}`;

    const htmlContent = `
      <h2>New Donor Verification Request</h2>
      <p>A user has opted in as a donor and requires verification before appearing in public searches.</p>
      
      <h3>Donor Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${donor.fullName}</li>
        <li><strong>Email:</strong> ${donor.email}</li>
        <li><strong>Blood Group:</strong> ${donor.bloodGroup || 'Not provided'}</li>
        <li><strong>City:</strong> ${donor.city || 'Not provided'}</li>
        <li><strong>Opted in for:</strong> ${[donor.isAvailableForBloodDonation && 'Blood', donor.isOrganDonor && 'Organs'].filter(Boolean).join(', ')}</li>
      </ul>

      <p>Click below to take action (no login required, link valid for 48h):</p>
      <div style="margin-top: 20px;">
        <a href="${approveLink}" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 15px; font-weight: bold;">✅ Approve Donor</a>
        <a href="${rejectLink}" style="background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">❌ Reject Request</a>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: `PulseConnect Admin <${emailFrom}>`,
      to: process.env.ADMIN_NOTIFICATION_EMAIL,
      subject: `Action Required: Verify new donor ${donor.fullName}`,
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      return;
    }

    console.log(`📩 Admin approval email sent successfully for ${donor._id}. ID: ${data?.id}`);
  } catch (error) {
    console.error('❌ Failed to send admin approval email:', error);
    // Silent fail — we don't throw, allowing the original request to finish successfully
  }
};

module.exports = {
  sendAdminApprovalEmail,
};
