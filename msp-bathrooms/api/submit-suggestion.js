const nodemailer = require('nodemailer');

// Export the serverless function
// This structure is compatible with Vercel and similar platforms
// Request body should contain: { name, address, notes }
module.exports = async (req, res) => {
    // Enable CORS for frontend access
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { name, address, notes } = req.body;

    // Basic validation
    if (!name || !address) {
        return res.status(400).json({ error: 'Missing required fields: name and address are required.' });
    }

    // Configure SMTP Transporter
    // Users must set these environment variables in their hosting provider
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        // Send email
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER, // Sender address
            to: process.env.SMTP_TO || process.env.SMTP_USER,   // Receiver address
            subject: `New Bathroom Suggestion: ${name}`,
            text: `
New Bathroom Suggestion Received:

Name: ${name}
Address: ${address}
Notes: ${notes || 'N/A'}

This email was sent automatically from the MSP Bathroom Tracker.
            `,
            html: `
<h2>New Bathroom Suggestion Received</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Address:</strong> ${address}</p>
<p><strong>Notes:</strong> ${notes || 'N/A'}</p>
<br>
<hr>
<p><em>This email was sent automatically from the MSP Bathroom Tracker.</em></p>
            `,
        });

        console.log('Suggestion email sent successfully');
        return res.status(200).json({ message: 'Suggestion submitted successfully!' });

    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Failed to send suggestion. Please try again later.' });
    }
};
