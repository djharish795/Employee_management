require("dotenv").config({ path: "apps/api/.env" });
const { ECSClient, ListTasksCommand, DescribeTasksCommand } = require("@aws-sdk/client-ecs");

async function run() {
  try {
    const ecs = new ECSClient({ 
      region: "ap-south-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    // Get Web Task IP
    const webTasks = await ecs.send(new ListTasksCommand({
      cluster: "crewbase-cluster",
      serviceName: "crewbase-web-service"
    }));
    
    if (webTasks.taskArns.length > 0) {
      const descWeb = await ecs.send(new DescribeTasksCommand({
        cluster: "crewbase-cluster",
        tasks: webTasks.taskArns
      }));
      const ip = descWeb.tasks[0].attachments[0].details.find(d => d.name === "privateIPv4Address").value;
      console.log(`WEB IP: ${ip}`);
    }

    // Get API Task IP
    const apiTasks = await ecs.send(new ListTasksCommand({
      cluster: "crewbase-cluster",
      serviceName: "crewbase-api-service"
    }));
    
    if (apiTasks.taskArns.length > 0) {
      const descApi = await ecs.send(new DescribeTasksCommand({
        cluster: "crewbase-cluster",
        tasks: apiTasks.taskArns
      }));
      const ip = descApi.tasks[0].attachments[0].details.find(d => d.name === "privateIPv4Address").value;
      console.log(`API IP: ${ip}`);
    }

  } catch (err) {
    console.error(err);
  }
}

run();
