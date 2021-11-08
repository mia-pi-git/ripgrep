/**
 * Ripgrep opt handling.
 */

export interface RipgrepOptions {
    /** Is it case insensitive? */
    insensitive?: boolean;
    /** Global regex? */
    global?: boolean;
    /** Pattern to search. */
    pattern: string;
    /** Path(s?) to search. */
    path: string;
    /** Max results to get. */
    maxResults?: number;
    /** CWD to use. */
    cwd?: string;
    /** Lines of context around each match. */
    context?: number;
    /** To split each chunk on. 
     * Provide a [string, string] to split by the first string, 
     * then split each chunk by the second string
     */
    separator?: string | [string, string];
    /** Extra custom args. */
    args?: string[];
    /** Engine to use. */
    engine?: string;
    /** Number of lines of context before a match */
    beforeMatch?: number;
    /** Number of lines of context after a match */
    afterMatch?: number;
    /** Search binary files */
    binary?: boolean;
    /** Use block buffering. */
    blockBuffer?: boolean;
    byteOffset?: number;
    /** Show column numbers. */
    column?: boolean;
    contextSeparator?: string;
    /** Return number of matches instead of matches. */
    count?: boolean;
    encoding?: string;
    /** Search hidden files / dirs. */
    searchHidden?: boolean;
    glob?: string;
    heading?: boolean;
    ignoreFiles?: string[];
    json?: boolean;
    showLineNums?: boolean;
    maxColumns?: number;
}

export const flags: {[k: string]: string} = {
    insensitive: '-i',
    global: '-g',
    pattern: '-e',
    path: '',
    context: '-C',
    maxResults: '-m',
    beforeMatch: '-B',
    afterMatch: '-A',
    binary: '--binary',
    blockBuffer: '--block-buffered',
    byteOffset: '-b',
    column: '--column',
    contextSeparator: '--context-separator',
    count: '--count',
    encoding: '--encoding',
    searchHidden: '--hidden',
    glob: '--glob',
    heading: '--heading',
    json: '--json',
    showLineNums: '--line-number',
    maxColumns: '--max-columns',
};

const parsers: {
    [k: string]: (val: any) => string[]
} = {
    ignoreFiles(val) {
        return (val as string[]).map(file => `--ignore-file ${file}`);
    },
    engine(val) {
        return [`--engine=${val}`];
    },
};

export function parse(opts: RipgrepOptions) {
    let buf: string[] = [];
    for (const k in opts) {
        if (k in flags) {
            let val = opts[k as keyof RipgrepOptions] + "";
            if (val === 'true') val = '';
            buf.push(
                ...[flags[k], val].filter(Boolean) as string[]
            );
            continue;
        }
        if (parsers[k]) {
            buf.push(...parsers[k](opts[k as keyof RipgrepOptions]));
            continue;
        }
    }
    const execOpts: any = {};
    if (opts.cwd) execOpts.cwd = opts.cwd;
    if (opts.args) {
        buf.push(...opts.args);
    }

    return {args: buf, execOpts};
}