output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.apex_redirect.domain_name
}

output "route53_zone_id" {
  value = data.aws_route53_zone.primary.zone_id
}