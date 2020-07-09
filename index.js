const request = require('request');
const crypto = require('crypto');

const user = process.env.username;
const api_token = process.env.token;

//permission set for master branch
const permissions = {
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

exports.handler = (event, context, callback) => {

    console.log("Event: " + JSON.stringify(event, null, 2));
    console.log("Body: " + event.body);

    let response = {};

    let secret = event.headers['X-Hub-Signature'];
    let payload_body = event.body;

    //verify signatures match before proceeding
    if (secret && verify_signature(secret, payload_body)) {

        let body = JSON.parse(event.body);

        if (body.hasOwnProperty('action')) {
            //check if a repo was created
            if (body['action'] == 'created' && body.hasOwnProperty('repository')) {
                let repo = body.repository['full_name'];

                let protectFailed = false;
                protectMaster(repo, (protectError, protectResult) => {
                    if(protectError){
                        protectFailed = true;
                    }
                    //post issue with result
                    notifyIssue(repo, protectResult, (notifyError, issueResult) => {
                        console.log(protectFailed);
                        if (protectFailed && notifyError) {
                            response.statusCode = 500;
                            response.body = JSON.stringify('Operation failed');
                            callback(null, response);
                        }
                        if (notifyError) {
                            response.statusCode = issueResult.statusCode;
                            response.body = issueResult.body;
                            callback(null, response);
                        } else {
                            response.statusCode = 200;
                            response.body = JSON.stringify('Master branch protection enabled');
                            callback(null, response);
                        }
                    });
                });
            }
        }

    } else {
        response.statusCode = 403;
        response.body = JSON.stringify('Signatures do not match. Halting operation.');
        callback(null, response);
    }
};

const protectMaster = (repo, callback) => {
    request({
        body: JSON.stringify(permissions),
        method: "PUT",
        url: `https://api.github.com/repos/${repo}/branches/master/protection`,
        headers: {
            "User-Agent": "script",
            "Content-Type": "application/json"
        },
        auth: {
            "username": user,
            "password": api_token
        },
    }, (error, response) => {
        let res = {};
        if (error || response === undefined) {
            res.statusCode = 500;
            res.body = JSON.stringify({"message": error});
            callback(new Error("Could not complete operation."), response);
        }
        if(response.statusCode === 200) {
            callback(null, response);
        }
        else{
            res.statusCode = response.statusCode;
            callback(new Error("Could not complete operation."), response);
        }
    });
};

const notifyIssue = (repo, result, callback) => {
    let issue_text = {};
    if(result.statusCode === 200){
        issue_text = {
            "title": "Master branch protection enabled.",
            "body": "@jcappello \n The following permissions have been set: \n `" + JSON.stringify(permissions) + "`"
        };
    }
    else{
        issue_text = {
            "title": "Master branch protections could not be enabled at this time.",
            "body": "@jcappello \n The following error occured: \n `" + result.body + "`"
        };
    }
    console.log(issue_text);
    request({
        body: JSON.stringify(issue_text),
        method: "POST",
        url: `https://api.github.com/repos/${repo}/issues`,
        headers: {
            "User-Agent": "script",
            "Content-Type": "application/json"
        },
        auth: {
            "username": user,
            "password": api_token
        },
    }, (error, response) => {
        let res = {};
        if (error || response === undefined) {
            res.statusCode = 500;
            res.body = JSON.stringify({"message": error});
            callback(new Error("Could not complete operation."), response);
        }
        if(response.statusCode === 201) {
            callback(null, response);
        }
        else{
            res.statusCode = response.statusCode;
            callback(new Error("Could not complete operation."), response);
        }
    });
};


function verify_signature(secret, payload_body, callback){
    let hash = crypto.createHmac('sha1', process.env.secret)
        .update(payload_body)
        .digest('hex');
    let signature = 'sha1=' + hash;
    console.log('Compare: ' + signature);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(secret))){
        let response = {
            statusCode: 500,
            body: JSON.stringify('Signature does not match. Aborting operation.'),
        };
        callback(null, response);
    }
    else return true;
};