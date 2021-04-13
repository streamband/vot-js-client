import Websocket from "ws";

interface VotClientParams {
  url: string;
  playerId?: string;
  userId?: string;
  profileId?: string;
}

enum ConnectionStates {
  CONNECTED,
  DISCONNECTED,
  CONNECTING,
  CLOSING,
}

enum MessageTypes {
  sys_event = 0,
  player_event = 1,
  close = 2,
}

interface Message<T extends MessageTypes, P> {
  e: T;
  p: P;
}

enum PlayerEvent {
  error = 0,
  stop = 1,
  init = 2,
  play = 3,
  pause = 4,
  buffering = 5,
}

interface PlayerSimpleEventPayload {
  e:
    | PlayerEvent.buffering
    | PlayerEvent.pause
    | PlayerEvent.play
    | PlayerEvent.stop;
}

interface PlayerInitEventPayload {
  e: PlayerEvent.init;
  u: string;
  i?: string;
}

interface PlayerErrorEventPayload {
  e: PlayerEvent.error;
  c: number;
  m: string;
}

type PlayerEventPayload =
  | PlayerSimpleEventPayload
  | PlayerErrorEventPayload
  | PlayerInitEventPayload;

enum SystemEvent {
  init_session = 0,
}

interface SystemInitEventPayload {
  e: SystemEvent.init_session;
  p: string; //playerId
  u: string; //vot connection string (will be useful in case of white-labeling)
  i?: string; // userId
  r?: string; // profileId
}

type SystemEventPayload = SystemInitEventPayload;

type SystemMessage = Message<MessageTypes.sys_event, SystemEventPayload>;
type PlayerMessage = Message<MessageTypes.player_event, PlayerEventPayload>;
type CloseMessage = Omit<Message<MessageTypes.close, undefined>, "p">;

export function errorPayload(
  code: number,
  message: string
): PlayerErrorEventPayload {
  return {
    e: PlayerEvent.error,
    c: code,
    m: message,
  };
}

export function playPayload(): PlayerSimpleEventPayload {
  return { e: PlayerEvent.play };
}

export function stopPayload(): PlayerSimpleEventPayload {
  return { e: PlayerEvent.stop };
}

export function bufferingPayload(): PlayerSimpleEventPayload {
  return { e: PlayerEvent.buffering };
}

export function initPayload(
  url: string,
  contentId?: string
): PlayerInitEventPayload {
  return { e: PlayerEvent.init, u: url, i: contentId,  };
}

export function pausePayload(): PlayerSimpleEventPayload {
  return { e: PlayerEvent.pause };
}

export const vot = (params: VotClientParams) => {
  const ws = new Websocket(params.url, {});
  let state = ConnectionStates.CONNECTING;
  let queue: (SystemMessage | PlayerMessage | CloseMessage)[] = [];

  const send = (message: SystemMessage | PlayerMessage | CloseMessage) => {
    if (state === ConnectionStates.CONNECTED) {
      ws.send(message);
    } else {
      queue.push(message);
    }
  };

  send({
    e: MessageTypes.sys_event,
    p: {
      e: SystemEvent.init_session,
      p: params.playerId || "default",
      u: params.url,
      i: params.playerId,
      r: params.profileId
    },
  });

  ws.on("open", () => {
    state = ConnectionStates.CONNECTED;
    if (queue.length) {
      let message = queue.shift();
      while (message) {
        send(message);
        message = queue.shift();
      }
    }
  });

  ws.on("close", () => {
    state = ConnectionStates.DISCONNECTED;
  });

  ws.on("error", (err) => {
    console.error(err);
  });

  return {
    close: () => {
      state = ConnectionStates.CLOSING;
      send({ e: MessageTypes.close });
    },
    sendPlayerEvent: (payload: PlayerEventPayload) =>
      send({ e: MessageTypes.player_event, p: payload }),
  };
};
