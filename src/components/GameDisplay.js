import React from 'react';
import { ReactComponent as PlayIcon } from '../assets/play-solid.svg';
import { ReactComponent as PauseIcon } from '../assets/pause-solid.svg';
import { ReactComponent as RandomeIcon } from '../assets/random-solid.svg';
import { ReactComponent as DeleteIcon } from '../assets/delete-left-solid.svg';

var screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
var screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

const CELL_SIZE = Math.floor(Math.min(screenWidth, screenHeight)/60);
const WIDTH = closestNumber(Math.floor(screenWidth * 0.9), CELL_SIZE) + 1;
const HEIGHT = closestNumber(Math.floor(screenHeight * 0.75), CELL_SIZE) + 1;

function closestNumber(n, m) {
    let q = Math.floor(n / m);
    let n1 = m * q;

    let n2 = (n * m) > 0 ? (m * (q + 1)) : (m * (q - 1));

    if (Math.abs(n - n1) < Math.abs(n - n2)) return n1;

    return n2;    
}

const Cell = ({ x, y }) => {
    return (
        <div className="absolute bg-accent" style={{
            left: `${CELL_SIZE * x + 1}px`,
            top: `${CELL_SIZE * y + 1}px`,
            width: `${CELL_SIZE - 1}px`,
            height: `${CELL_SIZE - 1}px`,
        }} />
    );
}


class Game extends React.Component {
    constructor() {
        super();
        this.rows = Math.floor(HEIGHT / CELL_SIZE);
        this.cols = Math.floor(WIDTH / CELL_SIZE);

        this.board = this.makeEmptyBoard();
        this.handleRandom();
        this.runGame();
    }

    state = {
        cells: [],
        isRunning: true,
        interval: 100,
    }

    makeEmptyBoard() {
        let board = [];
        for (let y = 0; y < this.rows; y++) {
            board[y] = [];
            for (let x = 0; x < this.cols; x++) {
                board[y][x] = false;
            }
        }

        return board;
    }

    getElementOffset() {
        const rect = this.boardRef.getBoundingClientRect();
        const doc = document.documentElement;

        return {
            x: (rect.left + window.scrollX) - doc.clientLeft,
            y: (rect.top + window.scrollY) - doc.clientTop,
        };
    }

    makeCells() {
        let cells = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) {
                    cells.push({ x, y });
                }
            }
        }

        return cells;
    }

    handleClick = (event) => {
        const elemOffset = this.getElementOffset();
        const offsetX = event.clientX - elemOffset.x;
        const offsetY = event.clientY - elemOffset.y;
        
        const x = Math.floor(offsetX / CELL_SIZE);
        const y = Math.floor(offsetY / CELL_SIZE);

        if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
            this.board[y][x] = !this.board[y][x];
        }

        this.setState({ cells: this.makeCells() });
    }

    runGame = () => {
        this.setState({ isRunning: true });
        this.runIteration();
    }

    stopGame = () => {
        this.setState({ isRunning: false });
        if (this.timeoutHandler) {
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    }

    runIteration() {
        let newBoard = this.makeEmptyBoard();

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let neighbors = this.calculateNeighbors(this.board, x, y);
                if (this.board[y][x]) {
                    if (neighbors === 2 || neighbors === 3) {
                        newBoard[y][x] = true;
                    } else {
                        newBoard[y][x] = false;
                    }
                } else {
                    if (!this.board[y][x] && neighbors === 3) {
                        newBoard[y][x] = true;
                    }
                }
            }
        }

        this.board = newBoard;
        this.setState({ cells: this.makeCells() });

        this.timeoutHandler = window.setTimeout(() => {
            this.runIteration();
        }, this.state.interval);
    }


    calculateNeighbors(board, x, y) {
        let neighbors = 0;
        const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
        for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            let y1 = y + dir[0];
            let x1 = x + dir[1];

            if (x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1]) {
                neighbors++;
            }
        }

        return neighbors;
    }

    handleIntervalChange = (event) => {
        this.setState({ interval: event.target.value });
    }

    handleClear = () => {
        this.board = this.makeEmptyBoard();
        this.setState({ cells: this.makeCells() });
        this.stopGame()
    }

    handleRandom = () => {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.board[y][x] = (Math.random() >= 0.6);
            }
        }

        this.setState({ cells: this.makeCells() });
    }

    componentDidMount(){

    }

    render() {
        const { cells, interval, isRunning } = this.state;
        return (
            <div className="flex flex-col items-center justify-center">
                <div className="Board"
                    style={{ width: WIDTH, height: HEIGHT, backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`}}
                    onClick={this.handleClick}
                    ref={(n) => { this.boardRef = n; }}>

                    {cells.map(cell => (
                        <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`}/>
                    ))}
                </div>
                <div className="flex flex-col items-center justify-center">
                    <section className="flex items-center justify-center mt-4">
                        {isRunning ?
                            <button onClick={this.stopGame}>
                                <PauseIcon></PauseIcon>
                                Stop
                            </button> :
                            <button onClick={this.runGame}>
                                <PlayIcon></PlayIcon>
                                Run
                            </button>
                        }

                        <button onClick={this.handleRandom} className="mx-6">
                            <RandomeIcon></RandomeIcon>
                            Random
                        </button>

                        <button onClick={this.handleClear}>
                            <DeleteIcon></DeleteIcon>
                            Clear
                        </button>
                    </section>
                    <section className="flex items-center justify-center mt-4">
                        <span className="flex flex-col w-32">
                            <span>Speed {interval}msec</span>
                            <input type="range"
                                min={0}
                                max={1000}
                                value={interval}
                                onChange={this.handleIntervalChange}
                                step={100}
                            />
                        </span>
                        
                    </section>
                </div>
            </div>
        );
    }
}


export default Game;