# VOT client

Base JavaScript implementation of VOT transport protocol

## Motivation

Since clients for all platforms (SmartTV, browsers, set top boxes) will use same protocol we need base implementation.


```
yarn add @votjs/client
```
or 
```
npm add @votjs/client
```

## Usage 

```sh
$ yarn add @votjs/client
```
or 
```sh
$ npm add @votjs/client
```

and then

```Typescript

import {client, initPayload, playPayload, errorPayload} from "@votjs/client";

const userId = "watching user id";
const profileId = "watching profile id"
const playerBigStat = client({url:"https://vot.io", userId, profileId});
playerBigStat.sendPlayerEvent(initPayload("https://cutt.ly/pclAuLA", "video asset id"));
playerBigStat.sendPlayerEvent(playPayload());
playerBigStat.sendPlayerEvent(errorPayload(404, "file not found"));
playerBigStat.close();

const playerSmallStat = client({url:"https://vot.io", playerId: "small", userId, profileId});
playerSmallStat.sendPlayerEvent(initPayload("https://cutt.ly/pclAuLA", "video asset id"));
playerSmallStat.sendPlayerEvent(playPayload());
playerSmallStat.sendPlayerEvent(errorPayload(404, "file not found"));
playerSmallStat.close();

```
