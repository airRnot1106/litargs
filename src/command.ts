import { Option } from './option';
import { Description, Util } from './util';

export interface ValidOptionList {
    [option: string]: string[] | boolean;
}

export type Handler = (args?: string[], option?: ValidOptionList) => unknown;

/**
 * Class of command.
 *
 * @export
 * @class Command
 * @extends {Util}
 */
export class Command extends Util {
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
    execute(args: string[], option: ValidOptionList) {
        return this._handler(args, option);
    }
}
