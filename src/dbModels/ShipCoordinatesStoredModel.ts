export interface ShipCellCoordinate extends CellCoordinates {
  isDamaged: boolean;
}

export interface ShipCoordinatesStoredModel {
  coordinates: ShipCellCoordinate[];
}

export interface CellCoordinates {
  x: number;
  y: number;
}
