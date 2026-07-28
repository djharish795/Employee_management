const { ECSClient, DescribeServicesCommand } = require('@aws-sdk/client-ecs');

const client = new ECSClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: 'AKIAVWALRXCCUVCFMJWG',
    secretAccessKey: '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',
  },
});

async function main() {
  try {
    const command = new DescribeServicesCommand({
      cluster: 'crewbase-cluster',
      services: ['crewbase-api-service', 'crewbase-web-service']
    });
    const response = await client.send(command);
    console.log('Services found:', response.services.map(s => s.serviceName));
    console.log('Services missing:', response.failures);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
