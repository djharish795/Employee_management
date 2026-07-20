# 🚨 Phase Rollback Procedure

If a Next.js or NestJS deployment introduces critical bugs (e.g., Phase 2 features breaking Phase 1 stability):

## 1. Quick Rollback (Feature Flag)
If the code is stable but the feature is broken, flip the feature flag in AWS Secrets Manager:
`PHASE_2_ENABLED=false`
Restart the ECS tasks to instantly hide the Phase 2 features from the UI.

## 2. Hard Rollback (Docker Image)
If the application is crashing (e.g., 502 Bad Gateway):
1. Go to AWS ECS -> Task Definitions.
2. Select the previous stable revision of the Task Definition.
3. Update the ECS Service to use this old revision.
4. ECS will automatically spin up the old Docker images and gracefully drain the broken ones.
