const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: 'AKIAVWALRXCCUVCFMJWG',
    secretAccessKey: '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'
  }
});

async function testSES() {
  try {
    const command = new SendEmailCommand({
      Source: 'noreply@naprocs.in',
      Destination: {
        ToAddresses: ['tejesh@naprocs.in'],
      },
      Message: {
        Subject: { Data: 'AWS SES Connection Test' },
        Body: { Text: { Data: 'If you receive this, your AWS SES keys and sandbox rules are perfectly fine!' } }
      }
    });

    const response = await sesClient.send(command);
    console.log('SUCCESS! Email sent. AWS Response:', response);
  } catch (error) {
    console.error('SES ERROR:', error.name);
    console.error('MESSAGE:', error.message);
  }
}

testSES();
