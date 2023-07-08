export interface AddShipsRequestData {
  gameId: number;
  indexPlayer: number;
  ships: ShipData[];
}

export interface ShipData {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  type: string;
  length: number;
}
