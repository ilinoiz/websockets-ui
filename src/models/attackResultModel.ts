import { ShipCellCoordinate } from "../dbModels/ShipCoordinatesStoredModel";

export enum AttackStatus {
    miss = "miss",
    killed = "killed",
    shot = "shot",
  }
  export interface AttackResult {
    status: AttackStatus;
    deadShipCells?: Omit<ShipCellCoordinate, "isDamaged">[];
    missedCells?: Omit<ShipCellCoordinate, "isDamaged">[];
  }