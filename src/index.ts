import { Command } from './command';
import { Option } from './option';

type ParseResult = {
    command: string;
    commandArgs: string[];
    options: string[];
    optionArgs: string[][];
    errors: { type: string; target?: string; detail: string }[];
};

export class Litargs {
    private static readonly _SENTINEL = '---';
    private static _commandMap: Map<string, Command> = new Map();
    private static _isValid = false;
    private static parseResult: ParseResult;

    static command(name: string, argumentCount: number) {
        if (this._commandMap.has(name))
            throw new Error(`Redefinition of command '${name}'`);
        this._commandMap.set(name, new Command(name, argumentCount));
        return this;
    }

    static option(name: string, argumentCount: number) {
        // Option refers to the last command added.
        const lastCommandName = Array.from(this._commandMap.keys()).at(-1);
        if (!lastCommandName) throw new Error('No command is specified');
        this._commandMap
            .get(lastCommandName)
            ?.pushOption(new Option(name, argumentCount));
        return this;
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
                detail: `No defined command '${commandName}'`,
            });
            this.parseResult = parseResult;
            return this.parseResult;
        }
        // Scan the registered options in order.
        for (const targetOption of targetCommand.optionMap.values()) {
            // Index of target options in args
            const targetOptionIndex = args.findIndex(
                (arg) => arg === targetOption.actualName
            );
            if (targetOptionIndex === -1) continue;
            // Copy as many arguments as expected from the target option.
            const [, ...tmpTargetOptionArgs] = args.slice(
                targetOptionIndex,
                targetOption.argumentCount + targetOptionIndex + 1
            );
            // Push a terminating character.
            tmpTargetOptionArgs.push(this._SENTINEL);
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
                actualArgumentCount + targetOptionIndex + 1
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
        this.parseResult = parseResult;
        // If there are no errors, tell the class that it has completed successfully.
        if (!this.parseResult.errors.length) this._isValid = true;
        return this.parseResult;
    }
}

Litargs.command('test', 1).option('a', 2).option('b', 3).parse();
