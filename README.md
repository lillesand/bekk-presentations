# Bekk presentations!

Posts presentations from Airtable to Slack on the magic day.

## Cöde

Magic happens entirely in `index.js`.

Run in dev using:

```serverless invoke local --function airtable-to-slack --aws-profile personal```

Requires [SSM](https://eu-central-1.console.aws.amazon.com/systems-manager/parameters/) secrets set up in the personal profile account.

## Infra

```serverless deploy --aws-profile personal```