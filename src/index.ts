import { Command, Handler } from './command';
import { Option } from './option';
import { Description } from './commandLine';

type ErrorType = 'ReferenceError' | 'ArgumentError' | 'DuplicateError';

export type CommandArgs = string[];
export type OptionArgs = string[] | boolean;

export interface ParsePiece<T> {
    name: string;
    args: T;
}

interface ErrorPiece {
    type: ErrorType;
    detail: string;
}

export interface ParseResult {
    command: ParsePiece<CommandArgs>[];
    option: ParsePiece<OptionArgs>[];
    errors: ErrorPiece[];
}

/**
 * Main class, set the command and options and parse arguments.
 *
 * @export
 * @class Litargs
 */
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
        command: [],
        option: [],
        errors: [],
    };

    /**
     * Set a command.
     *
     * @static
     * @param {string} name
     * @param {number} argumentCount
     * @param {Description} description
     * @param {Handler} [handler]
     * @return {*}
     * @memberof Litargs
     */
    static command(
        name: string,
        argumentCount: number,
        description: Description,
        handler?: Handler
    ) {
        if (name.startsWith('-'))
            throw new Error("The name cannot start with '-'");
        if (this._commandMap.has(name))
            throw new Error(`Redefinition of command '${name}'`);
        if (argumentCount !== (description.args?.length ?? 0))
            throw new Error(
                'The number of arguments does not match the number of description'
            );
        this._commandMap.set(
            name,
            new Command(name, argumentCount, description, handler)
        );
        return this;
    }

    static alias(name: string) {
        if (name.startsWith('-'))
            throw new Error("The name cannot start with '-'");
        const lastCommandName = Array.from(this._commandMap.keys()).at(-1);
        if (!lastCommandName || lastCommandName === 'help')
            throw new Error('No command is specified');
        if (this._commandMap.has(name))
            throw new Error(`Redefinition of alias '${name}'`);
        const lastCommand = this._commandMap.get(lastCommandName);
        if (!lastCommand) throw new Error('Not found command');
        this._commandMap.set(name, lastCommand);
        return this;
    }

    /**
     * Set a option. Applies to the last command added.
     * The optional prefix will be -; if argumentCount is set to 0, the prefix will be --.
     *
     * @static
     * @param {string} name
     * @param {number} argumentCount
     * @param {Description} description
     * @return {*}
     * @memberof Litargs
     */
    static option(
        name: string,
        argumentCount: number,
        description: Description
    ) {
        if (name.startsWith('-'))
            throw new Error("The name cannot start with '-'");
        // Option refers to the last command added.
        const lastCommandName = Array.from(this._commandMap.keys()).at(-1);
        if (!lastCommandName || lastCommandName === 'help')
            throw new Error('No command is specified');
        if (argumentCount !== (description.args?.length ?? 0))
            throw new Error(
                'The number of arguments does not match the number of description'
            );
        this._commandMap
            .get(lastCommandName)
            ?.pushOption(new Option(name, argumentCount, description));
        return this;
    }

    /**
     * Displays a list of commands and options. If there is an error in the parsing result, it will also be displayed.
     *
     * @static
     * @memberof Litargs
     * @override
     */
    static help() {
        const commandHelpMessages = Array.from(this._commandMap.values())
            .filter((command, index, array) => {
                return array.indexOf(command) === index;
            })
            .map((command) => command.help());
        const errors = this._parseResult.errors.map((error) => error.detail);
        const helpMessage = `\nCommands:\n${commandHelpMessages.join(
            '\n\n'
        )}\n\n${errors.length ? `Errors:\n${errors.join('\n')}` : ''}\n`;
        console.log(helpMessage);
    }

    /**
     * Parses the string passed as argument.
     *
     * @static
     * @param {string} argument
     * @return {*}
     * @memberof Litargs
     */
    static parse(argument: string) {
        const [commandName, ...args] = argument.split(/ +/);
        const targetCommand = this._commandMap.get(commandName);
        const parseResult: ParseResult = {
            command: [],
            option: [],
            errors: [],
        };
        if (!targetCommand) {
            parseResult.errors.push({
                type: 'ReferenceError',
                detail: `${
                    commandName
                        ? `No defined command '${commandName}'`
                        : 'Nothing has been specified'
                }`,
            });
            return parseResult;
        }
        const parseResultArray = [[commandName]];
        let targetOption: Option | undefined;
        for (const arg of args) {
            const lastOption = parseResultArray.at(-1);
            if (!lastOption) throw new Error('Serious parsing error');
            if (arg.startsWith('-')) {
                parseResultArray.push([arg]);
                targetOption = targetCommand.optionMap.get(
                    arg.replace(/^-+/, '')
                );
            } else if (
                targetOption &&
                targetOption.argumentCount > lastOption.length - 1
            ) {
                lastOption?.push(arg);
            } else {
                parseResultArray[0].push(arg);
            }
        }
        const [commandArray, ...optionArray] = parseResultArray;
        const [, ...commandArgs] = commandArray;
        const missingArgumentCount = Math.max(
            targetCommand.argumentCount - commandArgs.length,
            0
        );
        commandArgs.push(...new Array(missingArgumentCount).fill(''));
        parseResult.command.push({ name: commandName, args: commandArgs });
        if (targetCommand.argumentCount - commandArgs.length < 0) {
            parseResult.errors.push({
                type: 'ArgumentError',
                detail: `Too many arguments for command '${commandName}', expected ${targetCommand.argumentCount} argument, have ${commandArgs.length} arguments`,
            });
        }
        const optionPieces: ParsePiece<OptionArgs>[] = optionArray.map(
            (array) => {
                const [prefixedName, ...args] = array;
                const name = prefixedName.replace(/-+/, '');
                const targetOption = targetCommand.optionMap.get(name);
                if (!targetOption) {
                    parseResult.errors.push({
                        type: 'ReferenceError',
                        detail: `No defined ${commandName} option '${prefixedName}'`,
                    });
                    return { name: name, args: false };
                }
                const isFlg = targetOption.argumentCount < 1;
                if (isFlg) return { name: name, args: true };
                const missingArgumentCount = Math.max(
                    targetOption.argumentCount - args.length,
                    0
                );
                args.push(...new Array(missingArgumentCount).fill(''));
                return { name: name, args: args };
            }
        );
        parseResult.option = optionPieces;
        this._parseResult = parseResult;
        if (!this._parseResult.errors.length) this._isValid = true;
        return parseResult;
    }

    /**
     * Executes the handler for the specified command. If there is an error in the result of parsing, execute help.
     *
     * @static
     * @return {*}
     * @memberof Litargs
     */
    static execute() {
        if (!this._isValid) {
            this.help();
            return;
        }
        if (!this._parseResult) return;
        const targetCommand = this._commandMap.get(
            this._parseResult.command[0].name
        );
        if (!targetCommand) return;
        return targetCommand.execute(
            this._parseResult.command[0].args,
            Object.assign(
                {},
                ...this._parseResult.option.map((option) => {
                    return { [option.name]: option.args };
                })
            )
        );
    }
}
