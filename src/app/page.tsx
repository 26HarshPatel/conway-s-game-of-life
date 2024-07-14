"use client";

import { useState } from "react";

const resolution = 10;
const ROWS = 30;
const COLS = 30;
const singleRowArray = new Array(30).fill(0);

type FixedLengthArray<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _FixedLengthArray<T, N, []>
  : never;
type _FixedLengthArray<
  T,
  N extends number,
  R extends unknown[],
> = R["length"] extends N ? R : _FixedLengthArray<T, N, [T, ...R]>;

type Grid = FixedLengthArray<FixedLengthArray<number, 30>, 30>;

function buildCanvasGrid(random = false): Grid {
  const newGrid = new Array(COLS)
    .fill(null)
    .map(() =>
      new Array(ROWS)
        .fill(null)
        .map(() => (random ? Math.floor(Math.random() * 2) : 0)),
    ) as Grid;
  return newGrid;
}

function getLivingNeighbors(grid: Grid, col: number, row: number): number {
  const neighbors: [number, number][] = [
    [col - 1, row - 1],
    [col - 1, row],
    [col - 1, row + 1],
    [col, row - 1],
    [col, row + 1],
    [col + 1, row - 1],
    [col + 1, row],
    [col + 1, row + 1],
  ];

  return neighbors.reduce((countNeighbours: number, [innerCol, innerRow]) => {
    if (
      innerCol >= 0 &&
      innerCol < COLS &&
      innerRow >= 0 &&
      innerRow < ROWS &&
      grid[innerCol]?.[innerRow] !== undefined
    ) {
      countNeighbours += grid[innerCol][innerRow];
    }
    return countNeighbours;
  }, 0);
}

function nextGenerationGrid(grid: Grid): Grid {
  const nextGenGrid: Grid = grid.map((arr) => [...arr]) as Grid;

  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const neighbors = getLivingNeighbors(grid, col, row);
      const cell = grid[col]?.[row];
      const fullRow = nextGenGrid[col] ?? singleRowArray;

      if (cell === 0 && neighbors === 3) {
        fullRow[row] = 1;
      } else if (cell === 1 && (neighbors === 2 || neighbors === 3)) {
        fullRow[row] = 1;
      } else if (neighbors < 2 || neighbors >= 4) {
        fullRow[row] = 0;
      }
    }
  }
  return nextGenGrid;
}

export default function HomePage() {
  const [grid, setGrid] = useState<Grid>(buildCanvasGrid());
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  function startGame() {
    setIsRunning(true);
    const interval = setInterval(() => {
      setGrid((prevValue) => nextGenerationGrid(prevValue));
    }, 500);
    setIntervalId(interval);
  }

  function stopGame() {
    setIsRunning(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }

  function resetGame() {
    stopGame();
    setGrid(buildCanvasGrid());
  }

  function handleSetRandomPosition() {
    setGrid(buildCanvasGrid(true));
    startGame();
  }

  function handleCanvasClick(colIndex: number, rowIndex: number) {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((arr) => [...arr]) as Grid;
      if (newGrid[colIndex]?.[rowIndex] !== undefined) {
        newGrid[colIndex][rowIndex] = prevGrid[colIndex]?.[rowIndex] ? 0 : 1;
      }
      return newGrid;
    });
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-200">
      <div className="headerDiv h-max w-max rounded-md bg-slate-100 p-7 shadow-lg shadow-gray-700">
        <div className="flex flex-col gap-1">
          <div className="text-sm">Welcome to the world of...</div>
          <h2 className="text-2xl font-semibold">{`CONWAY'S GAME OF LIFE`}</h2>
          <hr />
        </div>
        <div className="canvasDiv">
          <div className="gameBox flex justify-evenly gap-0 border-2 border-black">
            {grid.map((col, colIndex) => {
              return (
                <div key={colIndex}>
                  {col.map((row, rowIndex) => {
                    return (
                      <div
                        key={rowIndex}
                        style={{
                          width: `${resolution}px`,
                          height: `${resolution}px`,
                        }}
                        className={`${
                          grid[colIndex]?.[rowIndex] === 0
                            ? "bg-white"
                            : "bg-black"
                        } border border-black`}
                        onClick={() => handleCanvasClick(colIndex, rowIndex)}
                      ></div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-between">
            {!isRunning ? (
              <button onClick={startGame} className="cursor-pointer text-sm">
                Start Game
              </button>
            ) : (
              <button onClick={stopGame} className="cursor-pointer text-sm">
                Stop Game
              </button>
            )}
            {!isRunning ? (
              <button
                onClick={handleSetRandomPosition}
                className="cursor-pointer text-sm"
              >
                Start With Random Position
              </button>
            ) : (
              <button onClick={resetGame} className="cursor-pointer text-sm">
                Stop & Reset Game
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
