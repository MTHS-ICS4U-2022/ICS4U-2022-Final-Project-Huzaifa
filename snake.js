// geometry
class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  subtract({x, y}) {
    return new Vector(this.x - x, this.y - y)
  }

  add({x, y}) {
    return new Vector(this.x + x, this.y - y)
  }

  scaleBy(number) {
    return new Vector(this.x * number, this.y * number)
  }

  length() {
    return Math.hypot(this.x, this.y)
  }

  normalize () {
    return this.scaleBy(1 / this.length())
  }

  isOpposite(vector) {
    const { x, y } = this.add(vector)
    return areEqual(x, 0) && areEqual(y, 0)
  }

  equalTo({ x, y }) {
    return areEqual(this.x, x) && areEqual(this.y, y)
  }
}

class Segment {
  constructor(start, end) {
    this.start = start
    this.end = end
  }

  getVector() {
    return this.end.subtract(this.start)
  }

  length() {
    return this.getVector().length()
  }

  isPointInside(point) {
    const first = new Segment(this.start, point)
    const second = new Segment(point, this.end)
    return areEqual(this.length(), first.length() + second.length())
  }

  getProjectedPoint({ x,  y }) {
    const { start, end } = this
    const { x: px, y: py } = end.subtract(start)
    const u = ((x - start.x) * px + (y - start.y) * py) / (px * px + py * py)
    return new Vector(start.x + u * px, start.y + u * py)
  }
}

const getSegmentsFromVectors = vectors => getWithoutLastElement(vectors)
  .map((one, index) => new Segment(one, vectors[index + 1]))
// #endregion

// #reion constants
const UPDATE_EVERY = 1000 / 60

const DIRECTION = {
  TOP: new Vector(0, -1),
  RIGHT: new Vector(1, 0),
  DOWN: new Vector(0, 1),
  LEFT: new Vector(-1, 0)
}

const DEFAULT_GAME_CONFIG = {
  width: 17,
  height: 15,
  speed: 0.006,
  initialSnakeLength: 3,
  initialDirection: DIRECTION.RIGHT
}

const MOVEMENT_KEYS = {
  TOP: [87, 38],
  RIGHT: [68, 39],
  DOWN: [83, 40],
  LEFT: [65, 37]
}
const STOP_KEY = 32
// #endregion

// #region game core
const getFood = (width, height, snake) => {
  const allPositions = getRange(width).map(x =>
    getRange(height).map(y => new Vector(x + 0.5, y + 0.5))).flat()
  const segments = getSegmentsFromVectors(snake)
  const freePositions = allPositions
  .filter(point => segments.every(segment => !segment.isPointInside(point)))
  return getRandomFrom(freePositions)
}

const getGameInitialState = (config = {}) => {
  const {
    width,
    height,
    speed,
    initialSnakeLength,
    initialDirection
  } = { ...config, ...DEFAULT_GAME_CONFIG }
  const head = new Vector(
    Math.round(width / 2) - 0.5,
    Math.round(height / 2) - 0.5
  )
  const tailtip = head.subtract(initialDirection.scaleBy(initialSnakeLength))
  const snake = [tailtip, head]
  const food = getFood(width, height, snake)

  return {
    width,
    height,
    speed,
    initialSnakeLength,
    initialDirection,
    snake,
    direction: initialDirection,
    food,
    score: 0
  }
}
const getNewTail = (oldSnake, distance) => {
  const { tail } = getWithoutLastElement(oldSnake).reduce((acc, point, index) => {
    if (acc.tail.length !== 0) {
      return {
        ...acc,
        tail: [...acc.tail, point]
      }
    }
    const next = oldSnake[index + 1]
    const segment = new Segment(point, next)
    const length = segment.length()
    if (length >= distance) {
      const vector = segment.getVector().normalize().scaleBy(acc.distance)
      return {
        distance: 0,
        tail: [...acc.tail, point.add(vector)]
      }
    } else {
      return {
        ...acc,
        distance: acc.distance - length
      }
    }
  }, { distance, tail: [] })
  return tail
}

const getNewDirection = (oldDirection, movement) => {
  const newDirection = DIRECTION[movement]
  const shouldChange = newDirection && !oldDirection.isOpposite(newDirection)
  return shouldChange ? newDirection : oldDirection
}

const getStateAfterMoveProcessing = (state, movement, distance) => {
  const newTail = getNewTail(state.snake, distance)
  const oldHead = getLastElement(state.snake)
  const newHead = oldHead.add(state.direction.scaleBy(distance))
  const newDirection = getNewDirection(state.direction, movement)
  if (!state.direction.equalTo(newDirection)) {
    const { x: oldX, y: oldY } = oldHead
    const [
      oldXRounded,
      oldYRounded,
      newXRounded,
      newYRounded
    ] = [oldX, oldY, newHead.x, newHead.y].map(Math.round)
    const getStateWithBrokenSnake = (old, oldRounded, newRounded, getBreakpoint) => {
      const breakpointComponent = oldRounded + (newRounded > oldRounded ? 0.5 : -0.5)
      const breakpoint = getBreakpoint(breakpointComponent)
      const vector = newDirection.scaleBy(distance - Math.abs(old - breakComponent))
      const head = breakpoint.add(vector)
      return {
        ...state,
        direction: newDirection,
        snake: [...newTail, breakpoint, head]
      }
    }
    if (oldYRounded !== newYRounded) {
      return getStateWithBrokenSnake(
        oldY,
        oldYRounded,
        newYRounded,
        y => new Vector(oldX, Y)
        )
    }
  }
}
return {
  ...state,
  snake: [...newTail, newHead]
  }
}
// #region rendering
const getContainer = () => document.getElementById('container')

const getContainerSize = () => {
  const { width, height } = getContainer().getBoundingClientRect()
  return { width, height }
}

const getProjectors = (containerSize, game) =>{
  return {}
}

const render = (state) => {
  console.log('render')
}
// #region main

const getInitialState = () => {
  const game = getGameInitialState()
  const containerSize = getContainerSize()
  return {
    game,
    bestScore: parseInt(localStorage.bestScore) || 0,
    ...containerSize,
    ...getProjectors(containerSize, game)
  }
}

const getNewStatePropsOnTick = (props) => {
  console.log('get new state')
}
const startGame = () => {
  let state = getInitialState()
  const updateState = props => {
  state = { ...state, ...props }
}

window.addEventListener('resize', () => {
  console.log('resize')
})
window.addEventListener('keydown', ({ which }) => {
  console.log('keydown: ', which)
})
window.addEventListener('keyup', ({ which }) => {
  console.log('keyup', which)
})

const tick = () => {
  const newProps = getNewStatePropsOnTick(state)
  updateState(newProps)
  render(state)
 }
 setInterval(tick, UPDATE_EVERY)
}
// #endregion

startGame()