import {
  AddShipsRequestData,
  ShipData as SourceShipData,
} from "./commands/requests/AddShipsRequestData";
import { GameAttackRequestData } from "./commands/requests/GameAttackRequestData";
import { WebSocketClient } from "./wsserver";

export interface RoomModel {
  roomUsers: ClientModel[];
  index: number;
}

export interface ClientModel {
  userName: string;
  client: WebSocketClient;
  index: number;
  sourceShips?: SourceShipData[];
  ships?: ShipCoordinates[];
}

export interface ShipCellCoordinate {
  x: number;
  y: number;
  isDamaged: boolean;
}

export interface ShipCoordinates {
  coordinates: ShipCellCoordinate[];
}

class RoomsRepository {
  roomsDb: RoomModel[] = [];

  createRoom = (client: ClientModel) => {
    const newRoom: RoomModel = {
      roomUsers: [client],
      index: this.roomsDb.length,
    };
    this.roomsDb.push(newRoom);
    return newRoom;
  };

  addUserToRoom = (client: ClientModel, indexRoom: number) => {
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

    console.log(JSON.stringify(user.sourceShips));
    console.log(JSON.stringify(user.ships));
  };

  isReadyToStart = (roomId: number) => {
    const room = this.roomsDb.find((room) => room.index === roomId);
    const isShipsReady = room.roomUsers.every(
      (user) => user.sourceShips?.length > 0
    );
    const isTwoUsers = room.roomUsers.length === 2;
    return isTwoUsers && isShipsReady;
  };

  getAttackResult = (gameAttackRequestData: GameAttackRequestData) => {
    const room = this.roomsDb.find(
      (room) => room.index === gameAttackRequestData.gameId
    );
    const enemyUser = room.roomUsers.find(
      (user) => user.index !== gameAttackRequestData.indexPlayer
    );
  };

  private convertShipsFromSource = (
    ships: SourceShipData[]
  ): ShipCoordinates[] => {
    const result: ShipCoordinates[] = [];

    ships.forEach((ship) => {
      const shipCoordinates: ShipCellCoordinate[] = [];
      let xCoordinate = ship.position.x;
      let yCoordinate = ship.position.y;
      for (let i = 0; i < ship.length; i++) {
        const coordinate = { x: null, y: null, isDamaged: false };

        if (ship.direction) {
          coordinate.x = ship.position.x;
          coordinate.y = yCoordinate++;
        } else {
          coordinate.x = xCoordinate++;
          coordinate.y = ship.position.y;
        }
        shipCoordinates.push(coordinate);
      }
      result.push({ coordinates: shipCoordinates });
    });
    return result;
  };
}

const roomsRepository = new RoomsRepository();
export default roomsRepository;
