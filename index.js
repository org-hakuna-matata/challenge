const got = require('got');
const crypto = require('crypto');

const github_base = 'https://api.github.com';

//protection set for master branch
const protections = {
    "required_status_checks": null,
    "enforce_admins": true,
    "required_pull_request_reviews": null,
    "restrictions": {
        "users": [
            "jcappello"
        ],
        "teams": [
            "justice-league"
        ]
    },
    "required_linear_history": true,
    "allow_force_pushes": true,
    "allow_deletions": true
};

exports.handler = async (event) => {

    console.log("Event: " + JSON.stringify(event, null, 2));
    console.log("Body: " + event.body);

    try {
        let secret = event.headers['x-hub-signature'];
        console.log ('Header: ' + secret);
        if (secret && verify_signature(secret, event.body)) {
            let body = JSON.parse(event.body);

            if (body.hasOwnProperty('action') && body.hasOwnProperty('repository')) {
                //check if a repo was created
                if (body['action'] == 'created') {
                    let repo = body.repository['full_name'];
                    console.log(repo);
                    //protect master branch
                    const protectResponse = await protectMaster(repo);
                    if (protectResponse.statusCode !== 200) {
                        return {statusCode: protectResponse.statusCode, body: protectResponse.body};
                    }
                    //notify of protection in issue
                    const issueResponse = await notifyIssue(repo, protectResponse);
                    if (issueResponse.statusCode !== 201) {
                        return {statusCode: issueResponse.statusCode, body: issueResponse.body};
                    }
                }
                console.log('Operation completed successfully.');
                return {statusCode: 200, body: JSON.stringify('Success')};
            } else {
                return {statusCode: 400, body: JSON.stringify('Request body has no repository action. Make sure your webhook is enabled to send repository events.')};
            }
        }
        else { return {statusCode: 403, body: JSON.stringify('Signature does not match. Aborting operation.')}; }
    }
    catch (error){
        console.log(error);
        return {statusCode: 500, body: JSON.stringify('Operation could not be completed.')};
    }
};

const initializeRequest = () => {
    let encodedCredentials = new Buffer.from(
        process.env.username + ":" + process.env.token
    );
    let authHeader = "Basic " + encodedCredentials.toString("base64");
    return {
        json: {},
        headers: {
            'Authorization': authHeader,
            'User-Agent': 'script',
            'Content-Type': 'application/json'
        },
        throwHttpErrors: false
    };
};

const protectMaster =  async (repo) => {
    try {
        let request = initializeRequest();
        request.json = protections;
        const response = await got.put(`${github_base}/repos/${repo}/branches/master/protection`, request);
        return response;
    } catch (error) {
        console.log(error);
        return { statusCode: 500, body: JSON.stringify('Operation could not be completed.') };
    }
};

const notifyIssue =  async (repo, protections) => {
    try {
        let request = initializeRequest();
        let protect = protections;
        request.json = {
            'title': 'Master branch protection enabled.',
            'body': '@jcappello \n The following permissions have been set: \n `' + protect + '`'
        };
        const response = await got.post(`${github_base}/repos/${repo}/issues`, request);
        return response;
    } catch (error) {
        console.log(error);
        return { statusCode: 500, body: JSON.stringify('Operation could not be completed.') };
    }
};

function verify_signature(secret, payload_body){
    let hash = crypto.createHmac('sha1', process.env.secret)
        .update(payload_body)
        .update('test')
        .digest('hex');
    let signature = 'sha1=' + hash;
    console.log('Compare: ' + signature);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(secret))){
        return false;
    } else return true;
};