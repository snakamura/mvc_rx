class Model {
    constructor(values: number[] = []) {
        this._values = values;
    }

    get values() {
        return [...this._values];
    }

    get sum() {
        return this._values.reduce((sum, value) => sum + value, 0);
    }

    addValue(value: number): Model {
        return new Model([...this._values, value]);
    }

    save(): string {
        return JSON.stringify(this._values);
    }

    static load(values: string): Model {
        return new Model(parseNumberArray(values));
    }

    private readonly _values: number[];
}


class Controller {
    constructor(document: HTMLDocument) {
        const $add = document.getElementById('add') as HTMLInputElement;
        const $save = document.getElementById('save') as HTMLInputElement;
        const $load = document.getElementById('load') as HTMLInputElement;

        this._$value = document.getElementById('value') as HTMLInputElement;
        this._$view = document.getElementById('view') as HTMLInputElement;
        this._$sum = document.getElementById('sum') as HTMLInputElement;

        $add.addEventListener('click', () => {
            if (this._$value.value.length > 0) {
                const v = Number(this._$value.value);
                if (!isNaN(v)) {
                    this.updateModel(this._model.addValue(v));
                }
            }
        });

        $save.addEventListener('click', () => {
            window.alert(this._model.save());
        });

        $load.addEventListener('click', () => {
            const values = window.prompt('Load');
            if (values != null) {
                try {
                    this.updateModel(Model.load(values));
                }
                catch (e) {
                    window.alert(`Error: ${ e.message }`);
                }
            }
        });
    }

    private updateModel(model: Model) {
        this._model = model;

        this._$view.innerText = model.values.join(', ');
        this._$sum.innerText = model.sum.toString();
        this._$value.value = '';
    }

    private _model = new Model();

    private readonly _$value: HTMLInputElement;
    private readonly _$view: HTMLInputElement;
    private readonly _$sum: HTMLInputElement;
}

new Controller(document);


function parseNumberArray(string: string): number[] {
    const json = JSON.parse(string);
    if (!(json instanceof Array)) {
        throw new Error('Not an array.');
    }
    if (!json.every(v => typeof v === 'number')) {
        throw new Error('Not a number array.');
    }
    return json;
}
