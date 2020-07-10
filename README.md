
# GitHub Technical Challenge

GitHub has a [powerful API](https://developer.github.com/v3/) that enables developers to easily access GitHub data. Companies often ask us to craft solutions to their specific problems. A common request we receive is for branches to be automatically protected upon creation.

Please create a simple web service that listens for [organization events](https://developer.github.com/webhooks/#events) to know when a repository has been created. When the repository is created please automate the protection of the master branch. Notify yourself with an @mention in an issue within the repository that outlines the protections that were added.

## Getting Started

These instructions will get you a copy of the project up and running with your github instance.

### Prerequisites

* AWS account with access to create API Gateway and Lambda
* a GitHub account
* an organization within the GitHub account
* a repository
* an API token for the GitHub user/account which will own/run the solution


### Setup

1. Create an AWS lambda using the supplied script. Feel free to use the deploy.zip to deploy. Ensure your lambda function has three environment variables: secret, token, and username. Enter your GitHub username and API token here. We will enter the secret later.
2. Create an API Gateway as desired. Point your gateway to a lambda proxy using the lambda function you created in step 1. You will use the generated API gateway URL as the endpoint for your webhook.
3. Navigate to your organization settings in GitHub and then click "Webhooks" (https://github.com/organizations/<your_org>/settings/hooks)
4. Create a new webhook using the URL for your API Gateway. Set Content-Type to application/json and supply a secret. See this web page for further information on secrets: https://developer.github.com/webhooks/securing/. Set this same secret in your AWS lambda environment variables. Select "Let me select individual events." and make sure "Repositories" is checked. Don't forget to ensure your webhook is active!


## Testing the solution

When you set up the initial webhook, GitHub should send a test automatically. Note that this test should fail, as it does not include a repository action. You can create a new repository to test.


## Built With

* [got](https://www.npmjs.com/package/got) - Used to make REST API calls
* [crypto](https://nodejs.org/api/crypto.html) - Used to evaluate secret


## Author

Julie Cappello - *Initial work*

## License

This project is not licensed.

## Acknowledgments

* Hat tip to GitHub's great documentation

## Future Considerations

* Update to use OAuth
