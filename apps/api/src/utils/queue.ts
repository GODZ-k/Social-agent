export type SerialQueue = {
    enqueue: (id: string) => void;
    /** Jobs not yet finished, waiting or running. */
    pendingCount: () => number;
};

/**
 * A first-in, first-out queue in this process that runs one job at a time. A job records its own
 * failures; one that still throws is logged and the queue moves on to the next.
 */
export function createSerialQueue(label: string, run: (id: string) => Promise<void>): SerialQueue {
    const waiting: string[] = [];
    let running = false;

    function startNext(): void {
        if (running) return;
        const id = waiting.shift();
        if (id === undefined) return;

        running = true;
        void run(id)
            .catch((error) => console.error(`${label} ${id} could not be run`, error))
            .finally(() => {
                running = false;
                startNext();
            });
    }

    return {
        enqueue(id) {
            waiting.push(id);
            startNext();
        },
        pendingCount() {
            return waiting.length + (running ? 1 : 0);
        },
    };
}
