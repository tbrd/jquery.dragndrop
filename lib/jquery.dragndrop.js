/**
 * jquery.dragndrop v0.1
 * author @tbrd
 * 23/05/2012
 * http://github.com/tbrd/jquery.dragndrop
 *
 */

(function($) {
    $.fn.dragndrop = function (options) {

        var defaults = {
            'translateY': true,
            'translateX': true,
            'boundary': 'body'
        };

        $(this).each(function() {

            var settings;
            var $draggable = $(this);
            var $boundary;
            var boundaryScrollHeight;
            var boundaryScrollWidth;
            var oldPageY;
            var oldPageX;
            var dragging = false;

            // settings
            if ($draggable.data('draggable')) {
                settings = $.extend({}, $draggable.data('draggable').settings, options);
            } else {
                settings = $.extend({}, defaults, options);
            }
            settings.$handle = settings.handle ? $(settings.handle, this) : $draggable;
            $draggable.data('draggable', {'settings': settings});

            // initialise
            settings.$handle
                .unbind('mousedown', dragInit)
                .bind('mousedown', dragInit);

            /**
             * if $boundary has not already been defined, use settings.boundary
             */
            function setBoundary() {
                if (!$boundary || $boundary.length === 0) {
                    if (typeof settings.boundary === 'function') {
                        $boundary = settings.boundary();
                    } else {
                        $boundary = $(settings.boundary);
                    }
                }
            }

            /**
             * calculate boundary scroll height
             * @return {Number} scrollHeight in pixels
             */
            function getBoundaryScrollHeight(){
                return $boundary[0].scrollHeight;
            }

            /**
             * calculate boundary scroll width
             * @return {Number} scrollWidth in pixels
             */
            function getBoundaryScrollWidth(){
                return $boundary[0].scrollWidth;
            }

            /**
             * process the mouse movement, actually move $draggable
             *
             * 'origin' is used to mean the left or top edge of an element
             * 'edge' is used to mean the right or bottom edge of an element
             * 'offset' is page relative
             * 'size' is width/height in px
             * 'before' is above/left of
             * 'after' is below/right of
             *
             * @param {Event} event The mouse move event
             * @param {Object} delta The amount of mouse movement
             * @param {string} direction The direction to process for dragging,
             *     either 'x' or 'y'
             */
            function dragXY(event, delta, direction) {
                var draggableOffset;
                var draggableCssPosition;
                var draggableEdge;
                var draggableSize;
                var boundaryOffset;
                var boundarySize;
                var newDraggableCssPosition;
                var cursorIsBeforeDraggable;
                var cursorIsAfterDraggable;
                var dragElementIsAtBoundaryOrigin;
                var dragElementIsAtBoundaryEdge;
                var positiveDelta;
                var negativeDelta;
                var cssProperty;
                var boundaryScrollSize;

                if (direction === 'x') {
                    delta = delta.x;
                    draggableSize = $draggable.outerWidth();
                    draggableOffset = $draggable.offset().left;
                    boundaryOffset = $boundary.offset().left;
                    boundarySize = $boundary.outerWidth();
                    cursorIsBeforeDraggable = event.pageX < draggableOffset;
                    cursorIsAfterDraggable =
                        event.pageX > draggableOffset + draggableSize;
                    cssProperty = 'left';
                    boundaryScrollSize = getBoundaryScrollWidth();
                } else {
                    delta = delta.y;
                    draggableSize = $draggable.outerHeight();
                    draggableOffset = $draggable.offset().top;
                    boundaryOffset = $boundary.offset().top;
                    boundarySize = $boundary.outerHeight();
                    cursorIsBeforeDraggable = event.pageY < draggableOffset;
                    cursorIsAfterDraggable =
                        event.pageY > draggableOffset + draggableSize;
                    cssProperty = 'top';
                    boundaryScrollSize = getBoundaryScrollHeight();
                }

                positiveDelta = delta > 0;
                negativeDelta = delta < 0;
                draggableCssPosition = parseInt($draggable.css(cssProperty), 10);
                dragElementIsAtBoundaryOrigin = draggableOffset < boundaryOffset;
                draggableEdge = draggableCssPosition + draggableSize;
                dragElementIsAtBoundaryEdge =
                        draggableOffset + draggableSize >
                        boundaryOffset + boundarySize;

                // if the cursor is moving toward the element while being left/right of it
                // we should not move the element until the mouse is back over it
                if (!((cursorIsBeforeDraggable && positiveDelta) ||
                    (cursorIsAfterDraggable && negativeDelta))) {
                    // if the item is at the top/bottom of the boundary, don't move it
                    if (!((dragElementIsAtBoundaryOrigin && negativeDelta) ||
                        (dragElementIsAtBoundaryEdge && positiveDelta))) {
                        if (negativeDelta) {
                            // if the item will be off the lhs of the boundary, snap to left
                            if (draggableCssPosition + delta < 0) {
                                newDraggableCssPosition = 0;
                            } else {
                                newDraggableCssPosition = draggableCssPosition + delta;
                            }
                        } else {
                            // if the item will be off the rhs of the boundary, snap to right
                            if (draggableEdge + delta > boundaryScrollSize) {
                                newDraggableCssPosition =
                                    boundaryScrollSize - draggableSize - 1;
                            } else {
                                newDraggableCssPosition = draggableCssPosition + delta;
                            }
                        }
                        $draggable.css(cssProperty, newDraggableCssPosition);
                    }
                }
            }

            /**
             * handle a change in mouse position while in drag state
             * @param event
             */
            function drag(event) {
                var delta = {
                    y: event.pageY - oldPageY,
                    x: event.pageX - oldPageX
                };
                var shouldTriggerEvent = false;

                oldPageY = event.pageY;
                oldPageX = event.pageX;
                event.preventDefault();
                if (settings.translateY) {
                    dragXY(event, delta, 'y');
                    shouldTriggerEvent = true;
                }
                if (settings.translateX) {
                    dragXY(event, delta, 'x');
                    shouldTriggerEvent = true;
                }
                if (shouldTriggerEvent) {
                    $draggable.trigger('drag.dragndrop', [delta, {
                        'y': event.pageY,
                        'x': event.pageX
                    }]);
                }
            }

            /**
             * handle mouseup event
             * @param event
             */
            function dragStop() {
                $(document)
                    .unbind('mousemove', dragStart)
                    .unbind('mousemove', drag)
                    .unbind('mouseup', dragStop);
                if (dragging) {
                    $draggable
                        .trigger('drop.dragndrop')
                        .removeClass('dragndrop-dragging');
                }
                dragging = false;
            }

            /**
             * handle first mousemove event after mousedown
             * @param event
             */
            function dragStart(event) {
                dragging = true;
                $(document)
                    .unbind('mousemove', dragStart)
                    .bind('mousemove', drag);
                oldPageY = event.pageY;
                oldPageX = event.pageX;
                setBoundary();
                // recalculate scroll height on every drag in case DOM or styles have changed
                boundaryScrollHeight = getBoundaryScrollHeight();
                boundaryScrollWidth = getBoundaryScrollWidth();
                $draggable
                    .trigger('start.dragndrop', [
                        event.offsetY,
                        event.offsetX
                    ])
                    .addClass('dragndrop-dragging');
            }

            /**
             * handle mousedown event
             * @param event
             */
            function dragInit(event) {
                event.preventDefault();
                $(document)
                    .bind('mousemove', dragStart)
                    .bind('mouseup', dragStop);
            }
        });
    };
}(jQuery));
