/**
 * API stuff.
 */
import * as path from 'path';

export const rg = path.join(
    __dirname, 
    `/../bin/rg${process.platform.startsWith('win') ? '.exe' : ''}`
);

export default rg;
export * as opts from './opts';
export * from './rg';
export * from './streams';
