import asyncio
from collections import defaultdict


class EventBus:

    def __init__(self):
        self.listeners = defaultdict(list)
        self.loop = None

    # ==========================================
    # Set Async Event Loop
    # ==========================================

    def set_loop(self, loop):
        """
        Store the main FastAPI asyncio event loop.
        """

        self.loop = loop

        print("✅ EventBus loop registered")

    # ==========================================
    # Subscribe
    # ==========================================

    def subscribe(self, event, callback):
        """
        Subscribe a callback to an event.
        """

        if callback not in self.listeners[event]:

            self.listeners[event].append(
                callback
            )

        print(
            f"📡 Event subscribed: {event}"
        )

    # ==========================================
    # Unsubscribe
    # ==========================================

    def unsubscribe(self, event, callback):
        """
        Remove a callback from an event.
        """

        if event not in self.listeners:
            return

        if callback in self.listeners[event]:

            self.listeners[event].remove(
                callback
            )

    # ==========================================
    # Emit
    # ==========================================

    def emit(self, event, data):
        """
        Emit an event safely.

        Supports both:
        - normal callbacks
        - async callbacks
        """

        callbacks = self.listeners.get(
            event,
            []
        )

        if not callbacks:
            return

        print(
            f"📢 Event: {event}"
        )

        for callback in callbacks:

            try:

                result = callback(data)

                # ==================================
                # Async Callback
                # ==================================

                if asyncio.iscoroutine(result):

                    self._schedule_coroutine(
                        result
                    )

            except Exception as e:

                print(
                    f"❌ Event Error: {e}"
                )

    # ==========================================
    # Schedule Coroutine
    # ==========================================

    def _schedule_coroutine(self, coroutine):
        """
        Safely schedule an async callback.

        Handles both:
        - calls from inside the running loop
        - calls from outside the running loop
        """

        # ==================================
        # Case 1:
        # Already inside running event loop
        # ==================================

        try:

            running_loop = (
                asyncio.get_running_loop()
            )

            running_loop.create_task(
                coroutine
            )

            return

        except RuntimeError:

            pass

        # ==================================
        # Case 2:
        # Called outside running loop
        # ==================================

        if (
            self.loop
            and not self.loop.is_closed()
        ):

            try:

                asyncio.run_coroutine_threadsafe(
                    coroutine,
                    self.loop
                )

                return

            except Exception as e:

                print(
                    f"❌ Failed to schedule event: {e}"
                )

        # ==================================
        # No Loop Available
        # ==================================

        print(
            "⚠️ Event loop unavailable"
        )

        # Prevent:
        #
        # RuntimeWarning:
        # coroutine was never awaited
        #

        try:

            coroutine.close()

        except Exception:

            pass


# ==========================================
# Global Event Bus
# ==========================================

event_bus = EventBus()