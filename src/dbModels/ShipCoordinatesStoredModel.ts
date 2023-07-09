export interface ShipCellCoordinate {
  x: number;
  y: number;
  isDamaged: boolean;
}

export interface ShipCoordinatesStoredModel {
  coordinates: ShipCellCoordinate[];
}
