# 🚨 Naprocs EMS - Incident Response Runbook

## Scenario 1: Honey Token Triggered
**Alert:** P0 - A request contained the ghost identity (`sysadmin_super_secret@naprocs.in` or its ID).
**Action:**
1. Check the AWS CloudWatch logs for the ECS API Task to identify the originating IP.
2. If Cloudflare Zero Trust is active, check the Cloudflare Access logs to identify which employee account was compromised to bypass the proxy.
3. Immediately suspend the compromised employee account in Google Workspace / Azure AD.
4. Rotate the JWT secrets in AWS Secrets Manager and restart the ECS API tasks to flush all active sessions.

## Scenario 2: Cryptographic Audit Chain Broken
**Alert:** P1 - An audit log hash mismatch detected.
**Action:**
1. A database row was manually altered or deleted.
2. Restrict all VPN and Cloudflare access immediately.
3. Take a manual snapshot of the RDS instance for forensic analysis.
4. Execute `infra/scripts/restore-drill.sh` to restore the RDS instance from the automated hourly backup taken before the anomaly.

## Scenario 3: Connection Pool Exhausted
**Alert:** P2 - Prisma `Timeout fetching a connection from the pool`.
**Action:**
1. Check CloudWatch metrics for ECS API CPU/Memory.
2. If traffic is legitimate, increase the `connection_limit` in the `DATABASE_URL` stored in AWS Secrets Manager.
3. Adjust the ECS Auto Scaling rules to spin up tasks faster.
