const { ECSClient, ListClustersCommand } = require('@aws-sdk/client-ecs');

const client = new ECSClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: 'AKIAVWALRXCCUVCFMJWG',
    secretAccessKey: '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',
  },
});

async function main() {
  const command = new ListClustersCommand({});
  const response = await client.send(command);
  console.log('Clusters:', response.clusterArns);
}

main().catch(console.error);
