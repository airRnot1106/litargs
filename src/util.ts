export abstract class Util {
    protected _name;
    protected _argumentCount;

    constructor(name: string, argumentCount: number) {
        this._name = name;
        this._argumentCount = argumentCount;
    }

    get name() {
        return this._name;
    }

    get argumentCount() {
        return this._argumentCount;
    }
}
