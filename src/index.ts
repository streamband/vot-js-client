import Websocket from "ws";

interface VotClientParams {
  url: string;
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
}

interface PlayerErrorEventPayload {
  e: PlayerEvent.error;
  c: number;
  m: string;
}

type PlayerEventPayload = PlayerSimpleEventPayload | PlayerErrorEventPayload | PlayerInitEventPayload;

enum SystemEvent {}

interface SystemEventPayload {
  e: SystemEvent;
  c: number;
  m: string;
}

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

export function initPayload(url: string): PlayerInitEventPayload {
  return { e: PlayerEvent.init, u: url };
}

export function pausePayload(): PlayerSimpleEventPayload {
  return { e: PlayerEvent.pause };
}

export const vot = (params: VotClientParams) => {
  const ws = new Websocket(params.url, {});
  let state = ConnectionStates.CONNECTING;

  let queue: (SystemMessage | PlayerMessage | CloseMessage)[] = [];

  ws.on("open", () => {
    state = ConnectionStates.CONNECTED;
    if (queue.length) {
      let message = queue.pop();
      while (message) {
        send(message);
        message = queue.pop();
      }
    }
  });

  ws.on("close", () => {
    state = ConnectionStates.DISCONNECTED;
  });

  const send = (message: SystemMessage | PlayerMessage | CloseMessage) => {
    if (state === ConnectionStates.CONNECTED) {
      ws.send(message);
    } else {
      queue.push(message);
    }
  };

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
    sendSystemEvent: (payload: SystemEventPayload) => {
      send({ e: MessageTypes.sys_event, p: payload });
    },
  };
};
