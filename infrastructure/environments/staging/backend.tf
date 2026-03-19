
// infrastructure/environments/staging/backend.tf

terraform {
  backend "remote" {
    organization = "axioquan"
    workspaces {
      name = "messag-staging"
    }
  }
}