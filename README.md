
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

1. Create an API Gateway as desired. Point your gateway to a lambda proxy using this script as your lambda function. Use the generated API gateway URL as the endpoint for your webhook
2. Navigate to your organization settings in GitHub and then click "Webhooks" (https://github.com/organizations/<your_org>/settings/hooks)
3. Create a new webhook using the URL for your API Gateway. Set Content-Type to application/json and supply a secret. See this web page for further information on secrets: https://developer.github.com/webhooks/securing/.  Select "Let me select individual events." and make sure "Repositories" is checked. Don't forget to ensure your webhook is active!


## Testing the solution

When you set up the initial webhook, GitHub should send a test automatically


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
