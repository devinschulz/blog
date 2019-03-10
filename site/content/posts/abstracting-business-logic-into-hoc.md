+++
title = "Abstracting business logic into higher order components"
date = "2018-08-26T17:51:57-04:00"
draft = true
caption = ""
imageAltText = ""
description = ""
tags = ["React", "Design Patterns"]
+++

I was tasked with constructing a measurement system inside of Inspect that depicts and calculates the distances between two layers. In-between each layer, a line is drawn with a label that displays the distance. Supporting lines are added to the nearest edges of the hovered layer to help give the user an idea where the measurement lines reach to. In this article, I will explain some of my ideas and how I managed to solve this problem.

Instead of jumping to the conclusion of using a single component containing both the business and view logic, I decided it would be best to separate the derivative data calculations from the view layer. A higher-order component would handle the business logic and pass the required data to a stateless child component.
## Breaking down the task at hand
At InVision, our team uses JIRA to manage bugs, new features and everything that needs to tracked. By separating the view from the business logic, not only can I now easily split a single ticket into two smaller tickets, but was able to go one step further. I created a ticket to deal with outlining what values will be passed from the higher-order component to the child component. Three tickets have been created from what was originally one and can now be tracked and dealt with individually.
## Creating the outline
I believe every problem will give you better results if you sit down and think about how to approach it before the execution. This step is a great time to bounce ideas off your coworkers to see if they agree with your suggested approach or have a way to make it even better.  Without this first step, I may have over-engineered or made this much more complicated than it needed to be.

Looking at the design mockups from the designer, the first thing I see I can see that I need to draw a rectangle around both the selected and a hovered layer. Both of these values exist within the global state, so I can just pass these properties from a parent component and down to the view without additional data transformation.

```js
type Props = {
  selectedLayer?: Layer,
  hoveredLayer?: Layer
}
```

The next obvious thing I’ll need to pass down the view component is all the measurements. There can be up to four separate measurements rendered at a single time so the apparent choice here is to use an array of objects. Now I need to figure out what each measurement looks like.

```js
type Measurements Measurement[]
```

Each measurement must have a direction which is either top, right, bottom or left. Based on this information alone, I’ll use this to draw a specific side of the border. The first property I’ll add to the measurement object is the direction. Next, I need to know the start and end position of each measurement which will be an x, y coordinate with either a width or height, depending on whether it’s vertical or horizontal.

```js
type Position = {
  top: number,
  left: number,
  width?: number,
  height?: number,
}

type Measurement = {
  direction: number
  label: Label,
  position: Position
}
```

The last item that exists within each measurement is the label to display the distance. Whenever the measurement is inside the artboard, the label is positioned in the middle of the measurement line. In order to position the label, we’ll need an x and y coordinate.

```
type Point = {
  x: number,
  y: number
}

type Label {
  point: Point,
  value: string,
}
```

The outline was created using Flow type definitions to help validate that the data types passed down the view is correct. Flow is an excellent choice if you want the type safety and reassurance that right data is being passed around in your application. You will end up with fewer bugs in the end and will feel more confident in your codebase. Plus you can run `flow status` and fail the CI (Continuous Integration) build whenever an error occurs.

Here is the entire structure, instead of me showing you bits and pieces.

```js
type Point = {
  x: number,
  y: number
}

type Label {
  point: Point,
  value: string,
}

type Position {
  top: number,
  left: number,
  width?: number,
  height?: number,
}

type Measurement {
  direction: number
  label: Label,
  position: Position
}

type Measurements Measurement[]
```
## The Business Logic Layer

The higher-order component contains all our business logic which is the heart of this functionality. Its job is to take the hovered or selected layer and transform that information into something we can use in the view.

Before I dive into both paths, there are a couple checks which need to happen. First, I need to determine if only selected layers are passed in or both selected and hovered layers. If only the selected layer is passed in, I will use the properties from the artboard instead. This will allow me to calculate the position of the layer in relation to the artboard itself.

There are two main paths which the logic will follow; both the selected and hovered layer are overlapping each other or not. The properties we will worry about for each layer are the width, height, and x, y coordinates. This is a simplification of the layer, but it will give you an idea of some basic properties it contains.

```
type Layer = {
  Id: number,
  width: number,
  height: number,
  x: number,
  y: number
}
```

In order to determine if one layer is completely inside another, I created the following function:

```
const layerContainsLayer = (layer1: Layer, layer2: Layer): boolean =>
    (layer2.x + layer2.width < layer1.x + layer1.width) &&
    (layer2.x > layer1.x) &&
    (layer2.y > layer1.y) &&
    (layer2.y + layer2.height < layer1.y + layer1.height)
)
```

And then determined if the layers are overlapping in any way with the following function:


```js
// Determine if the x axies plus width overlap in anyway
const xIntersects = (layer1: Layer, layer2: Layer): boolean =>
  Math.max(
    0,
    Math.min(layer1.x + layer1.width, layer2.x + layer2.width) -
      Math.max(layer1.x, layer2.x)
  ) > 0

// Determine if the y axies plus height overlap in anyway
const yIntersects = (layer1: Layer, layer2: Layer): boolean =>
  Math.max(
    0,
    Math.min(layer1.y + layer1.height, layer2.y + layer2.height) -
      Math.max(layer1.y, layer2.y)
  ) > 0

// Determine if both x and y axies plus width and height overlap in anyway
const layerOverlapsLayer = (layer1: Layer, layer2: Layer): boolean =>
  xIntersects(layer1, layer2) && yIntersects(layer1, layer2)
```

The next piece of information which is shared among all different paths is the direction. The way I’ve decided to calculate the direction is to think of 3x3 grid which starts at zero and increments in a clockwise fashion. Starting from the middle, eight, where is the second layer in relation to it.
I’ll go ahead and create an arry containing all these values.

```js
**
 *     |     |
 *  0  |  1  |  2
 * ____|_____|_____
 *     |     |
 *  7  |  8  |  3
 * ____|_____|_____
 *     |     |
 *  6  |  5  |  4
 *     |     |
 */

const BOTTOM = 5
const BOTTOM_LEFT = 6
const BOTTOM_RIGHT = 4
const CENTER = 8
const LEFT = 7
const RIGHT = 3
const TOP = 1
const TOP_LEFT = 0
const TOP_RIGHT = 2

const DIRECTIONS = [
  TOP,
  TOP_RIGHT,
  RIGHT,
  BOTTOM_RIGHT,
  BOTTOM,
  BOTTOM_LEFT,
  LEFT,
  TOP_LEFT
]
```

Now that we’ve set up this variable we can work on the math portion to determine the cardinal direction between the two layers. This can be accomplished using the following code:

```js
const getDirection (layer1: Layer, layer2: Layer): number {
  // Get the x and y  of each layer
  const layer1Center: Point = getCenter(layer1)
  const layer2Center: Point = getCenter(layer2)

  // Check if this coordinate is dead center inside of the other.
  if (layer1Center.x === layer2Center.x && layer1Center.y === layer2Center.y) {
    return CENTER
  }
  const angle = getAngle(layer2Center, layer1Center)
  return angleToDirection(angle)
}

// Convert the angle to a direction
const angleToDirection = (angle: number): number => {
  const dirLen = DIRECTIONS.length
  return DIRECTIONS[Math.floor(angle / (360 / dirLen) + 0.5) % dirLen]
}

// Calculage the angle between the center of two points
const getAngle = (point1: Point, point2: Point): number => {
  const angle = Math.atan2(
    point2.y - point1.y,
    point2.x - point1.x
  ) * 180 / Math.PI - 90
  return angle < 0  // Ensure positive angle
    ? 360 + angle
    : angle
}

// Get the absolute center point of a layer
const getCenter = (layer: Layer): Point => ({
  x: layer.x + layer.width / 2,
  y: layer.y + layer.height / 2
})


### Overlapping layers
Overlapping layers is the easier option of the two to calculate. The first step I chose to do here was to calculate all four sides of the selected layer and build up the measurement. The obvious property here is setting the direction which we can set to either left, right, top or bottom depending on the measurement that is being calculated.

In order to calculate the position

```
const left: Measurement = {
  direction: LEFT,
  position: {
    top: intersects.y,
    left: xMin,
    width: left
  }
}
```
### Layers which do not touch

The first thing I will test is if the selected layer is equal to the hovered layer. If that is the case,

Is the hovered layer equal to the selected layer
Do nothing
What is the angle between the two
Where is the selected layer in relation to the hovered layer (cardinal direction to placement)
Does the selected layer overlap the hovered layer
Determine the distances between the selected and hover layer



This is the heart of handling all the business rules and transforming one or more layers into properties which can be used by the view layer.
## The View Layer
## Testing

Testing was an interesting task when I was first introduced to higher-order components. We use a combination of [mocha], [chai], [skin deep], and [shallow render] to unit test our code.  When shallow rendering a component that has been wrapped in a decorator, it does not have any children props.

export var MyDecorator = ComposedComponent => class extends React.Component {
	render() {
		return <ComposedComponent {...this.props} {...this.state} />
	}
}

class Component extends React.Component {
	constructor(props) {
      super(props);
    }
	render() {
		return <div></div>;
	}
}
export default MyDecorator(Component);

## How higher-order components are a win 
Using higher-order components for business logic instead of calculating in the view 
Separation of concern
React data flow of passing props down 
Visual: Displaying how higher-o111rder components pass data to child components

### Feature Flags?
All new features are hidden behind feature flags which are simply just if/else statements. This increases our velocity by allowing us to ship incremental updates on a feature that is not quite ready yet. In our case, I was able to ship each of the three tickets to production without worrying about it getting into the hands of users.

## Conclusion
Benefits of separating the view and calculation logic
