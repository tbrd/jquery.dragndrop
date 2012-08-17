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

Options:         default
translateY       true        allow movement on Y axis
translateX       true        allow movement on X axis
boundary         'body'      selector, jQuery object or function returning jQuery object

In some use cases, it won't be possible to set the boundary until after
the initialisation of the draggable. In this case, settings.boundary should
be a function which returns a jQuery object

Events
------

start.dragndrop      user starts to move element     args: event
drag.dragndrop       user moves element              args: event, Delta
drop.dragndrop       user drops element              args: event

    Delta: {
        x: movement on y axis (px)
        y: movement on y axis (px)
    }