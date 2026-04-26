variable "zone_name" {
  type    = string
  default = "ratewings.com"
}

variable "apex_domain" {
  type    = string
  default = "ratewings.com"
}

variable "www_domain" {
  type    = string
  default = "www.ratewings.com"
}

variable "cloudfront_cert_arn" {
  type = string
}