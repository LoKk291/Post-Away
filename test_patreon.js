const https = require('https');
https.get('https://www.patreon.com/c/lokk291', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status with /c/:', res.statusCode);
        const match1 = data.match(/campaign_id[=\":\s]+(\d+)/);
        const match2 = data.match(/\"campaign_id\"\s*:\s*\"?(\d+)\"?/);
        console.log('Campaign ID match:', match1 ? match1[1] : (match2 ? match2[1] : 'not found'));
    });
});
