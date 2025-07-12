# ECS EC2 Deployment Pipeline

Automated CI/CD pipeline for building Docker images, pushing to Amazon ECR, and deploying to Amazon ECS on EC2 instances using GitHub Actions.

## Overview

This repository contains a GitHub Actions workflow that:
- Builds Docker images from your application code
- Pushes images to Amazon Elastic Container Registry (ECR)
- Updates ECS task definitions with new image versions
- Deploys updated applications to ECS clusters running on EC2 instances

## Prerequisites

### AWS Resources Required
- **ECR Repository**: Container registry to store Docker images
- **ECS Cluster**: EC2-based cluster to run containers
- **ECS Service**: Service definition managing container deployment
- **Task Definition**: JSON file defining container specifications
- **IAM User/Role**: With appropriate permissions for ECR and ECS operations

### Repository Files Required
- `Dockerfile`: Container build instructions
- `task-definition.json`: ECS task definition file
- `.github/workflows/ecs-ec2.yml`: GitHub Actions workflow (included)

## Setup Instructions

### 1. AWS Configuration

#### Create ECR Repository
```bash
aws ecr create-repository --repository-name your-app-name --region your-region
```

#### Create ECS Cluster
```bash
aws ecs create-cluster --cluster-name your-cluster-name
```

#### Create Task Definition
Create `task-definition.json` in your repository root:
```json
{
  "family": "your-task-family",
  "networkMode": "bridge",
  "requiresCompatibilities": ["EC2"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "your-container-name",
      "image": "your-ecr-uri:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "hostPort": 0,
          "protocol": "tcp"
        }
      ],
      "essential": true
    }
  ]
}
```

### 2. GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Description | Example |
|-------------|-------------|----------|
| `AWS_ACCESS_KEY_ID` | AWS access key for deployment | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | `wJalr...` |
| `AWS_REGION` | AWS region for resources | `us-east-1` |
| `ECR_REPOSITORY_URI` | Full ECR repository URI | `123456789.dkr.ecr.us-east-1.amazonaws.com/your-app` |
| `CONTAINER_NAME` | Container name from task definition | `your-container-name` |
| `ECS_SERVICE` | ECS service name | `your-service-name` |
| `ECS_CLUSTER` | ECS cluster name | `your-cluster-name` |

### 3. IAM Permissions

Ensure your AWS user/role has these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:DescribeTasks"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::*:role/ecsTaskExecutionRole"
    }
  ]
}
```

## Workflow Details

### Trigger Conditions
The workflow runs on:
- Push to `main` branch
- Excludes changes to `docs/**` and `readme.md`

### Workflow Steps

1. **Checkout Code**: Downloads repository content
2. **AWS Credentials**: Configures AWS CLI with secrets
3. **ECR Login**: Authenticates with Amazon ECR
4. **Build Image**: Creates Docker image from Dockerfile
5. **Tag Image**: Tags image with ECR repository URI
6. **Push Image**: Uploads image to ECR
7. **Update Task Definition**: Renders new task definition with latest image
8. **Debug Output**: Shows rendered task definition for troubleshooting
9. **Deploy**: Updates ECS service with new task definition

### Deployment Process
- New task definition revision is created
- ECS service is updated to use new revision
- Old tasks are gracefully replaced with new ones
- Workflow waits for service stability before completing

## Usage

### Automatic Deployment
1. Make changes to your application code
2. Commit and push to `main` branch
3. GitHub Actions automatically triggers deployment
4. Monitor progress in Actions tab

### Manual Deployment
1. Go to Actions tab in GitHub
2. Select "Build and Push to AWS ECR, then deploy to ECS EC2"
3. Click "Run workflow" on `main` branch

## Monitoring and Troubleshooting

### Check Deployment Status
```bash
# Check service status
aws ecs describe-services --cluster your-cluster-name --services your-service-name

# Check running tasks
aws ecs list-tasks --cluster your-cluster-name --service-name your-service-name

# View task logs
aws logs get-log-events --log-group-name /ecs/your-task-family --log-stream-name ecs/your-container-name/task-id
```

### Common Issues
- **Build failures**: Check Dockerfile syntax and dependencies
- **Push failures**: Verify ECR repository exists and permissions are correct
- **Deployment failures**: Check task definition format and ECS service configuration
- **Service instability**: Review container health checks and resource allocation

### Debug Steps
1. Check GitHub Actions logs for specific error messages
2. Verify all secrets are correctly configured
3. Ensure AWS resources exist in the specified region
4. Validate task definition JSON format
5. Check ECS service events in AWS console

## Security Best Practices

- Use least-privilege IAM policies
- Regularly rotate AWS access keys
- Store sensitive data in GitHub Secrets, not in code
- Enable ECR image scanning for vulnerabilities
- Use specific image tags instead of `latest` for production

## Cost Optimization

- Use appropriate EC2 instance types for your workload
- Implement auto-scaling for ECS services
- Clean up unused ECR images regularly
- Monitor CloudWatch metrics for resource utilization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the deployment pipeline
5. Submit a pull request