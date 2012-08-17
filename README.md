jquery.dragndrop
================

Add drag/drop events to an element. When the user drags, the element will follow the cursor until the user releases the left button

If a boundary is provided, the element will not move outside of the confines of the boundary. By default, the element will not move outside the boundary of 'body'.

If a handle is provided, the drag event will be bound to the handle element while the selected element will move.

Example usage
-------------

    $('.draggable').dragndrop({
        translateY: true,
        boundary: 'body',
        handle: '.drag-handle'
    });

Options
-------

### translateY
Boolean
default: true
Allow movement on Y axis

### translateX
Boolean
default: true
allow movement on X axis

### boundary
String, Function or jQuery object
Default: 'body'
Selector or function returning jQuery object

In some use cases, it won't be possible to set the boundary until after
the initialisation of the draggable. In this case, settings.boundary should
be a function which returns a jQuery object

Events
------

### start.dragndrop
Fired once user has held mouse button down over target element and moved mouse

### drag.dragndrop
Fired continuously while user moves mouse while holding mouse button after start

Passes an argument, Delta:

    Delta: {
        x: movement on y axis (px)
        y: movement on y axis (px)
    }

### drop.dragndrop
Fired when user lets go of mouse button