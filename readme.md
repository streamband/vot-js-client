# VOT client

Base JavaScript implementation of VOT transport protocol

## Motivation

Since clients for all platforms (SmartTV, browsers, set top boxes) will use same protocol we need base implementation.

## Usage 

```Typescript

import {client, initPayload, playPayload, errorPayload} from "@vot/client";

client({url:"https://vot.io"});
client.sendPlayerEvent(initPayload("https://cutt.ly/pclAuLA"));
client.sendPlayerEvent(playPayload());
client.sendPlayerEvent(errorPayload(404, "file not found"));
client.close();

```
