# Render Module (messag)

Creates and manages the Render web service for the messag API.

## What it creates

- A Render Web Service connected to the axioquan-message GitHub repo
- Auto-deploys on push to main branch
- Injects all environment variables from Spacelift workspace variables

## Sensitive variables (set in Spacelift — never in code)

| Variable | Description |
|---|---|
| database_url | NeonDB connection string |
| jwt_secret | JWT signing secret |
| render_api_key | Render API key |

## Outputs

| Output | Description |
|---|---|
| service_id | Render service ID for GitHub Actions |
| service_name | Service name |
| app_url | Live API URL |