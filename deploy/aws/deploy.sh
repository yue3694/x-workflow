#!/bin/bash
set -e

# AWS Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REPOSITORY="x-workflow"
ECS_CLUSTER="${ECS_CLUSTER:-x-workflow-cluster}"
ECS_SERVICE_WEB="${ECS_SERVICE_WEB:-x-workflow-web}"
ECS_SERVICE_SERVER="${ECS_SERVICE_SERVER:-x-workflow-server}"
TASK_DEFINITION="deploy/aws/ecs-task-definition.json"

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "=== AWS Account: $AWS_ACCOUNT_ID ==="
echo "=== Region: $AWS_REGION ==="

# Build and push Docker images to ECR
echo "=== Building Docker images ==="

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Create ECR repositories if they don't exist
aws ecr create-repository --repository-name x-workflow-web --region $AWS_REGION || true
aws ecr create-repository --repository-name x-workflow-server --region $AWS_REGION || true

# Build web image
echo "=== Building web image ==="
docker build -f deploy/aws/apps/web/Dockerfile -t $ECR_REPOSITORY-web:latest .
docker tag $ECR_REPOSITORY-web:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY-web:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY-web:latest

# Build server image
echo "=== Building server image ==="
docker build -f deploy/aws/apps/server/Dockerfile -t $ECR_REPOSITORY-server:latest .
docker tag $ECR_REPOSITORY-server:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY-server:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY-server:latest

# Update ECS task definition
echo "=== Updating ECS task definition ==="
TASK_DEF=$(cat $TASK_DEFINITION)
TASK_DEF=$(echo "$TASK_DEF" | sed "s/\${AWS_ACCOUNT_ID}/$AWS_ACCOUNT_ID/g")
TASK_DEF=$(echo "$TASK_DEF" | sed "s/\${AWS_REGION}/$AWS_REGION/g")
TASK_DEF=$(echo "$TASK_DEF" | sed "s/\${DATABASE_URL_SECRET_ARN}/$DATABASE_URL_SECRET_ARN/g")
TASK_DEF=$(echo "$TASK_DEF" | sed "s/\${BETTER_AUTH_SECRET_SECRET_ARN}/$BETTER_AUTH_SECRET_SECRET_ARN/g")
TASK_DEF=$(echo "$TASK_DEF" | sed "s/\${BETTER_AUTH_URL_SECRET_ARN}/$BETTER_AUTH_URL_SECRET_ARN/g")
TASK_DEF=$(echo "$TASK_DEF" | sed "s/\${CORS_ORIGIN_SECRET_ARN}/$CORS_ORIGIN_SECRET_ARN/g")

echo "$TASK_DEF" > /tmp/task-definition.json

# Register new task definition
TASK_ARN=$(aws ecs register-task-definition --cli-input-json "file:///tmp/task-definition.json" --region $AWS_REGION --query taskDefinition.taskDefinitionArn --output text)
echo "=== New task definition: $TASK_ARN ==="

# Update ECS services
echo "=== Updating ECS services ==="
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE_WEB --task-definition $TASK_ARN --region $AWS_REGION --force-new-deployment
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE_SERVER --task-definition $TASK_ARN --region $AWS_REGION --force-new-deployment

echo "=== Deployment initiated ==="
echo "Monitor with: aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE_WEB $ECS_SERVICE_SERVER --region $AWS_REGION"