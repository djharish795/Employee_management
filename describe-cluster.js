const { ECSClient, DescribeClustersCommand } = require('@aws-sdk/client-ecs');

const client = new ECSClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: 'AKIAVWALRXCCUVCFMJWG',
    secretAccessKey: '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',
  },
});

async function main() {
  try {
    const command = new DescribeClustersCommand({
      clusters: ['crewbase-cluster']
    });
    const response = await client.send(command);
    console.log('Describe response:', JSON.stringify(response.clusters, null, 2));
    if (response.failures && response.failures.length > 0) {
      console.log('Failures:', response.failures);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
