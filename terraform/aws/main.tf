terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# 1. SNS Topic for Infrastructure Incidents
resource "aws_sns_topic" "cloudops_alerts" {
  name = "cloudops-infrastructure-alerts-${var.environment}"
}

# 2. CloudWatch Metric Alarm for CPU Utilization Breach (> 90%)
resource "aws_cloudwatch_metric_alarm" "high_cpu_alarm" {
  alarm_name          = "ec2-high-cpu-utilization-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 90
  alarm_description   = "Triggers when EC2 instance CPU utilization exceeds 90% for 2 consecutive periods"
  alarm_actions       = [aws_sns_topic.cloudops_alerts.arn]
}

# 3. CloudWatch Metric Alarm for Memory Utilization
resource "aws_cloudwatch_metric_alarm" "high_memory_alarm" {
  alarm_name          = "ec2-high-memory-utilization-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "mem_used_percent"
  namespace           = "CWAgent"
  period              = 60
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "Triggers when memory utilization crosses 85%"
  alarm_actions       = [aws_sns_topic.cloudops_alerts.arn]
}

# 4. IAM Role for Systems Manager (SSM) & CloudWatch Agent
resource "aws_iam_role" "cloudops_ec2_role" {
  name = "cloudops-ec2-ssm-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.cloudops_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "cw_policy" {
  role       = aws_iam_role.cloudops_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

output "sns_topic_arn" {
  value = aws_sns_topic.cloudops_alerts.arn
}
