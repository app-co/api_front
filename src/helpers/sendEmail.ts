import Mail from 'nodemailer/lib/mailer'
import transporter from './email/sendMailer'

async function sendEmail({ to, subject, text, html }: Mail.Options) {
  const mailOptions = {
    from: process.env.MAIL_USER, // Sender email address (must be the same as the one used in the transporter)
    to, // Recipient email address
    subject, // Email subject
    text, // Email content
    html
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.response)
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Erro ao enviar email: ' + error)
  }
}

export default sendEmail
