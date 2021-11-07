**ripgrep-pkg**

This makes it easy to `npm install` ripgrep (installs a binary) and then offers an easy API surface.

Install with `npm install ripgrep-pkg`.

**Usage**
```ts

import {ripgrep} from 'ripgrep-pkg';

ripgrep(opts)
``` 
`ripgrep` is the main API surface, returning a stream that handles output from the CLI.

Usable options: see [the opts file](./src/opts.ts).