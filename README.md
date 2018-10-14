## Unity CI

**Unity CI** is a [Github App](https://developer.github.com/apps/about-apps) for Continuous Integration with [Unity Cloud Build](https://unity3d.com/unity/features/cloud-build).

This product made with [Probot](https://probot.github.io).

## Build Status
|Travis CI|Codecov|
|---------|---------|
|[![Build Status](https://travis-ci.org/karasusan/UnityCI.svg?branch=master)](https://travis-ci.org/karasusan/UnityCI)|[![codecov](https://codecov.io/gh/karasusan/UnityCI/branch/master/graph/badge.svg)](https://codecov.io/gh/karasusan/UnityCI)|

## Usage

1. Install [GithubApp](https://github.com/apps/unity-ci) to your github repo.
2. Create [unityci.yml](https://github.com/karasusan/UnityCISample/blob/master/.github/unityci.yml).
3. Create Pull Request.

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

### Encrypting Multiple Files

These files encrypted with [the Travis command line tool](https://github.com/travis-ci/travis.rb#readme).

```sh
# Create archive file
tar cvf secrets.tar app.yaml gcp-secret.json githubapp.private-key.pem

# encrypt 
travis encrypt-file secrets.tar --pro
```

See also travis-ci [document](https://docs.travis-ci.com/user/encrypting-files/#encrypting-multiple-files).


- gcp-secret.json

  - See [this](https://docs.travis-ci.com/user/deployment/google-app-engine/). You can obtain this from [Google Cloud Console Dashboard](http://console.developers.google.com/).

- app.yaml

- unity-ci.githubapp.private-key.pem
  - See [this](https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#generating-a-private-key)

## Contributing

If you have suggestions for how unityci could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2018 kazuki matsumoto <karasusan@gmail.com> (https://github.com/karasusan/UnityCI)
