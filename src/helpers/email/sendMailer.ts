import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER, // Your Gmail email address
    pass: process.env.MAIL_PASS // Your Gmail password or an app-specific password
  }
})

export default transporter
