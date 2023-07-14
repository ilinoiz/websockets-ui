import {
  AddShipsRequestData,
  ShipData,
} from "../commands/requests/AddShipsRequestData";
import { GameAttackRequestData } from "../commands/requests/GameAttackRequestData";
import { ClientStoredModel } from "../dbModels/ClientStoredModel";
import { RoomStoredModel } from "../dbModels/RoomStoredModel";
import {
  CellCoordinates,
  ShipCoordinatesStoredModel,
} from "../dbModels/ShipCoordinatesStoredModel";
import { AttackResult, AttackStatus } from "../models/attackResultModel";
import {
  convertShipFromSource,
  getShipBorderCells,
} from "../randomShipsGenerator";

class RoomsRepository {
  roomsDb: RoomStoredModel[] = [];

  addClientTurnToHistory = (
    clientId: number,
    indexRoom: number,
    cellCoordinates: CellCoordinates
  ) => {
    const room = this.roomsDb.find((room) => room.index === indexRoom);
    const user = room.roomUsers.find((user) => user.index === clientId);
    user.history ??= [];
    user.history.push(cellCoordinates);
  };

  getClientTurnsHistory = (clientId: number, indexRoom: number) => {
    const room = this.roomsDb.find((room) => room.index === indexRoom);
    if (!room?.roomUsers) {
      return [];
    }
    const user = room.roomUsers.find((user) => user.index === clientId);
    return user.history || [];
  };

  getClientsRoom = (clientId: number) => {
    return this.roomsDb.find((room) =>
      room.roomUsers.find((user) => user.index === clientId)
    );
  };
  
  getCurrentTurnClientId = (indexRoom: number) => {
    const room = this.roomsDb.find((room) => room.index === indexRoom);
    return room.currentTurnClientId;
  };

  setCurrentTurnClientId(indexRoom: number, currentTurnClientId: number) {
    const room = this.roomsDb.find((room) => room.index === indexRoom);
    room.currentTurnClientId = currentTurnClientId;
  }

  createSinglePlayerRoom = (client: ClientStoredModel) => {
    const room = this.createRoom(client);
    room.isSinglePlayerRoom = true;
    return room;
  };

  isSinglePlayerRoom = (indexRoom: number): boolean => {
    const room = this.roomsDb.find((room) => room.index === indexRoom);
    return room.isSinglePlayerRoom;
  };

  createRoom = (client: ClientStoredModel) => {
    const newRoom: RoomStoredModel = {
      roomUsers: [client],
      index: this.roomsDb.length,
    };
    this.roomsDb.push(newRoom);
    return newRoom;
  };

  addUserToRoom = (client: ClientStoredModel, indexRoom: number) => {
    const room = this.roomsDb.find((room) => room.index === indexRoom);
    if (room.roomUsers.length < 2) {
      room.roomUsers.push(client);
    }
  };

  getAvailableRooms = () => {
    return this.roomsDb.filter((room) => room.roomUsers.length === 1);
  };

  addShips = (addShipsRequestData: AddShipsRequestData) => {
    const room = this.roomsDb.find(
      (room) => room.index === addShipsRequestData.gameId
    );
    const user = room.roomUsers.find(
      (user) => user.index === addShipsRequestData.indexPlayer
    );
    user.sourceShips = addShipsRequestData.ships;
    user.ships = this.convertShipsFromSource(addShipsRequestData.ships);
  };

  isReadyToStart = (roomId: number) => {
    const room = this.roomsDb.find((room) => room.index === roomId);
    const isShipsReady = room.roomUsers.every(
      (user) => user.sourceShips?.length > 0
    );
    const isTwoUsers = room.roomUsers.length === 2;
    return isTwoUsers && isShipsReady;
  };

  getWinner = (roomId: number) => {
    const room = this.roomsDb.find((room) => room.index === roomId);
    const looser = room.roomUsers.find((user) => {
      return user.ships.every((ship) =>
        ship.coordinates.every((coordinate) => coordinate.isDamaged)
      );
    });
    return looser
      ? room.roomUsers.find((user) => user.index !== looser.index)
      : null;
  };

  getAttackResult = (
    gameAttackRequestData: GameAttackRequestData
  ): AttackResult => {
    const room = this.roomsDb.find(
      (room) => room.index === gameAttackRequestData.gameId
    );
    if (!room) {
      return;
    }
    const enemyUser = room.roomUsers.find(
      (user) => user.index !== gameAttackRequestData.indexPlayer
    );
    for (const ship of enemyUser.ships) {
      const targetShipCellCoordinateIndex = ship.coordinates.findIndex(
        (coordinate) =>
          coordinate.x === gameAttackRequestData.x &&
          coordinate.y === gameAttackRequestData.y
      );
      if (targetShipCellCoordinateIndex > -1) {
        ship.coordinates[targetShipCellCoordinateIndex].isDamaged = true;
        if (ship.coordinates.every((coordinate) => coordinate.isDamaged)) {
          const clearedCells = getShipBorderCells(ship);
          const attackResult = {
            status: AttackStatus.killed,
            deadShipCells: ship.coordinates,
            missedCells: clearedCells,
          };
          return attackResult;
        } else {
          return { status: AttackStatus.shot };
        }
      }
    }
    return { status: AttackStatus.miss };
  };

  private convertShipsFromSource = (
    ships: ShipData[]
  ): ShipCoordinatesStoredModel[] => {
    const result: ShipCoordinatesStoredModel[] = [];

    ships.forEach((ship) => {
      result.push(convertShipFromSource(ship));
    });
    return result;
  };

  getRoomClients = (gameId: number) => {
    const room = this.roomsDb.find((room) => room.index === gameId);
    return room.roomUsers;
  };

  completeGame = (gameId: number) => {
    const finishedGame = this.roomsDb.find((room) => room.index === gameId);
    finishedGame.roomUsers.forEach((client) => {
      client.history = [];
      client.ships = [];
      client.sourceShips = [];
    });
    this.roomsDb = this.roomsDb.filter((room) => room.index !== gameId);
  };
}

const roomsRepository = new RoomsRepository();
export default roomsRepository;
