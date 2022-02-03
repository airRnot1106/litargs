import { Description, Util } from './util';

/**
 * Class of option.
 *
 * @export
 * @class Option
 * @extends {Util}
 */
export class Option extends Util {
    /**
     * Creates an instance of Option.
     * @param {string} name
     * @param {number} argumentCount
     * @param {Description} description
     * @memberof Option
     */
    constructor(name: string, argumentCount: number, description: Description) {
        super(name, argumentCount, description);
    }

    /**
     * Returns the name with a prefix.
     *
     * @readonly
     * @memberof Option
     */
    get actualName() {
        return this._argumentCount ? `-${this._name}` : `--${this._name}`;
    }

    /**
     * Display a list of options.
     *
     * @return {*}  {string}
     * @memberof Option
     * @override
     */
    help(): string {
        const helpMessage = `${this.actualName}\t${
            this._description.args
                ? `[${this._description.args.join(', ')}]`
                : '\t'
        }\t${this._description.detail}`;
        return helpMessage;
    }
}
