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

class Gem {
  constructor(color, index = 0) {
    this.color = this.getColor(color);
    this.index = index;
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

    gem.id = `gem-${this.index}`;

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
    return new Array(this.size)
      .fill()
      .map(
        (_, index) =>
          new Gem(getRandomItemFromArray(gemProps.getColors()), index)
      );
  }

  getAnchor(anchor) {
    anchor.style = `--columns: ${this.gridSize}`;
    return anchor;
  }

  setSelectedGem(index) {
    this.selectedGem = index;
    this.state.forEach((gem, idx) => gem.select(index === idx));
  }

  findNeighbors(gemIndex) {
    gemIndex = Number(gemIndex);
    let top = gemIndex - this.gridSize;
    let right = gemIndex + 1;
    let bottom = gemIndex + this.gridSize;
    let left = gemIndex - 1;

    if (top < 0) {
      top = null;
    }
    if (left < 0 || gemIndex % this.gridSize === 0) {
      left = null;
    }
    if (right % this.gridSize === 0 || right > this.size) {
      right = null;
    }
    if (bottom >= this.size) {
      bottom = null;
    }
    return { top, right, bottom, left };
  }

  setNeighbors({ top, right, bottom, left }) {
    this.neighbors = { top, right, bottom, left };
    this.highlightNeighbors();
  }

  highlightNeighbors() {
    const neighbors = Object.values(this.neighbors).filter(
      (index) => index !== null
    );

    this.state.forEach((gem, index) =>
      gem.highlight(neighbors.includes(index))
    );
  }

  draw() {
    this.anchor.innerHTML = "";
    for (let gem of this.state) {
      const gemEl = gem.draw();
      gemEl.addEventListener("click", () => {
        const alreadySelected = this.selectedGem === gem.index;
        if (alreadySelected) {
          for (let gem of this.state) {
            gem.select(false);
            gem.highlight(false);
            this.selectedGem = -1;
          }
        } else {
          console.log({ selectedGem: gem.index });
          this.setSelectedGem(gem.index);
          const neighbors = this.findNeighbors(gem.index);
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

  update() {
    for (let index in this.state) {
      const gem = this.state[index];
      const neighbors = this.findNeighbors(index);
      const { top, bottom, right, left } = neighbors;
      const horizontal = [left, right];
      const vertical = [top, bottom];
      const hasNeighborsVertically = vertical.every(
        (neighbor) => neighbor !== null
      );
      const hasNeighborsHorizontally = horizontal.every(
        (neighbor) => neighbor !== null
      );

      const isMatching = (pool) => {
        const gems = pool.map((index) => this.state[index]);
        return gems
          .map((gem) => gem.color)
          .every((color) => color === gem.color);
      };

      if (hasNeighborsVertically) {
        if (isMatching(vertical)) {
          gem.matching = true;
          vertical.forEach((postion) => (this.state[postion].matching = true));
        }
      }

      if (hasNeighborsHorizontally) {
        if (isMatching(horizontal)) {
          gem.matching = true;
          horizontal.forEach(
            (postion) => (this.state[postion].matching = true)
          );
        }
      }
    }
    console.table(this.state);
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

const game = new Game(8, gameEl);

game.update();
