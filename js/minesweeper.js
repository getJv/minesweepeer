const GAME_STONES = {
  ELEMENT_CONTAINER: 'div',
  ELEMENT_CANVAS_NAME: 'minefield',
  ELEMENT_DIFFICULT_NAME: 'difficulty',
  ELEMENT_FLAG_COUNT_NAME: 'flagCount',
  ELEMENT_TIMER_NAME: 'timer',
  ELEMENT_SMILE_NAME: 'smiley',
  TIME_MS: 1000,
  MODE_EASY: { columns: 9, rows: 9, mines: 10 },
  MODE_MEDIUM: { columns: 16, rows: 16, mines: 40 },
  MODE_HARD: { columns: 30, rows: 16, mines: 99 },
};

const GAME_SPRITES = {
  SIZE_UNIT: 'px',
  HIDDEN: 'hidden',
  FLAG: 'flag',
  TILE: 'tile',
  TILE_NUMBER_PREFIX: 'tile_',
  HIDDEN: 'hidden',
  MINE_HIT: 'mine_hit',
  FACE_LIMBO: 'face_limbo',
  FACE_DOWN: 'face_down',
  FACE_LOSE: 'face_lose',
  FACE_WIN: 'face_win',
};

let GAME_SESSION = {
  MODE_SELECTED: GAME_STONES.MODE_EASY,
  MINED_TILES: [],
  STARTED: false,
  TIMER_ID: null,
  TIMER_INTERVAL: 0,
  MINES_PLANTED: 0,
  FLAGS_PLANTED: 0,
  TILES_REVEALED: [],
};

let GAME_ENTITIES = {
  getCanvas: () => _getElement(GAME_STONES.ELEMENT_CANVAS_NAME),
  getDifficult: () => _getElement(GAME_STONES.ELEMENT_DIFFICULT_NAME),
  getTimeField: () => _getElement(GAME_STONES.ELEMENT_TIMER_NAME),
  getSmiley: () => _getElement(GAME_STONES.ELEMENT_SMILE_NAME),
  getMinesLeftField: () => _getElement(GAME_STONES.ELEMENT_FLAG_COUNT_NAME),
  getGridTiles: () => GAME_ENTITIES.getCanvas().children,
  getGridTile: index => GAME_ENTITIES.getCanvas().children[index],
  getGameOverMessage: () =>
    `<h3>Game Over</h3><h5>Score: ${GAME_SESSION.TIMER_INTERVAL} </h5>`,
  getWinnerMessage: () =>
    `<h3>You Dit it!</h3><h5>Score: ${GAME_SESSION.TIMER_INTERVAL} </h5>`,
};

function _getElement(element_name) {
  return document.getElementById(element_name);
}
function _getRandomNumber(max, min = 0) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function _gridCleanUp() {
  if (GAME_SESSION.STARTED) {
    GAME_SESSION.STARTED = false;
    clearInterval(GAME_SESSION.TIMER_ID);
    GAME_SESSION.TIMER_INTERVAL = 0;
  }
  updateTimer();
  let { mines } = GAME_SESSION.MODE_SELECTED;
  GAME_SESSION.MINES_PLANTED = mines;
  GAME_SESSION.TILES_REVEALED = [];
  GAME_SESSION.FLAGS_PLANTED = 0;
  let grid = GAME_ENTITIES.getCanvas();
  grid.innerHTML = '';
  updateMinesCounter();
}
function _gridBuilder() {
  var grid = GAME_ENTITIES.getCanvas();
  let { columns, rows } = GAME_SESSION.MODE_SELECTED;
  let tile;
  let index = 0;
  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < columns; x++) {
      tile = createTile(x, y);
      tile.id = `${GAME_SPRITES.TILE_NUMBER_PREFIX}${index++}`;
      grid.appendChild(tile);
    }
  }
  return tile;
}
function _gridModeler() {
  let tile = GAME_ENTITIES.getGridTile(0);
  let style = window.getComputedStyle(tile);
  let width = parseInt(style.width.slice(0, -2));
  let height = parseInt(style.height.slice(0, -2));
  let grid = GAME_ENTITIES.getCanvas();
  let { columns, rows } = GAME_SESSION.MODE_SELECTED;
  grid.style.width = columns * width + GAME_SPRITES.SIZE_UNIT;
  grid.style.height = rows * height + GAME_SPRITES.SIZE_UNIT;
}
function _gridMinesGenerate() {
  GAME_SESSION.MINED_TILES = [];
  let gridTiles = GAME_ENTITIES.getGridTiles();
  let { mines: mineQuantity } = GAME_SESSION.MODE_SELECTED;
  GAME_SESSION.MINES_PLANTED = mineQuantity;
  while (GAME_SESSION.MINED_TILES.length < mineQuantity) {
    let index = _getRandomNumber(gridTiles.length);
    if (!GAME_SESSION.MINED_TILES.includes(index)) {
      GAME_SESSION.MINED_TILES.push(GAME_SPRITES.TILE_NUMBER_PREFIX + index);
    }
  }
}
function buildGrid() {
  _gridCleanUp();
  _gridBuilder();
  _gridModeler();
  _gridMinesGenerate();
}
function createTile(x, y) {
  var tile = document.createElement(GAME_STONES.ELEMENT_CONTAINER);
  tile.classList.add(GAME_SPRITES.TILE);
  tile.classList.add(GAME_SPRITES.HIDDEN);

  tile.addEventListener('auxclick', function (e) {
    e.preventDefault();
  }); // Middle Click
  tile.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  }); // Right Click
  tile.addEventListener('mouseup', handleTileClick); // All Clicks

  return tile;
}
function startGame() {
  buildGrid();
  smileyLimbo();
}
function smileyDown() {
  var smiley = GAME_ENTITIES.getSmiley();
  smiley.classList.add(GAME_SPRITES.FACE_DOWN);
}
function smileyLose() {
  var smiley = GAME_ENTITIES.getSmiley();
  smiley.classList.add(GAME_SPRITES.FACE_LOSE);
}
function smileyUp() {
  var smiley = GAME_ENTITIES.getSmiley();
  smiley.classList.remove(GAME_SPRITES.FACE_DOWN);
}
function smileyWin() {
  var smiley = GAME_ENTITIES.getSmiley();
  smiley.classList.remove(GAME_SPRITES.FACE_LIMBO);
  smiley.classList.add(GAME_SPRITES.FACE_WIN);
}
function smileyLimbo() {
  var smiley = GAME_ENTITIES.getSmiley();
  smiley.classList.remove(GAME_SPRITES.FACE_LOSE);
  smiley.classList.remove(GAME_SPRITES.FACE_WIN);
  smiley.classList.add(GAME_SPRITES.FACE_LIMBO);
}
function _getNeighbors(tile) {
  let me = tile.getBoundingClientRect();
  let midWidth = me.width / 2;
  let midHeight = me.width / 2;

  let leftX = me.left - midWidth;
  let leftY = me.top + midHeight;
  let left = document.elementFromPoint(leftX, leftY);

  let rightX = me.right + midWidth;
  let rightY = me.top + midHeight;
  let right = document.elementFromPoint(rightX, rightY);

  let topX = me.left + midWidth;
  let topY = me.top - midHeight;
  let top = document.elementFromPoint(topX, topY);

  let bottomX = me.left + midWidth;
  let bottomY = me.bottom + midHeight;
  let bottom = document.elementFromPoint(bottomX, bottomY);

  let topRightX = me.right + midWidth;
  let topRightY = me.top - midHeight;
  let topRight = document.elementFromPoint(topRightX, topRightY);

  let topLeftX = me.left - midWidth;
  let topLeftY = me.top - midHeight;
  let topLeft = document.elementFromPoint(topLeftX, topLeftY);

  let bottomLeftX = me.left - midWidth;
  let bottomLeftY = me.top + me.height;
  let bottomLeft = document.elementFromPoint(bottomLeftX, bottomLeftY);

  let bottomRightX = me.right + midWidth;
  let bottomRightY = me.top + me.height;
  let bottomRight = document.elementFromPoint(bottomRightX, bottomRightY);

  return [top, left, bottom, right, topLeft, bottomLeft, bottomRight, topRight];
}
function _getTileStatuses(tile) {
  let isFlagged = tile.classList.contains(GAME_SPRITES.FLAG);
  let isHidden = tile.classList.contains(GAME_SPRITES.HIDDEN);
  let isMined = GAME_SESSION.MINED_TILES.includes(tile.id);
  let nearMines = 0;
  _getNeighbors(tile).forEach(neighbor => {
    if (neighbor && GAME_SESSION.MINED_TILES.includes(neighbor.id)) {
      nearMines++;
    }
  });
  return { isFlagged, isHidden, isMined, nearMines };
}
function gameOver() {
  GAME_SESSION.STARTED = false;
  let grid = GAME_ENTITIES.getCanvas();
  smileyLose();
  grid.innerHTML += GAME_ENTITIES.getGameOverMessage();
}
function gameWin() {
  if (!GAME_SESSION.STARTED) return;
  let { columns, rows, mines } = GAME_SESSION.MODE_SELECTED;
  let freeTiles = columns * rows - mines;
  let isWinner = freeTiles === GAME_SESSION.TILES_REVEALED.length;
  if (isWinner) {
    GAME_SESSION.STARTED = false;
    let grid = GAME_ENTITIES.getCanvas();
    smileyWin();
    grid.innerHTML += GAME_ENTITIES.getWinnerMessage();
  }
}
function easyStartNeeded(isMined, nearMines) {
  return GAME_SESSION.TILES_REVEALED.length === 0 && (isMined || nearMines > 0);
}
function _revealTile(tile, rootId) {
  startTimerManager();
  let { isFlagged, isHidden, isMined, nearMines } = _getTileStatuses(tile);
  if (isFlagged) {
    return;
  }
  if (easyStartNeeded(isMined, nearMines)) {
    do {
      _gridMinesGenerate();
      reloadedStatus = _getTileStatuses(tile);
    } while (easyStartNeeded(reloadedStatus.isMined, reloadedStatus.nearMines));
  } else {
    if (isMined && tile.id === rootId) {
      tile.classList.add(GAME_SPRITES.MINE_HIT);
      gameOver();
      return;
    } else if (isHidden && nearMines === 0) {
      tile.classList.remove(GAME_SPRITES.HIDDEN);
      _getNeighbors(tile).forEach(nt => _revealTile(nt, rootId));
    } else if (nearMines > 0) {
      tile.classList.add(GAME_SPRITES.TILE_NUMBER_PREFIX + nearMines);
    }

    gameWin();
  }
  tileRevealedCounter(tile);
}
function tileRevealedCounter(tile) {
  tile.classList.remove(GAME_SPRITES.HIDDEN);
  if (!GAME_SESSION.TILES_REVEALED.includes(tile.id)) {
    GAME_SESSION.TILES_REVEALED.push(tile.id);
  }
}
function handleTileClick(event) {
  let tile = event.currentTarget;
  // Left Click
  if (event.which === 1) {
    _revealTile(tile, tile.id);
  }
  // Middle Click
  else if (event.which === 2) {
    let { isFlagged, isHidden, isMined, nearMines } = _getTileStatuses(tile);
    if (isHidden || nearMines == 0) {
      return;
    }
    let neighbors = _getNeighbors(tile);
    neighbors.push(tile);
    neighbors.forEach(neighbor => {
      _revealTile(neighbor, neighbor.id);
    });
  }
  // Right Click
  else if (event.which === 3) {
    let { isFlagged, isHidden } = _getTileStatuses(tile);
    if (!isHidden) {
      return;
    }
    if (!isFlagged) {
      tile.classList.add(GAME_SPRITES.FLAG);
      GAME_SESSION.FLAGS_PLANTED++;
    } else {
      tile.classList.remove(GAME_SPRITES.FLAG);
      GAME_SESSION.FLAGS_PLANTED--;
    }
  }
  updateMinesCounter();
}
function setDifficulty() {
  var difficultyField = GAME_ENTITIES.getDifficult();
  var difficulty = difficultyField.value;
  GAME_SESSION.MODE_SELECTED = GAME_STONES[difficulty];
  updateMinesCounter();
}
function startTimerManager() {
  if (!GAME_SESSION.STARTED) {
    GAME_SESSION.STARTED = true;
    GAME_SESSION.TIMER_INTERVAL = 0;
    GAME_SESSION.TIMER_ID = window.setInterval(
      onTimerTick,
      GAME_STONES.TIME_MS
    );
  }
}
function onTimerTick() {
  GAME_SESSION.TIMER_INTERVAL++;
  updateTimer();
}
function updateTimer() {
  if (!GAME_SESSION.STARTED) {
    return;
  }
  let timeField = GAME_ENTITIES.getTimeField();
  timeField.innerHTML = GAME_SESSION.TIMER_INTERVAL;
}
function updateMinesCounter() {
  let MinesLeftField = GAME_ENTITIES.getMinesLeftField();
  let minesLeft = GAME_SESSION.MINES_PLANTED - GAME_SESSION.FLAGS_PLANTED;
  MinesLeftField.innerHTML = minesLeft >= 0 ? minesLeft : 0;
}
