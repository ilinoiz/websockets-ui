import { CellCoordinates } from "../dbModels/ShipCoordinatesStoredModel";

export enum AttackStatus {
  miss = "miss",
  killed = "killed",
  shot = "shot",
}
export interface AttackResult {
  status: AttackStatus;
  deadShipCells?: CellCoordinates[];
  missedCells?: CellCoordinates[];
}
