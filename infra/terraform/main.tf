module "vpc" {
  source      = "./modules/vpc"
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
}

module "rds" {
  source             = "./modules/rds"
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  db_password        = var.db_password
}

module "elasticache" {
  source             = "./modules/elasticache"
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
}

module "alb" {
  source             = "./modules/alb"
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
}

module "ecs" {
  source                  = "./modules/ecs"
  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  private_subnet_ids      = module.vpc.private_subnet_ids
  alb_target_group_api_arn = module.alb.tg_api_arn
  alb_target_group_web_arn = module.alb.tg_web_arn
  db_url                  = module.rds.db_connection_string
  redis_url               = module.elasticache.redis_connection_string
  jwt_secret              = var.jwt_secret
  cloudflare_tunnel_token = var.cloudflare_tunnel_token
  alb_dns_name            = module.alb.alb_dns_name
}
