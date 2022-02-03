import { Command, ValidOptionList, Handler } from './command';
import { Option } from './option';
import { Description } from './util';

export interface ParseResult {
    readonly command: string;
    readonly commandArgs: string[];
    readonly options: string[];
    readonly optionArgs: string[][];
    readonly errors: { type: string; target?: string; detail: string }[];
}

export class Litargs {
    private static _commandMap: Map<string, Command> = new Map([
        [
            'help',
            new Command(
                'help',
                0,
                { detail: 'Display a list of commands and options' },
                () => {
                    Litargs.help();
                }
            ),
        ],
    ]);
    private static _isValid = false;
    private static _parseResult: ParseResult = {
        command: '',
        commandArgs: [],
        options: [],
        optionArgs: [],
        errors: [],
    };

    static command(
        name: string,
        argumentCount: number,
        description: Description,
        handler?: Handler
    ) {
        if (this._commandMap.has(name))
            throw new Error(`Redefinition of command '${name}'`);
        this._commandMap.set(
            name,
            new Command(name, argumentCount, description, handler)
        );
        return this;
    }

    static option(
        name: string,
        argumentCount: number,
        description: Description
    ) {
        // Option refers to the last command added.
        const lastCommandName = Array.from(this._commandMap.keys()).at(-1);
        this._commandMap
            .get(lastCommandName)
            ?.pushOption(new Option(name, argumentCount, description));
        return this;
    }

    static help() {
        const commandHelpMessages = Array.from(this._commandMap.values()).map(
            (command) => command.help()
        );
        const errors = this._parseResult.errors.map((error) => error.detail);
        const helpMessage = `\nCommands:\n${commandHelpMessages.join(
            '\n\n'
        )}\n\n${errors.length ? `Errors:\n${errors.join('\n')}` : ''}\n`;
        console.log(helpMessage);
    }

    static parse(argument: string = process.argv.slice(2).join(' ')) {
        const splittedArgs = argument.split(' ');
        const [commandName, ...args] = splittedArgs;
        // Initializing the results
        const parseResult: ParseResult = {
            command: commandName,
            commandArgs: [],
            options: [],
            optionArgs: [],
            errors: [],
        };
        const targetCommand = this._commandMap.get(commandName);
        if (!targetCommand) {
            parseResult.errors.push({
                type: 'ReferenceError',
                detail: `${
                    commandName
                        ? `No defined command '${commandName}'`
                        : 'Nothing has been specified'
                }`,
            });
            this._parseResult = parseResult;
            return this._parseResult;
        }
        // Scan the registered options in order.
        for (const targetOption of targetCommand.optionMap.values()) {
            // Index of target options in args
            const targetOptionIndex = args.findIndex(
                (arg) => arg === targetOption.actualName
            );
            if (targetOptionIndex === -1) continue;
            // Copy as many arguments as expected from the target option.
            const [, ...tmpTargetOptionArgs] = [...args].splice(
                targetOptionIndex,
                targetOption.argumentCount + 1
            );
            // Push a terminating character.
            const SENTINEL = '---';
            tmpTargetOptionArgs.push(SENTINEL);
            // The number of arguments until the next option appears.
            const tmpTargetOptionLength = tmpTargetOptionArgs.findIndex(
                (optionArg) => optionArg.startsWith('-')
            );
            // The number of arguments actually specified. If an argument is missing, fill it with undefined.
            const actualArgumentCount =
                tmpTargetOptionLength < targetOption.argumentCount
                    ? tmpTargetOptionLength
                    : targetOption.argumentCount;
            const [optionName, ...optionArgs] = args.splice(
                targetOptionIndex,
                actualArgumentCount + 1
            );
            optionArgs.push(
                ...new Array(
                    targetOption.argumentCount - actualArgumentCount
                ).fill('')
            );
            parseResult.options.push(optionName);
            parseResult.optionArgs.push(optionArgs);
        }
        // Checking for errors. Detect duplicate and unregistered options.
        const invalidOptions = args
            .filter((arg) => arg.startsWith('-'))
            .map((invalidOption) => {
                if (parseResult.options.includes(invalidOption)) {
                    return {
                        type: 'DuplicateError',
                        target: invalidOption,
                        detail: `Duplicate ${commandName} option '${invalidOption}'`,
                    };
                } else {
                    return {
                        type: 'ReferenceError',
                        target: invalidOption,
                        detail: `No defined ${commandName} option '${invalidOption}'`,
                    };
                }
            });
        // The remaining Args are the arguments to the command.
        const validCommandArgs = [...args];
        parseResult.commandArgs.push(...validCommandArgs);
        // Checking for errors. Detects too many arguments.
        const invalidCommandArgs =
            validCommandArgs.length > targetCommand.argumentCount
                ? [
                      {
                          type: 'ArgumentError',
                          target: commandName,
                          detail: `Too many arguments for command '${commandName}', expected ${targetCommand.argumentCount} argument, have ${validCommandArgs.length} arguments`,
                      },
                  ]
                : [];
        parseResult.errors.push(...[...invalidCommandArgs, ...invalidOptions]);
        this._parseResult = parseResult;
        // If there are no errors, tell the class that it has completed successfully.
        if (!this._parseResult.errors.length) this._isValid = true;
        return this._parseResult;
    }

    static execute() {
        if (!this._isValid) {
            this.help();
            return;
            //throw new Error('Execution will be possible after parsing');
        }
        if (!this._parseResult) return;
        const targetCommand = this._commandMap.get(this._parseResult.command);
        if (!targetCommand) return;
        const args = [...this._parseResult.commandArgs];
        const options: ValidOptionList = this._parseResult.options.reduce(
            (prev, option, index) => {
                return (prev = {
                    ...prev,
                    [option]: this._parseResult.optionArgs[index].length
                        ? this._parseResult.optionArgs[index]
                        : true,
                });
            },
            {}
        );
        targetCommand.execute(args, options);
    }
}
