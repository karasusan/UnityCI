## Unity CI

**Unity CI** is a [Github App](https://developer.github.com/apps/about-apps) for Continuous Integration with [Unity Cloud Build](https://unity3d.com/unity/features/cloud-build).

This product made with [Probot](https://probot.github.io).

## Build Status
|Travis CI|Codecov|
|---------|---------|
|[![Build Status](https://travis-ci.org/karasusan/UnityCI.svg?branch=master)](https://travis-ci.org/karasusan/UnityCI)|[![codecov](https://codecov.io/gh/karasusan/UnityCI/branch/master/graph/badge.svg)](https://codecov.io/gh/karasusan/UnityCI)|

## Usage

Install GithubApp

## Setup

```sh
# Install dependencies
npm install

# Run typescript
npm run build

# Run the bot
npm start
```

## Deployment

Hosting to Google App Engine with [TravisCI](https://travis-ci.com/karasusan/UnityCI).　It is written [here](https://docs.travis-ci.com/user/deployment/google-app-engine/).

### Encrypted Files

These files encrypted with [the Travis command line tool](https://github.com/travis-ci/travis.rb#readme).

- gcp-secret.json.ecp

See [this](https://docs.travis-ci.com/user/deployment/google-app-engine/).

Go to the [Google Cloud Console Dashboard](http://console.developers.google.com/) and:

1. Enable “Google App Engine Admin API”,
2. Go to “Credentials”, click “Add Credential” and “Service account key”, finally click “JSON” to download your Service Account JSON file.

- app.yaml.ecp
- githubapp-secret.pem.ecp

## Contributing

If you have suggestions for how unityci could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2018 kazuki matsumoto <karasusan@gmail.com> (https://github.com/karasusan/UnityCI)
