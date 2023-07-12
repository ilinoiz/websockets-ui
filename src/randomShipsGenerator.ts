import { ShipData } from "./commands/requests/AddShipsRequestData";
import {
  CellCoordinates,
  ShipCellCoordinate,
  ShipCoordinatesStoredModel,
} from "./dbModels/ShipCoordinatesStoredModel";
const shipsConfig = {
  huge: {
    length: 4,
    count: 1,
  },
  large: {
    length: 3,
    count: 2,
  },
  medium: {
    length: 2,
    count: 3,
  },
  small: {
    length: 1,
    count: 4,
  },
};

export const randomShipsGenerator = (): ShipData[] => {
  const result: ShipData[] = [];

  const allCoordinates: CellCoordinates[] = [];
  for (const shipType in shipsConfig) {
    for (let i = 0; i < shipsConfig[shipType].count; i++) {
      let isIntersected = true;
      while (isIntersected) {
        const generatedShip = {
          type: shipType,
          position: {
            x: generateRandomValue(),
            y: generateRandomValue(),
          },
          length: shipsConfig[shipType].length,
          direction: !!generateRandomValue(0, 1),
        };
        if (IsOutOfBorder(generatedShip)) {
          continue;
        }
        const ship = convertShipFromSource(generatedShip);
        const borderCoordinates = getShipBorderCells(ship);

        isIntersected = IsIntersected(ship, allCoordinates);

        if (!isIntersected) {
          allCoordinates.push(...ship.coordinates, ...borderCoordinates);
          result.push(generatedShip);
        }
      }
    }
  }
  console.log(JSON.stringify(result));
  return result;
};

const getShipBorderCells = (
  ship: ShipCoordinatesStoredModel
): CellCoordinates[] => {
  const missedCells = [];
  ship.coordinates.forEach((cell) => {
    for (let i = cell.x - 1; i <= cell.x + 1; i++) {
      for (let j = cell.y - 1; j <= cell.y + 1; j++) {
        missedCells.push({ x: i, y: j });
      }
    }
  });
  const clearedCells = [];
  missedCells.map((cell) => {
    if (
      !clearedCells.find((item) => item.x === cell.x && item.y === cell.y) &&
      !ship.coordinates.find((item) => item.x === cell.x && item.y === cell.y)
    ) {
      clearedCells.push(cell);
    }
  });
  return clearedCells;
};

const convertShipFromSource = (ship: ShipData): ShipCoordinatesStoredModel => {
  const result: ShipCoordinatesStoredModel[] = [];

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

  return { coordinates: shipCoordinates };
};

const generateRandomValue = (from = 0, to = 9) => {
  return Math.floor(Math.random() * (to - from + 1) + from);
};
function IsIntersected(
  ship: ShipCoordinatesStoredModel,
  allCoordinates: CellCoordinates[]
) {
  if (!allCoordinates.length) {
    return false;
  }

  for (const shipCell of ship.coordinates) {
    if (
      allCoordinates.some(
        (cell) => cell.x == shipCell.x && cell.y === shipCell.y
      )
    ) {
      return true;
    }
  }

  return false;
}

function IsOutOfBorder(ship: ShipData) {
  if (ship.type === "small") {
    return false;
  }
  if (ship.direction) {
    return ship.position.y + ship.length > 9;
  } else {
    return ship.position.x + ship.length > 9;
  }
}
