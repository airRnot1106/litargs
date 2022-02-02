import { Option } from './option';
import { Util } from './util';

export class Command extends Util {
    private _optionMap: Map<string, Option>;

    constructor(name: string, argumentCount: number) {
        super(name, argumentCount);
        this._optionMap = new Map();
    }

    get optionMap() {
        return this._optionMap;
    }

    pushOption(option: Option) {
        if (this._optionMap.has(option.name))
            throw new Error(`Redefinition of option '${option.actualName}'`);
        this._optionMap.set(option.name, option);
    }
}
