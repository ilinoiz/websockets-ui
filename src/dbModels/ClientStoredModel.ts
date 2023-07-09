import { ShipData } from "../commands/requests/AddShipsRequestData";
import { WebSocketClient } from "../wsserver";
import { ShipCoordinatesStoredModel } from "./ShipCoordinatesStoredModel";

export interface ClientStoredModel {
    userName: string;
    client: WebSocketClient;
    index: number;
    sourceShips?: ShipData[];
    ships?: ShipCoordinatesStoredModel[];
  }