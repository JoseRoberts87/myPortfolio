output "hosted_zone_id" {
  description = "ID of the Route53 hosted zone"
  value       = aws_route53_zone.main.zone_id
}

output "hosted_zone_name" {
  description = "Name of the Route53 hosted zone"
  value       = aws_route53_zone.main.name
}

output "nameservers" {
  description = "Nameservers for the hosted zone"
  value       = aws_route53_zone.main.name_servers
}

output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = aws_acm_certificate.main.arn
}

output "certificate_domain_name" {
  description = "Domain name of the ACM certificate"
  value       = aws_acm_certificate.main.domain_name
}
