export interface Description {
    args?: string[];
    detail: string;
}

export abstract class Util {
    protected _name;
    protected _argumentCount;
    protected _description;

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

    abstract help(): string;
}
