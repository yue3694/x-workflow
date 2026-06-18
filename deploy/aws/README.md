# AWS Deployment Guide for x-workflow

## Architecture

This deployment uses **AWS ECS Fargate** with:
- Next.js frontend on port 3001
- Hono/tRPC server on port 3000
- Application Load Balancer for routing
- CloudWatch for logging
- Secrets Manager for sensitive configuration

## Prerequisites

1. **AWS CLI** configured with credentials:
   ```bash
   aws configure
   ```

2. **Terraform** installed:
   ```bash
   brew install terraform
   ```

3. **Docker** installed:
   ```bash
   brew install docker
   ```

4. **Domain name** managed in Route 53 (optional)

## Deployment Steps

### 1. Configure Environment Variables

Copy the example terraform variables file:
```bash
cp deploy/aws/terraform/terraform.tfvars.example deploy/aws/terraform/terraform.tfvars
```

Edit `terraform.tfvars` with your values:
```hcl
aws_region         = "us-east-1"
domain_name        = "your-domain.com"
database_url       = "libsql://your-database.turso.io?authToken=xxx"
better_auth_secret = "your-secret-key-min-32-characters"
```

### 2. Create AWS Infrastructure

```bash
cd deploy/aws/terraform

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply infrastructure
terraform apply
```

This creates:
- VPC with public subnets
- ECS Cluster
- Application Load Balancer
- ECR repositories
- Security groups
- IAM roles
- Secrets Manager secret

### 3. Build and Deploy Images

Make the deploy script executable and run it:
```bash
chmod +x deploy/aws/deploy.sh

# Set required environment variables
export AWS_REGION="us-east-1"
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ECS_CLUSTER="x-workflow-cluster"
export ECS_SERVICE_WEB="x-workflow-web"
export ECS_SERVICE_SERVER="x-workflow-server"
export DATABASE_URL_SECRET_ARN="arn:aws:secretsmanager:us-east-1:xxx:secret:x-workflow/app-config:xxx"
export BETTER_AUTH_SECRET_SECRET_ARN="arn:aws:secretsmanager:us-east-1:xxx:secret:x-workflow/app-config:xxx"
export BETTER_AUTH_URL_SECRET_ARN="arn:aws:secretsmanager:us-east-1:xxx:secret:x-workflow/app-config:xxx"
export CORS_ORIGIN_SECRET_ARN="arn:aws:secretsmanager:us-east-1:xxx:secret:x-workflow/app-config:xxx"

# Deploy
./deploy/aws/deploy.sh
```

### 4. Verify Deployment

Check ECS service status:
```bash
aws ecs describe-services \
  --cluster x-workflow-cluster \
  --services x-workflow-web x-workflow-server \
  --region us-east-1
```

View logs:
```bash
aws logs tail /ecs/x-workflow --follow
```

## Updating the Application

After making code changes:

1. Rebuild and push images:
```bash
cd deploy/aws
./deploy.sh
```

2. ECS will automatically pull the new images due to `force-new-deployment`.

## Environment Variables

The following are stored in AWS Secrets Manager:
- `DATABASE_URL` - Turso/PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Authentication secret
- `BETTER_AUTH_URL` - Production URL
- `CORS_ORIGIN` - Allowed origin

## Cost Estimate

- ECS Fargate (2 tasks × 0.5 vCPU, 1GB): ~$30/month
- ALB: ~$20/month
- CloudWatch Logs: ~$5/month
- Secrets Manager: ~$1/month
- **Total**: ~$56/month

## Cleanup

To destroy all resources:
```bash
cd deploy/aws/terraform
terraform destroy
```