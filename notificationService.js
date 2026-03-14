import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Setup Nodemailer for Email
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = process.env.SMTP_PORT || 587;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailTo = process.env.EMAIL_RECEIVER;

// Setup generic webhook (like Discord) for quick messages
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

export async function sendNotification(title, content) {
    // Try sending Discord message first (super easy, no config auth needed)
    if (webhookUrl) {
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: null,
                    embeds: [
                        {
                            title: title,
                            description: content.replace(/\\n/g, '\n'),
                            color: 3447003 // Blue color
                        }
                    ]
                })
            });
            console.log('Webhook message sent to Discord successfully.');
        } catch (err) {
            console.error('Failed to send webhook message:', err.message);
        }
    } else {
        console.log('No DISCORD_WEBHOOK_URL provided. Skipping webhook message.');
    }

    // Try sending an email if configured
    if (emailUser && emailPass && emailTo) {
        try {
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort == 465, // true for 465, false for other ports
                auth: {
                    user: emailUser,
                    pass: emailPass,
                },
            });

            // Convert simple markdown-like newlines to HTML
            const htmlContent = `<h2>${title}</h2><p>${content.replace(/\\n/g, '<br/>')}</p>`;

            const info = await transporter.sendMail({
                from: `"DevAgent" <${emailUser}>`,
                to: emailTo,
                subject: title,
                text: `${title}\n\n${content}`,
                html: htmlContent,
            });

            console.log('Email sent successfully:', info.messageId);
        } catch (err) {
            console.error('Failed to send email:', err.message);
        }
    } else {
        console.log('Email credentials not fully provided. Skipping email.');
        if (!webhookUrl) {
            console.log(`\n--- Notification Simulation ---\nTitle: ${title}\nBody:\n${content.replace(/\\n/g, '\n')}\n-------------------------------`);
        }
    }
}
