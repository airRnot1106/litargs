/**
 * Interface for command and option descriptions.
 *
 * @export
 * @interface Description
 */
export interface Description {
    args?: string[];
    detail: string;
}

/**
 * Superclasses for commands and options.
 *
 * @export
 * @abstract
 * @class Util
 */
export abstract class CommandLine {
    protected _name;
    protected _argumentCount;
    protected _description;

    /**
     * Creates an instance of Util.
     * @param {string} name
     * @param {number} argumentCount
     * @param {Description} description
     * @memberof Util
     */
    constructor(name: string, argumentCount: number, description: Description) {
        this._name = name;
        this._argumentCount = argumentCount;
        this._description = description;
    }

    get name() {
        return this._name;
    }

    get argumentCount() {
        return this._argumentCount;
    }

    get description() {
        return this._description;
    }

    /**
     * Display descriptions of commands and options.
     *
     * @abstract
     * @return {*}  {string}
     * @memberof Util
     */
    abstract help(): string;
}
