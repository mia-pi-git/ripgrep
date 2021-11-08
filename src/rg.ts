/**
 * Ripgrep stream stuff.
 */
import * as child_process from 'child_process';
import {Stream} from './streams';
import * as opts from './opts';
import * as pathModule from 'path';
import {execSync as exec} from 'child_process';

export const path = (() => {
    try {
        exec('rg --help');
        return 'rg';
    } catch {
        return pathModule.join(
            __dirname, 
            `/../bin/rg${process.platform.startsWith('win') ? '.exe' : ''}`
        );
    }
})();

export class RipgrepStream<T> extends Stream<T> {
    cmd: child_process.ChildProcessWithoutNullStreams;
    private opts: opts.RipgrepOptions;
    constructor(input: opts.RipgrepOptions) {
        super();
        const {args, execOpts} = opts.parse(input);
        this.cmd = child_process.spawn(path, args, execOpts);
        this.opts = input;

        this.cmd.stdout.on('data', (data) => {
            if (this.ended) {
                return this.cmd.kill();
            }
            this.push(this.split(data + "") as any);
        });
        this.cmd.stderr.on('data', (data) => {
            if (this.ended) {
                return this.cmd.kill();
            }
            this.error(new Error(data.toString()));
        });
        this.cmd.on('close', (code) => {
            if (this.ended) return;
            if (code !== 0) {
                this.error(new Error(`rg exited with code ${code}`));
            }
            this.end();
        });
    }
    private split(data: string) {
        const sep = this.opts.separator;
        if (typeof sep === 'string') {
            return data.split(sep);
        }
        if (Array.isArray(sep)) {
            return data.split(sep[0]).map((s) => s.split(sep[1]));
        }
        return data;
    }
    override end() {
        this.cmd.kill();
        super.end();
    }
}

export function ripgrep(
    opts: opts.RipgrepOptions & {separator: [string, string]}
): RipgrepStream<string[]>;
export function ripgrep(
    opts: opts.RipgrepOptions & {separator: undefined | string}
): RipgrepStream<string>;
export function ripgrep(
    input: opts.RipgrepOptions
): RipgrepStream<string | string[]> {
    return new RipgrepStream(input);
}
