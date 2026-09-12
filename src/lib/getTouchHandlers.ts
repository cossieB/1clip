type TouchCallbacks = {
    onSwipeUp?: () => void;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeDown?: () => void;
};

export function getTouchHandlers(callbacks: TouchCallbacks = {}, minDistance = 30) {
    let startX = 0;
    let startY = 0;

    function handleTouchStart(e: TouchEvent): void {
        const touch = e.touches[0];
        if (!touch) return;
        startX = touch.clientX;
        startY = touch.clientY;
    }

    function handleTouchEnd(e: TouchEvent): void {
        const touch = e.changedTouches[0]; 
        if (!touch) return;

        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (Math.max(absX, absY) < minDistance) return;

        if (absX > absY) {
            if (deltaX > 0) {
                callbacks.onSwipeRight?.();
            } 
            else {
                callbacks.onSwipeLeft?.();
            }
        } 
        else {
            if (deltaY > 0) {
                callbacks.onSwipeDown?.();
            } 
            else {
                callbacks.onSwipeUp?.();
            }
        }
    }

    return { handleTouchStart, handleTouchEnd };
}