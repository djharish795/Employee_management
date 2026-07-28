const { ECSClient, CreateClusterCommand } = require('@aws-sdk/client-ecs');

const client = new ECSClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: 'AKIAVWALRXCCUVCFMJWG',
    secretAccessKey: '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',
  },
});

async function main() {
  try {
    const command = new CreateClusterCommand({
      clusterName: 'crewbase-cluster',
    });
    const response = await client.send(command);
    console.log('Successfully created cluster:', response.cluster.clusterArn);
  } catch (err) {
    console.error('Error creating cluster:', err.message);
  }
}

main();
