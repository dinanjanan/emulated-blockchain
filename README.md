# Blockchain demo

## Overview

An implementation of an emulated blockchain with a built-in peer-to-peer network. It's emulated because the nodes (peers) are not really other computers, but are part of the ephemeral state of the application when it is run. I chose to implement it this way instead of making it truly peer-to-peer using a protocol like WebRTC for example, so that users can test whatever they want with the blockchain, and the changes will only reflect on their device.

## The rationale behind choosing redux for this project

I chose @reduxjs/toolkit for this project as an experiment to see how such an app could be built using pure redux with patterns promoted by redux toolkit (and a thunk was used to make API calls to generate random names for the peers). For obvious reasons, something like a blockchain I've adapted for this application would be better implemented using technologies like RxJS Observables, and I plan on creating another repository implementing this in the future.
