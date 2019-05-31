# fractal-viewer
## Project description
This is an interactive fractal viewer using WebGL 2. Depending on your browser, you might need to launch a local webserver to use it. You can do so by launching the file `webserver.py`. Alternatively, you can directly access the online version [here](https://mauropfister.github.io/fractal-viewer/).

The fractal viewer was tested on Chrome but might also run on other browsers.

## Controls
* **Viewport rotation**: Mouse/trackpad dragging while clicking left mouse button
* **Zoom**: Mouse/trackpad scroll
* **Parameter change**: Using corresponding sidebars
* **Reset parameters**: The view (rotation and zoom) can be reset by double clicking on the viewport. Sliders can also be reset by a double click.

## Shape factor

For each fractal, one can change a shape factor. This value affect the following properties:
* **Mandelbulb**: The power, denoted `n` on [wikipedia](https://en.wikipedia.org/wiki/Mandelbulb).
* **Mandelbox**: The number of iterations. Each iteration corresponds to a box fold and a sphere fold. The shape factor is therefore converted to an integer.
* **Juliaset**: The constant, denoted `c` on [wikipedia](https://en.wikipedia.org/wiki/Julia_set).
* **Sierpinski pyramid**: The number of iterations. The shape factor is therefore converted to an integer.
* **Rounded box**: The curvature radius at the edges.