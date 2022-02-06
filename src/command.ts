import { Option } from './option';
import { Description, CommandLine } from './commandLine';
import { CommandArgs, OptionArgs, ParsePiece } from '.';

export type Handler = (
    args: ParsePiece<CommandArgs>['args'],
    option: { [option: string]: ParsePiece<OptionArgs>['args'] }
) => unknown;

/**
 * Class of command.
 *
 * @export
 * @class Command
 * @extends {CommandLine}
 */
export class Command extends CommandLine {
    private _optionMap: Map<string, Option>;
    private _handler: Handler;

    /**
     * Creates an instance of Command.
     * @param {string} name
     * @param {number} argumentCount
     * @param {Description} description
     * @param {Handler} [handler=() => {
     *             return;
     *         }]
     * @memberof Command
     */
    constructor(
        name: string,
        argumentCount: number,
        description: Description,
        handler: Handler = () => {
            return;
        }
    ) {
        super(name, argumentCount, description);
        this._optionMap = new Map();
        this._handler = handler;
    }

    get optionMap() {
        return this._optionMap;
    }

    /**
     * Display a list of commands.
     *
     * @return {*}  {string}
     * @memberof Command
     * @override
     */
    help(): string {
        const optionHelpMessages = Array.from(this._optionMap.values()).map(
            (option) => option.help()
        );
        const helpMessage = `${this.name}\t${
            this._description.args
                ? `[${this._description.args.join(', ')}]`
                : '\t'
        }\t${this._description.detail}\n${
            optionHelpMessages.length
                ? `\tOptions:\n\t${optionHelpMessages.join('\n\t')}`
                : ''
        }`;
        return helpMessage;
    }

    /**
     * Add a option.
     *
     * @param {Option} option
     * @memberof Command
     */
    pushOption(option: Option) {
        if (this._optionMap.has(option.name))
            throw new Error(`Redefinition of option '${option.actualName}'`);
        this._optionMap.set(option.name, option);
    }

    /**
     * Execute the handler.
     *
     * @param {string[]} args
     * @param {ValidOptionList} option
     * @return {*}
     * @memberof Command
     */
    execute(
        args: ParsePiece<CommandArgs>['args'],
        option: { [option: string]: ParsePiece<OptionArgs>['args'] }
    ) {
        return this._handler(args, option);
    }
}
