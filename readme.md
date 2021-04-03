# VOT client

Base JavaScript implementation of VOT transport protocol

## Motivation

Since clients for all platforms (SmartTV, browsers, set top boxes) will use same protocol we need base implementation.

## Usage 

```Typescript

import {client, initPayload, playPayload, errorPayload} from "@vot/client";

const playerBigStat = client({url:"https://vot.io"});
playerBigStat.sendPlayerEvent(initPayload("https://cutt.ly/pclAuLA"));
playerBigStat.sendPlayerEvent(playPayload());
playerBigStat.sendPlayerEvent(errorPayload(404, "file not found"));
playerBigStat.close();

const playerSmallStat = client({url:"https://vot.io", playerId: "small"});
playerSmallStat.sendPlayerEvent(initPayload("https://cutt.ly/pclAuLA"));
playerSmallStat.sendPlayerEvent(playPayload());
playerSmallStat.sendPlayerEvent(errorPayload(404, "file not found"));
playerSmallStat.close();

```
