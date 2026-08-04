const { SESv2Client, SendEmailCommand } = require('@aws-sdk/client-sesv2');
const nodemailer = require('nodemailer');

async function init() {
  try {
    const sesConfig = {
      region: 'ap-south-1',
      credentials: {
        accessKeyId: 'AKIAVWALRXCCUVCFMJWG',
        secretAccessKey: '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'
      }
    };
    const sesClient = new SESv2Client(sesConfig);
    const transporter = nodemailer.createTransport({
      SES: { sesClient, SendEmailCommand }
    });
    console.log("Transporter created successfully. It works!");
  } catch (err) {
    console.error("FAILED to initialize transporter:", err);
  }
}

init();
