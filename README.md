# success-stories-experiment

This repo contains the code for the experiment in the paper:

Lifchits, Anderson, Goldstein, Hofman, Watts in JDM (2021)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Try it out!

We've hosted a deployment of the experiment here:
[https://csslab.github.io/success-stories-experiment](https://csslab.github.io/success-stories-experiment).

The `workerId` URL parameter determines the experiment conditions. When you load
the page with no parameters, a worker ID will be randomly initialized. Feel free
to change it.

## Usage

1. Ensure `yarn` is installed
1. Install dependencies with `yarn install`
1. Run the application in debug mode using `yarn start`
1. Running `yarn build-prod` will compile the experiment application files in NON-DEBUG mode to the `./build` directory. This directory can be hosted on a static file server to host the experiment.
