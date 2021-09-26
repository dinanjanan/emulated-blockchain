# Emulated Blockchain

## Overview

An implementation of an emulated blockchain with a built-in peer-to-peer network. It's emulated because the nodes (peers) are not really other computers, but are part of the ephemeral state of the application when created. I chose to implement it this way instead of making it truly peer-to-peer using, for example by using a protocol like WebRTC, so that users can test whatever they want with the blockchain, and the changes will only reflect on their device.

## The rationale behind choosing redux for this project

I went with `@reduxjs/toolkit` for this project to see how such an app could be built using pure redux with patterns promoted by redux toolkit (basically, as an experiment). For obvious reasons, something like a blockchain I've adapted for this application would be better implemented using a technology like RxJS Observables, which is why I'm planning on creating another repository implementing this in the future.

## Running the application

No third-party build systems or task runners are used other than webpack and babel which are abstracted away by `create-react-app`. So, simply run `yarn start` to start the webpack development server, and `yarn build` to create a production build.
