import { Util } from './util';

export class Option extends Util {
    constructor(name: string, argumentCount: number) {
        super(name, argumentCount);
    }

    get actualName() {
        return this._argumentCount ? `-${this._name}` : `--${this._name}`;
    }
}
