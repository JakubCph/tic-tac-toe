import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

  function Square(props){
    return (
      <button className={props.isWinning ? 'square winning' : 'square'} 
              onClick={props.onClick}>
        {props.value}
      </button>
    );
  }

  class Board extends React.Component {
    static size = 3;

    isWinningSquare(winningIndexes, index){
      if(winningIndexes){
        return winningIndexes.includes(index);
      }
      return false;
    }

    renderSquare(i) {
      return (
        <Square 
          key={i}
          value={this.props.squares[i]}
          isWinning={this.isWinningSquare(this.props.winningSquares, i)}
          onClick= {() => this.props.onClick(i)}
        />
      );
    }
  
    render() {
      const squares = [];
      for(let col = 0; col < Board.size; col++){
        for(let row = 0; row < Board.size; row++){
          squares.push(this.renderSquare(Board.size * col + row));
        }
      }

      return (
        <div>
          <div className="board-row">
            {squares.slice(0, Board.size)}
          </div>
          <div className="board-row">
            {squares.slice(Board.size, 2 * Board.size)}
          </div>
          <div className="board-row">
            {squares.slice(2 * Board.size, 3 * Board.size)}
          </div>
        </div>
      );
    }
  }
  
  class Game extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        history: [{
          squares: Array(9).fill(null),
          location: {
            col:-1,
            row:-1
          }
        }],
        xIsNext:true,
        stepNumber:0,
        firstStepOldest:true
      }
    }

    jumpTo(stepNumber){
      this.setState({
        stepNumber,
        xIsNext: (stepNumber % 2) === 0
      });
    }

    handleClick(i){
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      if(calculateWinner(squares) || squares[i]){
        return;
      }
      squares[i] = this.state.xIsNext ? 'X' : 'O';
      this.setState({
          history: history.concat([{
            squares:squares,
            location:{
              col: (i % 3) + 1,
              row: Math.floor(i / 3) + 1
            }
          }]),
          xIsNext: !this.state.xIsNext,
          stepNumber: history.length
      });

    }

    toggleOrder(){
      this.setState({
        firstStepOldest: !this.state.firstStepOldest
      });
    }

    render() {
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const winningSquares = calculateWinningSquares(current.squares);
      const winner = calculateWinner(current.squares);

      const moves = history.map((step, stepNumber) =>
      {
        let description = stepNumber ? 
          `Go to move #${stepNumber}, location: (${step.location.col}:${step.location.row})`:  
          'Go to game start';
        return (
        <li key={stepNumber}>
          <button 
            className={this.state.stepNumber === stepNumber ? 'selected' : ''}
            onClick={
              ()=>this.jumpTo(stepNumber)
            }
          >
            {description}
          </button>
        </li>      
        );
      });

      let status;
      if(winner){
        status = `Winner: ${winner}`;
      } else {
        status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
      }

      return (
        <div className="game">
          <div className="game-board">
            <Board 
              squares={current.squares}
              winningSquares={winningSquares}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <button onClick={() => this.toggleOrder()}>Toggle moves order</button>
            <div>{status}</div>
            <ol>{this.state.firstStepOldest ? moves : moves.reverse()}</ol>
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  
  // helper method 
  function calculateWinner(squares) {
    const winningSquares = calculateWinningSquares(squares);
    return winningSquares ? squares[winningSquares[0]] : null;
  }

  function calculateWinningSquares(squares){
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return lines[i].slice(0);
      }
    }
    return null;
  }