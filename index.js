"use strict";

const Airtable = require('airtable');
const Slack = require('slack-node');
const moment = require('moment');

exports.handler = (event, context, callback) => {

    const AIRTABLE_ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN;
    const SLACK_WEBHOOK_URI = process.env.SLACK_WEBHOOK_URI;

    if (AIRTABLE_ACCESS_TOKEN == null) {
        console.log("AIRTABLE_ACCESS_TOKEN must be set");
        return;
    }
    if (SLACK_WEBHOOK_URI == null) {
        console.log("SLACK_WEBHOOK_URI must be set");
        return;
    }

    const airtable = new Airtable({apiKey: AIRTABLE_ACCESS_TOKEN}).base('appVsxAAJW4qRusNS');
    const slack = new Slack();
    slack.setWebhook(SLACK_WEBHOOK_URI);
 
    const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
    const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
    const PAGE_SIZE = 100;

    airtable('Bidrag').select({
        maxRecords: PAGE_SIZE,
        view: "Alle registrerte bidrag",
        sort: [{field: 'Dato', direction: 'asc'}],
        filterByFormula: `AND(IS_AFTER({Dato}, '${yesterday}'), IS_BEFORE({Dato}, '${tomorrow}'))`,
    }).eachPage(function page(records, fetchNextPage) {
        let bidragInPage = records.map((record) => {
            return {
                names: record.get('Involverte BEKKere'),
                title: record.get('Tittel'),
                venue: record.get('Hvor'),
                venueUrl: record.get('URL til Hvor'),
                url: record.get('URL til Tittel'),
                type: record.get('Hva'),
                date: moment(record.get('Dato')),
                description: record.get('Beskrivelse'),
            }
        });
        
        console.log(bidragInPage.length)

        bidragInPage.forEach((bidrag) => {
            slack.webhook({
                channel: "#fagnytt",
                username: "Fagnytt 🚀",
                icon_emoji: ":star-struck:",
                text: `Splitte mine bramseil! I dag skal *${bidrag.names}* holde _${bidrag.title}_ på ${bidrag.venue}!\n\n> ${bidrag.description}`
            }, function(err, response) {
                if (err) {
                    console.log("Unable to post to Slack", err)
                }
            });
        });

        fetchNextPage();
    }, function done(err) {
        if (err) { console.error(err); }
    });
}