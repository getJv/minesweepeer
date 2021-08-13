Minesweepeer Game Code Interview


## Solution description

Minesweepeer was an interview code test, where I built a game only using javascript. That was amazing! || interview-test; JavaScript;



## How to run

1. Checkout the project from git
2. Open the index file using a browser
3. Enjoy!

## Test Requirements checklist

General Gameplay Requirements

1. ✅  Users must be able to choose from three difficulties: Easy, Medium, and Hard.
  Easy - 9x9 grid, 10 mines.
  Medium - 16x16 grid, 40 mines.
  Hard - 30x16 grid, 99 mines.

2. ✅  Adjacent is defined by the 8 tiles surrounding the target tile, on the diagonal, horizontal, and vertical planes. 

3. ✅  A left click must reveal a tile, if not flagged.
4. ✅  A right click must flag a tile or unflag a tile if already flagged.
5. ✅  A middle click must reveal all hidden, unflagged, and adjacent tiles
  This only works if: 
      1. The tile clicked on is revealed.
      2. The tile clicked on has a number on it. 
      3. The number of adjacent flags matches the number on the tile clicked on.

6. ✅  A tile will not be revealed by any means (middle click or left click) if the tile is flagged.

7. ✅  A revealed tile will display a number indicating how many mines it is adjacent to. CSS classes and images are provided for this.

8. ✅  If a tile is revealed and is not adjacent to any mines, it will reveal all adjacent tiles. This includes adjacent tiles with numbers on them.

9. ✅  The first tile clicked must not be a mine, nor adjacent to a mine. In other words it will have no number to display.

10. ✅  A timer will keep track of the how long the user has been playing. It begins ticking once the first tile is revealed.
  This is essentially the player score.

11. ✅  A counter will show how many mines are left, relative to the number of flags planted.
  This is calculated by: mines_left = (total_mines - flags_planted)
  It is not a 'true' measure of mines left.

12. ✅  When a player is actively playing and the mouse is down: the smiley will be in limbo (face_limbo).

End Game Conditions
13. ✅  When all of the non-mine tiles are revealed the game is over. A player does not need to flag all of the mines to win.
  [DONE] - You must display the user's completion time as well as congratulate them on their victory.
  [DONE] - The smiley will wear sunglasses when the player wins.
14. ✅   When a player reveals a mine, the game is over.
  [DONE] - You must inform the player they have lost.
  [DONE] - The smiley will play dead when the player loses. 
