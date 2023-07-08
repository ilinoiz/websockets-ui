import { WebSocketServer } from "ws";
import { LoginRequestData } from "../commands/requests/LoginRequestDTO";
import { CommandType } from "../commands/DTOBase";
import { LoginResponseDTO } from "../commands/responses/LoginResponseDTO";
import { CreateRoomRequestDTO } from "../commands/requests/CreateRoomRequestDTO";
import clientsRepository from "../ClientsRepository";
import * as WebSocket from "ws";
import { IncomingMessage } from "http";
import roomsRepository, { ClientModel } from "../RoomsRepository";
import { AddUserToRoomRequestData } from "../commands/requests/AddUserToRoomRequestData";
import { AddShipsRequestData } from "../commands/requests/AddShipsRequestData";
import { parseCommand } from "../commands/parseCommand";
import { GameAttackRequestData } from "../commands/requests/GameAttackRequestData";

export type WebSocketClient = WebSocket & { id: string };

const wss = new WebSocketServer({ port: 3000, clientTracking: true });

wss.on("connection", (ws: WebSocketClient, request: IncomingMessage) => {
  console.log(request.headers["sec-websocket-key"]);
  ws.on("error", console.error);
  ws.id = request.headers["sec-websocket-key"];
  ws.on("message", (data: string) => {
    const request = parseCommand(data.toString());
    console.log("received data: %s ", request);

    if (request.type === CommandType.login) {
      const result = request.data as LoginRequestData;
      const response: LoginResponseDTO = {
        id: 0,
        data: JSON.stringify({
          name: result.name,
          index: 0,
          error: false,
          errorText: "",
        }),
        type: CommandType.login,
      };
      clientsRepository.createUser(result.name, ws);
      ws.send(JSON.stringify(response));
    }
    if (request.type === CommandType.createRoom) {
      const result = request.data as CreateRoomRequestDTO;
      const client = clientsRepository.getClient(ws.id);
      const newRoom = roomsRepository.createRoom(client);
      const createGameData = {
        idGame: 0,
        idPlayer: 0,
      };
      const createGame = {
        type: CommandType.createGame,
        data: JSON.stringify(createGameData),
        id: 0,
      };

      ws.send(JSON.stringify(createGame));
    }
    if (request.type === CommandType.addUserToRoom) {
      const requestData = request.data as AddUserToRoomRequestData;
      const client = clientsRepository.getClient(ws.id);

      roomsRepository.addUserToRoom(client, requestData.indexRoom);

      const createGameData = {
        idGame: requestData.indexRoom,
        idPlayer: client.index,
      };
      const createGame = {
        type: CommandType.createGame,
        data: JSON.stringify(createGameData),
        id: 0,
      };

      ws.send(JSON.stringify(createGame));
    }
    if (request.type === CommandType.addShips) {
      const requestData = request.data as AddShipsRequestData;
      roomsRepository.addShips(requestData);
      const isReadyToStart = roomsRepository.isReadyToStart(requestData.gameId);
      if (isReadyToStart) {
        const startGameData = {
          ships: requestData.ships,
          currentPlayerIndex: requestData.indexPlayer,
        };
        const startGame = {
          type: CommandType.startGame,
          data: JSON.stringify(startGameData),
          id: 0,
        };

        ws.send(JSON.stringify(startGame));
      }
    }
    if (request.type === CommandType.attack) {
      const requestData = request.data as GameAttackRequestData;
      const attackResponseData = {
        position: { x: requestData.x, y: requestData.y },
        
      };
      const startGame = {
        type: CommandType.attack,
        data: JSON.stringify(attackResponseData),
        id: 0,
      };

      ws.send(JSON.stringify(startGame));
    }
    const availableRooms = roomsRepository.getAvailableRooms();

    const roomsData = availableRooms.map((room) => {
      return {
        roomId: room.index,
        roomUsers: room.roomUsers.map(({ userName, index }) => {
          return {
            name: userName,
            index,
          };
        }),
      };
    });
    const updateRoomCommand = {
      type: CommandType.updateRoom,
      id: 0,
      data: JSON.stringify(roomsData),
    };
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(updateRoomCommand));
    });
  });
});
