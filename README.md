# fractal-viewer
## Project description
This is an interactive fractal viewer using WebGL 2. Depending on your navigator, you might need to launch a local webserver to use it. You can do so by launching the files `webserver.py`. You can also test it [here](https://mauropfister.github.io/fractal-viewer/).

## Control
* **rotation**: Mouse drag and drop
* **Zoom**: Mouse scroll
* **Parameter change**: Using corresponding sidebars
* **Reset**: The view (rotation and zoom) can be reset by double clicking on the viewer. Sliders can also be reset by a double click them.

## Shape factor

For each fractal, one can change a shape factor. This value affect the following properties:
* **Mandelbulb**: the power, denoted `n` in [wikipedia](https://en.wikipedia.org/wiki/Mandelbulb).
* **Mandelbox**: the number of iterations. Each iteration correspond to a box fold and a sphere fold. The shape factor is therefore converted to an integer.
* **Juliaset**: the constant, denoted `c` in [wikipedia](https://en.wikipedia.org/wiki/Julia_set).
* **Sierpinski pyramid**: The number of iteration. The shape factor is therefore converted to an integer.
* **Rounded box**: the curvature radius at the edges.