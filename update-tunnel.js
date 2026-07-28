require("dotenv").config({ path: "apps/api/.env" });
const { ECSClient, DescribeTaskDefinitionCommand, RegisterTaskDefinitionCommand, UpdateServiceCommand } = require("@aws-sdk/client-ecs");
const fs = require("fs");

async function run() {
  try {
    const token = fs.readFileSync("tunnel-token.txt", "utf-8").trim();
    if (!token) throw new Error("Token file is empty");

    const ecs = new ECSClient({ 
      region: "ap-south-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    console.log("Fetching crewbase-tunnel-task definition...");
    const desc = await ecs.send(new DescribeTaskDefinitionCommand({ taskDefinition: "crewbase-tunnel-task" }));
    
    let taskDef = desc.taskDefinition;
    
    delete taskDef.taskDefinitionArn;
    delete taskDef.revision;
    delete taskDef.status;
    delete taskDef.requiresAttributes;
    delete taskDef.compatibilities;
    delete taskDef.registeredAt;
    delete taskDef.registeredBy;

    console.log("Modifying container definition for cloudflared...");
    const container = taskDef.containerDefinitions.find(c => c.name === "cloudflared");
    if (!container) throw new Error("cloudflared container not found in task definition");

    container.command = ["tunnel", "--no-autoupdate", "run"];
    
    container.environment = (container.environment || []).filter(e => e.name !== "TUNNEL_TOKEN");
    container.environment.push({ name: "TUNNEL_TOKEN", value: token });

    console.log("Registering new task definition revision...");
    const regRes = await ecs.send(new RegisterTaskDefinitionCommand(taskDef));
    const newRevision = regRes.taskDefinition.revision;
    const newArn = regRes.taskDefinition.taskDefinitionArn;
    console.log(`Registered successfully as revision: ${newRevision}`);

    console.log("Updating crewbase-tunnel-service to force new deployment...");
    await ecs.send(new UpdateServiceCommand({
      cluster: "crewbase-cluster",
      service: "crewbase-tunnel-service",
      taskDefinition: newArn,
      forceNewDeployment: true
    }));

    console.log("SUCCESS! Service updated. Watch the AWS ECS Logs.");

  } catch (err) {
    console.error("Error updating tunnel:", err);
  }
}

run();
