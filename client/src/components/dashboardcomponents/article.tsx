import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';

export default function Article() {
    const markdownContent = `
# Master Chessboard Fundamentals and Piece Movements

## Chessboard Layout:
The chessboard consists of 64 squares arranged in an 8x8 grid with alternating light and dark squares. The columns are called files (labeled a-h), and the rows are called ranks (labeled 1-8).

### Piece Movements:
- **Pawn**: Moves forward one square but captures diagonally. On its first move, a pawn can move two squares forward.
- **Rook**: Moves any number of squares horizontally or vertically.
- **Bishop**: Moves diagonally any number of squares.
- **Knight**: Moves in an "L" shape: two squares in one direction and then one perpendicular square. The knight is the only piece that can jump over others.
- **Queen**: Combines the powers of the rook and bishop, moving any number of squares horizontally, vertically, or diagonally.
- **King**: Moves one square in any direction. Protecting the king is critical because checkmate ends the game.

---

## Understand Rules like Check, Checkmate, Castling, En Passant

### Check:
Occurs when a king is under threat of capture on the next turn. The player must respond by moving the king, blocking the attack, or capturing the attacking piece.

### Checkmate:
A situation where the king is in check and has no legal move to escape, ending the game.

### Castling:
A special defensive move involving the king and one rook. The king moves two squares toward the rook, and the rook jumps over to the square next to the king.

Conditions:
1. Neither the king nor the rook has moved.
2. The squares between the king and rook are unoccupied.
3. The king cannot be in check, pass through check, or end in check.

### En Passant:
A special pawn capture. If a pawn moves two squares forward from its starting position and lands beside an opponent’s pawn, the opponent can capture it as if it had moved one square forward. This must be done immediately on the next turn.

---

## Learn Key Tactics: Forks, Pins, Skewers

### Fork:
A single piece (often a knight) attacks two or more of the opponent’s pieces simultaneously, forcing them to lose material.

_Example_: A knight moves to a square where it can attack both the opponent’s queen and rook at the same time.

### Pin:
A piece cannot move without exposing a more valuable piece (often the king) behind it to an attack.

_Example_: A bishop pins a knight to the opponent’s king, preventing the knight from moving.

### Skewer:
The reverse of a pin, where a valuable piece is attacked, forcing it to move and revealing a less valuable piece behind it.

_Example_: A rook attacks a queen, and once the queen moves, a lower-value piece like a bishop is exposed.

---

## Discover Checkmate Patterns and Practice with Puzzles

### Basic Checkmate Patterns:

- **Back-Rank Checkmate**: Occurs when the opponent’s king is trapped on the back rank (usually the 8th rank) by its own pawns, and a rook or queen delivers the checkmate by controlling the entire rank.
- **King and Queen vs. King**: The stronger side uses the queen and king to force the opposing king to the edge of the board, where it is checkmated.
- **King and Rook vs. King**: The rook forces the opposing king to the edge or corner of the board, and the king helps deliver checkmate.
- **Two Rooks vs. King**: The two rooks work together to trap and checkmate the opposing king.

### Puzzles:
Chess puzzles are designed to improve your tactical vision and checkmate skills by setting up specific scenarios that force you to deliver a checkmate or win material in a set number of moves. Practicing puzzles helps reinforce understanding of key checkmate patterns and tactics.
    `;

    return (
        <div>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdownContent}
            </ReactMarkdown>
        </div>
    );
}
