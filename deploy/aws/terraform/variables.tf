variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "example.com"
}

variable "database_url" {
  description = "Database connection URL (e.g., Turso or PostgreSQL)"
  type        = string
  sensitive   = true
}

variable "better_auth_secret" {
  description = "Better Auth secret key (min 32 characters)"
  type        = string
  sensitive   = true
}