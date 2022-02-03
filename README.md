# Litargs

<div align="center">
  <img src="https://user-images.githubusercontent.com/62370527/152301970-a7d67d2e-1e3b-4780-9c20-34035d726a0b.svg">
</div>

---

![typescript](https://img.shields.io/badge/-Typescript-007ACC.svg?logo=typescript&style=popout) ![node.js](https://img.shields.io/badge/-Node.js-333333.svg?logo=node.js&style=popout) ![npm](https://img.shields.io/badge/-Npm-CB3837.svg?logo=npm&style=popout")![npm](https://img.shields.io/npm/dt/litargs) [![GitHub issues](https://img.shields.io/github/issues/airRnot1106/litargs)](https://github.com/airRnot1106/litargs/issues) [![GitHub forks](https://img.shields.io/github/forks/airRnot1106/litargs)](https://github.com/airRnot1106/litargs/network) [![GitHub stars](https://img.shields.io/github/stars/airRnot1106/litargs)](https://github.com/airRnot1106/litargs/stargazers) [![GitHub license](https://img.shields.io/github/license/airRnot1106/litargs)](https://github.com/airRnot1106/litargs/blob/main/LICENSE)

**_Would you like to parse arguments more easily?_**

## Highlights:flashlight:

-   The easiest CLI command line parser
-   Recommended for those who want simple parsing results
-   Easy to set options
-   Automatically create help

## Install

```sh
npm install litargs
```

## Usage

-   index.js

```javascript
//Example of a command to move a file
const { Litargs } = require('litargs');
const fs = require('fs');

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
    .option('cp', 0, { detail: 'copy' })
    .parse(process.argv.slice(2).join(' '));

Litargs.execute();
```

-   Command Line

```sh
$ node index.js move /Users/hoge.txt /Users/fuga.txt --cp
```

-   help

```sh
Commands:
help                    Display a list of commands and options


move    [source, destination]   Move a file
        Options:
        --cp                    copy

```

## API

#### Litargs.command(`name<string>`, `argumentCount<number>`, `description<{args?: string[], detail: string}>`, `handler<Function>`)

Add the command. Arguments are the name of the command, the number of arguments, a description of the command, and the function to be executed. The handler can accept arguments and options. For description, set the name of the argument in args and a concrete description in detail. If the expected number of arguments is 0, there is no need to set args.

#### Litargs.option(`name<string>`, `argumentCount<number>`, `description<args?: string[], detail: string>`)

Commands and options are added in the method chain.

```javascript
Litargs.command(...).option(...).option(...).command(...).option(...)...
```

The option method will be applied to the last command added. The basic settings are the same as for the command method. Options that require arguments are prefixed with "-", and options that do not require arguments are prefixed with "--". This does not need to be attached to "name", but it is required on the command line.

#### Litargs.parse(`parsedString<string>`)

Add this to the end of the method chain. For use with the node.js cli, specify `process.argv.slice(2).join(' ')`. This method returns a simple parsing result.

#### Litargs.execute()

Execute the registered handler. This should not be done before parse.

## Issues

If you find a bug or problem, please open an issue!:bug:

## Author

-   Github: [airRnot1106](https://github.com/airRnot1106)
-   NPM: [airrnot1106](https://www.npmjs.com/~airrnot1106)
-   Twitter: [@airRnot1106](https://twitter.com/airRnot1106)

## LICENSE

This project is licensed under the MIT License - see the [LICENSE](https://github.com/airRnot1106/litargs/blob/main/LICENSE) file for details.
