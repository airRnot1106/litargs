import { Description, Util } from './util';

export class Option extends Util {
    constructor(name: string, argumentCount: number, description: Description) {
        super(name, argumentCount, description);
    }

    get actualName() {
        return this._argumentCount ? `-${this._name}` : `--${this._name}`;
    }

    help(): string {
        const helpMessage = `${this.actualName}\t${
            this._description.args ? `[${this._description.args}]` : '\t'
        }\t${this._description.detail}`;
        return helpMessage;
    }
}
