console.log("alive");

const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);

const gameEl = $("#game");

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
    this.columns = size;
    this.state = this.getState(size);
    this.anchor = this.getAnchor(anchor, size);
    this.selectedGem = -1;
    this.neighbors = null;
  }

  getState() {
    return new Array(this.size)
      .fill()
      .map(
        (_, index) =>
          new Gem(getRandomItemFromArray(gemProps.getColors()), index)
      );
  }

  getAnchor(anchor) {
    anchor.style = `--columns: ${this.columns}`;
    return anchor;
  }

  setSelectedGem(index) {
    this.selectedGem = index;
    this.state.forEach((gem, idx) => gem.select(index === idx));
  }

  findNeighbors() {
    let top = this.selectedGem - this.columns;
    let right = this.selectedGem + 1;
    let bottom = this.selectedGem + this.columns;
    let left = this.selectedGem - 1;

    if (top < 0) {
      top = null;
    }
    if (left < 0 || this.selectedGem % this.columns === 0) {
      left = null;
    }
    if (right % this.columns === 0 || right > this.size) {
      right = null;
    }
    if (bottom >= this.size) {
      bottom = null;
    }
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
          this.findNeighbors();
        }
      });
      this.anchor.appendChild(gemEl);
    }
  }
}

const game = new Game(4, gameEl);

game.draw();

setInterval(() => {
  game.draw();
}, 300);
