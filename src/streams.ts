/**
 *  Streams abstraction.
 * */

interface Deferred<T> {
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
}

export function defer<T = void>() {
    let methods!: Deferred<T>;
    const p = new Promise<T>((resolve, reject) => {
        methods = { resolve, reject };
    });
    return Object.assign(p, methods) as Promise<T> & Deferred<T>;
}

export class Stream<T> {
    signal = defer<void>();
    buf: T[] = [];
    ended = false;
    push(items: T[] | T) {
        if (this.ended) return;
        if (!Array.isArray(items)) items = [items];
        for(const item of items) {
            this.buf.push(item);
            this.signal.resolve();
            this.signal = defer();
        }
    }
    end() {
        this.ended = true;
        this.signal.resolve();
    }
    async next() {
        if (this.buf.length) {
            return {value: this.buf.shift() as T, done: false};
        }
        await this.signal;
        const item = this.buf.shift();
        if (item === undefined) {
            return {value: undefined as any as T, done: true};
        }
        return {value: item as T, done: false};
    }
    [Symbol.asyncIterator]() {
        return this;
    }
    error(err: any) {
        this.signal.reject(err);
    }
    async readAll() {
        const buf: T[] = [];
        for await (const item of this) {
            buf.push(item);
        }
        return buf;
    }
}