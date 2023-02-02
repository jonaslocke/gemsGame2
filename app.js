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
  constructor(color) {
    this.color = this.getColor(color);
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

    return gem;
  }
}
class GameState {
  constructor(size = 4, anchor) {
    this.state = this.getState(size);
    this.anchor = this.getAnchor(anchor, size);
  }
  getState(size) {
    const max = Math.floor(size / 4) * 4;
    size = clamp(size, 4, max);

    return new Array(size)
      .fill()
      .map((_) => new Gem(getRandomItemFromArray(gemProps.getColors())));
  }

  getAnchor(anchor, size) {
    anchor.style = `--columns: ${clamp(size / 4, 2, Infinity)}`;
    return anchor;
  }

  draw() {
    this.anchor.innerHTML = "";
    for (let gem of this.state) {
      this.anchor.appendChild(gem.draw());
    }
  }
}

const game = new GameState(16, gameEl);

game.draw();

setInterval(() => {
  console.log("frameCount");
  game.draw();
}, 1000);
