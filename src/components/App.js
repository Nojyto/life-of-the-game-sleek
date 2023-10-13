import React from "react";
import GameDisplay from "./GameDisplay"

export default function App() {
    return (
        <div className="flex flex-col items-center justify-center">
            <header className="flex flex-col items-center justify-center h-24 w-full">
                <h1 className="text-2xl" >Conway's Game of Life</h1>
            </header>
            <GameDisplay></GameDisplay>
        </div>
    );
}
