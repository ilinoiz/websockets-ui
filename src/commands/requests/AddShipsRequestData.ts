import { CellCoordinates } from "../../dbModels/ShipCoordinatesStoredModel";

export interface AddShipsRequestData {
  gameId: number;
  indexPlayer: number;
  ships: ShipData[];
}

export interface ShipData {
  position: CellCoordinates;
  direction: boolean;
  type: string;
  length: number;
}
