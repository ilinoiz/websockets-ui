import { WebSocketServer } from "ws";
import * as WebSocket from "ws";
import { IncomingMessage } from "http";
import { parseCommand } from "../commands/parseCommand";
import { loginHandler } from "../commandHandlers/loginHandler";
import { createRoomHandler } from "../commandHandlers/createRoomHandler";
import { addUserToRoomHandler } from "../commandHandlers/addUserToRoomHandler";
import { addShipsHandler } from "../commandHandlers/addShipsHandler";
import { attackHandler } from "../commandHandlers/attackHandler";
import commandSender from "../CommandSender";
import { CommandType } from "../commands/CommandDTO";

export type WebSocketClient = WebSocket & { sessionId: string };

const wss = new WebSocketServer({ port: 3000, clientTracking: true });

wss.on("connection", (currentSocketClient: WebSocketClient, request: IncomingMessage) => {
  console.log(request.headers["sec-websocket-key"]);
  
  currentSocketClient.on("error", console.error);//todo
  
  currentSocketClient.sessionId = request.headers["sec-websocket-key"];

  currentSocketClient.on("message", (data: string) => {

    const request = parseCommand(data.toString());
    console.log(
      `received data: ${JSON.stringify(request)}, sessionId=${currentSocketClient.sessionId}`
    );

    switch (request.type) {
      case CommandType.login:
        loginHandler(request.data, currentSocketClient);
        break;
      case CommandType.createRoom:
        createRoomHandler(currentSocketClient);
        break;
      case CommandType.addUserToRoom:
        addUserToRoomHandler(request.data, currentSocketClient);
        break;
      case CommandType.addShips:
        addShipsHandler(request.data);
        break;
      case CommandType.attack:
        attackHandler(request.data);
        break;
      default:
        break;
    }

    commandSender.sendUpdateRoom(wss.clients as Set<WebSocket>);
    commandSender.sendUpdateWinners(wss.clients as Set<WebSocket>);
  });
});
