console.log("alive");

const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);

const gameEl = $("#game");

const gemProps = {
  color: {
    green: "GREEN",
    red: "RED",
    blue: "BLUE",
    yellow: "YELLOW",
    purple: "PURPLE",
  },
  getColors: () => Object.values(gemProps.color),
};

const SIZE = 12;

const clamp = (value, min, max) => {
  value = Math.floor(value);
  min = Math.floor(min);
  max = Math.floor(max);

  return value < min ? min : value > max ? max : value;
};

const getRandomItemFromArray = (array) => {
  const random = Math.floor(Math.random() * array.length);
  return array[random];
};

class Gem {
  constructor(color, position = 0) {
    this.color = this.getColor(color);
    this.position = position;
    this.selected = false;
    this.highlighted = false;
    this.matching = false;
  }

  getColor(color) {
    if (gemProps.getColors().includes(color.toUpperCase())) {
      return gemProps.color[color.toLowerCase()];
    }
    return gemProps.color.blue;
  }

  draw() {
    const gem = document.createElement("div");
    gem.classList.add(...["gem", this.color.toLowerCase()]);
    if (this.selected) {
      gem.classList.add("selected");
    }
    if (this.highlighted) {
      gem.classList.add("highlighted");
    }
    if (this.matching) {
      gem.classList.add("matching");
    }

    gem.id = `gem-${this.position}`;

    return gem;
  }
  highlight(bool) {
    this.highlighted = bool;
  }
  select(bool) {
    this.selected = bool;
  }
}
class Game {
  constructor(size, anchor) {
    this.size = size * size;
    this.gridSize = size;
    this.state = this.getState(size);
    this.anchor = this.getAnchor(anchor, size);
    this.selectedGem = -1;
    this.neighbors = null;
    this.columns = this.getColumns();
    this.rows = this.getRows();
  }

  getState() {
    // return stateMock;
    const state = [];
    let gemColorToAvoid = [];
    const checkMatchingGem = (gemsPool, gem, position, direction) => {
      const shouldGetNewGem = gemsPool.every((g) => g.color === gem.color);
      if (shouldGetNewGem) {
        gemColorToAvoid.push(gem.color);
        const gemsRoaster = gemProps
          .getColors()
          .filter((color) => !gemColorToAvoid.includes(color));

        const newGem = new Gem(getRandomItemFromArray(gemsRoaster), position);
        state[position] = newGem;
      }
    };

    const getGemsPool = (gem, position, direction = "horizontal") => {
      if (direction === "horizontal") {
        const row = this.getRows().find((row) => row.includes(gem.position));
        const positionRelativeToRow = row.indexOf(position);
        const positionInState = row[positionRelativeToRow];

        if (positionRelativeToRow > 1) {
          const gemsPool = [
            state[positionInState - 2],
            state[positionInState - 1],
            gem,
          ];

          return gemsPool;
        }
      }

      if (direction === "vertical") {
        const column = this.getColumns().find((column) =>
          column.includes(gem.position)
        );
        const positionRelativeToColumn = column.indexOf(position);
        const gemsPool = [
          state[column[positionRelativeToColumn - 2]],
          state[column[positionRelativeToColumn - 1]],
          gem,
        ];
        return gemsPool;
      }

      return null;
    };
    for (let position = 0; position < this.size; position++) {
      const shouldCheckInHorizontal = position > 1;
      const shouldCheckInVertical = position >= this.gridSize * 2;
      const gem = new Gem(
        getRandomItemFromArray(gemProps.getColors()),
        position
      );

      state.push(gem);
      gemColorToAvoid = [];

      //shouldGetNewGem in horizontal direction
      if (shouldCheckInHorizontal) {
        const gemsPool = getGemsPool(gem, position);

        if (gemsPool) {
          checkMatchingGem(gemsPool, gem, position, "vertical");
        }
      }
      //shouldGetNewGem in vertical direction
      if (shouldCheckInVertical) {
        const gemsPool = getGemsPool(gem, position, "vertical");

        checkMatchingGem(gemsPool, gem, position, "vertical");
      }
    }
    return state;
  }

  getAnchor(anchor) {
    anchor.style = `--columns: ${this.gridSize}`;
    return anchor;
  }

  setSelectedGem(index) {
    this.selectedGem = index;
    this.state.forEach((gem, idx) => gem.select(index === idx));
  }

  findNeighbors(gem) {
    const gemPosition = Number(gem.position);
    let top = gemPosition - this.gridSize;
    let right = gemPosition + 1;
    let bottom = gemPosition + this.gridSize;
    let left = gemPosition - 1;

    if (top < 0) {
      top = null;
    }
    if (left < 0 || gemPosition % this.gridSize === 0) {
      left = null;
    }
    if (right % this.gridSize === 0 || right > this.size) {
      right = null;
    }
    if (bottom >= this.size) {
      bottom = null;
    }

    const horizontal = [left, right];
    const vertical = [top, bottom];
    const hasNeighborsVertically = vertical.every(
      (neighbor) => neighbor !== null
    );
    const hasNeighborsHorizontally = horizontal.every(
      (neighbor) => neighbor !== null
    );

    return {
      top,
      right,
      bottom,
      left,
      horizontal,
      vertical,
      hasNeighborsHorizontally,
      hasNeighborsVertically,
    };
  }

  setNeighbors({ top, right, bottom, left }) {
    this.neighbors = { top, right, bottom, left };
    this.highlightNeighbors();
  }

  highlightNeighbors() {
    for (let gem of this.state) {
      gem.highlighted = Object.values(this.neighbors).includes(gem.position);
    }

    this.draw();
  }

  draw() {
    this.anchor.innerHTML = "";
    for (let gem of this.state) {
      const gemEl = gem.draw();
      gemEl.addEventListener("click", () => {
        const alreadySelected = this.selectedGem === gem.position;
        if (alreadySelected) {
          for (let gem of this.state) {
            gem.select(false);
            gem.highlight(false);
            this.selectedGem = -1;
          }
        } else {
          console.log({ position: gem.position, color: gem.color });
          this.setSelectedGem(gem.position);
          const neighbors = this.findNeighbors(gem);
          this.setNeighbors(neighbors);
        }
      });
      this.anchor.appendChild(gemEl);
    }
  }

  getColumns() {
    const firstColumn = new Array(this.gridSize)
      .fill()
      .map((_, index) => index * this.gridSize);

    const columns = new Array(this.gridSize)
      .fill()
      .map((_, index) => firstColumn.map((column) => column + index));

    return columns;
  }

  getRows() {
    const rows = new Array(this.gridSize)
      .fill()
      .map((_, index) =>
        new Array(this.gridSize)
          .fill()
          .map((_, xedni) => index * this.gridSize + xedni)
      );

    return rows;
  }

  getGemPosition(index) {
    const column = this.columns.indexOf(
      this.columns.find((column) => column.includes(index))
    );
    const row = this.rows.indexOf(this.rows.find((row) => row.includes(index)));

    return { column, row };
  }

  isMatching(pool, gem) {
    const gems = pool.map((index) => this.state[index]);
    return gems.map((gem) => gem.color).every((color) => color === gem.color);
  }

  update() {
    for (let index in this.state) {
      const gem = this.state[index];
      const {
        horizontal,
        vertical,
        hasNeighborsHorizontally,
        hasNeighborsVertically,
      } = this.findNeighbors(gem);

      if (hasNeighborsVertically) {
        if (this.isMatching(vertical, gem)) {
          gem.matching = true;
          vertical.forEach((postion) => (this.state[postion].matching = true));
        }
      }

      if (hasNeighborsHorizontally) {
        if (this.isMatching(horizontal, gem)) {
          gem.matching = true;
          horizontal.forEach(
            (postion) => (this.state[postion].matching = true)
          );
        }
      }
    }
    // console.table(this.state);
    this.draw();
  }
}

const stateMock = [
  {
    color: "GREEN",
    index: 0,
    selected: false,
    highlighted: false,
  },
  {
    color: "GREEN",
    index: 1,
    selected: false,
    highlighted: false,
  },
  {
    color: "GREEN",
    index: 2,
    selected: false,
    highlighted: false,
  },
  {
    color: "YELLOW",
    index: 3,
    selected: false,
    highlighted: false,
  },
  {
    color: "GREEN",
    index: 4,
    selected: false,
    highlighted: false,
  },
  {
    color: "RED",
    index: 5,
    selected: false,
    highlighted: false,
  },
  {
    color: "GREEN",
    index: 6,
    selected: false,
    highlighted: false,
  },
  {
    color: "YELLOW",
    index: 7,
    selected: false,
    highlighted: false,
  },
  {
    color: "BLUE",
    index: 8,
    selected: false,
    highlighted: false,
  },
  {
    color: "PURPLE",
    index: 9,
    selected: false,
    highlighted: false,
  },
  {
    color: "RED",
    index: 10,
    selected: false,
    highlighted: false,
  },
  {
    color: "YELLOW",
    index: 11,
    selected: false,
    highlighted: false,
  },
  {
    color: "PURPLE",
    index: 12,
    selected: false,
    highlighted: false,
  },
  {
    color: "YELLOW",
    index: 13,
    selected: false,
    highlighted: false,
  },
  {
    color: "GREEN",
    index: 14,
    selected: false,
    highlighted: false,
  },
  {
    color: "YELLOW",
    index: 15,
    selected: false,
    highlighted: false,
  },
].map((gem, index) => new Gem(gem.color, index));

const game = new Game(SIZE, gameEl);

game.update();
