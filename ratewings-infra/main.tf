data "aws_route53_zone" "primary" {
  name         = var.zone_name
  private_zone = false
}

resource "aws_cloudfront_function" "apex_redirect" {
  name    = "ratewings-apex-redirect"
  runtime = "cloudfront-js-2.0"
  comment = "Redirect apex to www"
  publish = true
  code    = file("${path.module}/function-redirect.js")
}

resource "aws_cloudfront_distribution" "apex_redirect" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "RateWings apex redirect"

  aliases = [var.apex_domain]

  origin {
    domain_name = "example.com"
    origin_id   = "dummy-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "dummy-origin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]
    compress        = false

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.apex_redirect.arn
    }

    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.cloudfront_cert_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2019"
  }
}

resource "aws_route53_record" "apex_alias" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = var.apex_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.apex_redirect.domain_name
    zone_id                = aws_cloudfront_distribution.apex_redirect.hosted_zone_id
    evaluate_target_health = false
  }
}