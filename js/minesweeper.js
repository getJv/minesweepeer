let time = 0;
const GAME_STONES = {
  ELEMENT_CANVAS_NAME: 'minefield',
  DIFFICULT_ELEMENT: 'difficulty',
  MODE_EASY: { columns: 9, rows: 9, mines: 10 },
  MODE_MEDIUM: { columns: 16, rows: 16, mines: 40 },
  MODE_HARD: { columns: 30, rows: 16, mines: 99 },
};

const GAME_SPRITES = {
  HIDDEN: 'hidden',
  FLAG: 'flag',
  TILE_NUMBER_PREFIX: 'tile_',
  MINE_HIT: 'mine',
};

let GAME_SETTINGS = {
  MODE_SELECTED: GAME_STONES.MODE_EASY,
  MINED_TILES: [],
};

let GAME_ENTITIES = {
  getCanvas: () => document.getElementById(GAME_STONES.ELEMENT_CANVAS_NAME),
  getGridTiles: () => GAME_ENTITIES.getCanvas().children,
  getGridTile: index => GAME_ENTITIES.getCanvas().children[index],
};

function _getRandomNumber(max, min = 0) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Clean up HMTL element name
 *
 * @param string html_element_name
 * @returns HTML element
 */
function _gridCleanUp() {
  let grid = GAME_ENTITIES.getCanvas();
  grid.innerHTML = '';
}
function _gridBuilder() {
  var grid = GAME_ENTITIES.getCanvas();
  let { columns, rows } = GAME_SETTINGS.MODE_SELECTED;
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
  let { columns, rows } = GAME_SETTINGS.MODE_SELECTED;
  grid.style.width = columns * width + 'px';
  grid.style.height = rows * height + 'px';
}
function _gridMinesGenerate() {
  let gridTiles = GAME_ENTITIES.getGridTiles();
  let { mines: mineQuantity } = GAME_SETTINGS.MODE_SELECTED;
  while (GAME_SETTINGS.MINED_TILES.length < mineQuantity) {
    let index = _getRandomNumber(gridTiles.length);
    if (!GAME_SETTINGS.MINED_TILES.includes(index)) {
      GAME_SETTINGS.MINED_TILES.push(GAME_SPRITES.TILE_NUMBER_PREFIX + index);
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
  var tile = document.createElement('div');

  tile.classList.add('tile');
  tile.classList.add('hidden');

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
  //startTimer();
}

function smileyDown() {
  var smiley = document.getElementById('smiley');
  smiley.classList.add('face_down');
}

function smileyUp() {
  var smiley = document.getElementById('smiley');
  smiley.classList.remove('face_down');
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
  let isMined = GAME_SETTINGS.MINED_TILES.includes(tile.id);
  let nearMines = 0;
  _getNeighbors(tile).forEach(neighbor => {
    if (GAME_SETTINGS.MINED_TILES.includes(neighbor.id)) {
      nearMines++;
    }
  });
  return { isFlagged, isHidden, isMined, nearMines };
}
function _revealTile(tile) {
  let { isFlagged, isHidden, isMined, nearMines } = _getTileStatuses(tile);
  if (!isHidden || isFlagged) {
    return;
  }
  if (isMined) {
    tile.classList.add(GAME_SPRITES.MINE_HIT);
  } else if (nearMines > 0) {
    tile.classList.add(GAME_SPRITES.TILE_NUMBER_PREFIX + nearMines);
  }
  tile.classList.remove(GAME_SPRITES.HIDDEN);
}

function handleTileClick(event) {
  // Left Click
  if (event.which === 1) {
    let tile = event.currentTarget;
    _revealTile(tile);
  }
  // Middle Click
  else if (event.which === 2) {
    let tile = event.currentTarget;
    let neighbors = _getNeighbors(tile);
    neighbors.push(tile);
    neighbors.forEach(neighbor => {
      _revealTile(neighbor);
    });
  }
  // Right Click
  else if (event.which === 3) {
    let tile = event.currentTarget;
    let { isFlagged, isHidden } = _getTileStatuses(tile);
    if (!isHidden) {
      return;
    }
    if (!isFlagged) {
      tile.classList.add(GAME_SPRITES.FLAG);
    } else {
      tile.classList.remove(GAME_SPRITES.FLAG);
    }
  }
}

/**
 * Update game difficult
 */
function setDifficulty() {
  var difficultyFieldName = GAME_STONES.DIFFICULT_ELEMENT;
  var difficultySelector = document.getElementById(difficultyFieldName);
  var difficulty = difficultySelector.value;
  GAME_SETTINGS.MODE_SELECTED = GAME_STONES[difficulty];
}

function startTimer() {
  timeValue = 0;
  window.setInterval(onTimerTick, 1000);
}

function onTimerTick() {
  timeValue++;
  updateTimer();
}

function updateTimer() {
  document.getElementById('timer').innerHTML = timeValue;
}
