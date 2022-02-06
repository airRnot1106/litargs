//Example of a command to move a file
import { Litargs } from '../index';
import fs from 'fs';

Litargs.command(
    'move',
    2,
    { args: ['source', 'destination'], detail: 'Move a file' },
    (args, option) => {
        if (option.cp) {
            fs.copyFileSync(args[0], args[1]);
        } else {
            fs.renameSync(args[0], args[1]);
        }
    }
)
    .alias('m')
    .option('cp', 0, { detail: 'copy' })
    .parse(process.argv.slice(2).join(' '));

Litargs.execute();
