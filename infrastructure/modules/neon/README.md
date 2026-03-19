# Neon Module (messag)

This module does NOT create any Neon resources.

The NeonDB is shared with the axioquan frontend project.
The connection string is stored as a sensitive variable
in Spacelift and injected at deploy time — never in code.

## Security

- database_url is marked sensitive in Terraform
- It is stored encrypted in Spacelift workspace variables
- It never appears in logs, state output, or git history

## To update the connection string

1. Go to app.spacelift.io
2. Navigate to your messag-dev workspace
3. Go to Environment → Variables
4. Update the database_url variable
5. Trigger a new run