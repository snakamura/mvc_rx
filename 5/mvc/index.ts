class Model {
    get values(): number[] {
        return [...this._values];
    }

    addValue(value: number): void {
        this._values.push(value);
        this.fireUpdated();
    }

    save(): string {
        return JSON.stringify(this._values);
    }

    load(values: string) {
        this._values = parseNumberArray(values);
        this.fireUpdated();
    }

    addListener(listener: ModelListener): void {
        this._listeners.push(listener);
    }

    private fireUpdated(): void {
        const event = new ModelEvent(this);
        this._listeners.forEach(listener => listener.updated(event));
    }

    private _values: number[] = [];
    private _listeners: ModelListener[] = [];
}

class ModelEvent {
    constructor(readonly model: Model) {}
}

interface ModelListener {
    updated(event: ModelEvent): void;
}


class Controller {
    constructor(model: Model, document: HTMLDocument) {
        const $value = document.getElementById('value') as HTMLInputElement;
        const $add = document.getElementById('add') as HTMLInputElement;
        const $save = document.getElementById('save') as HTMLInputElement;
        const $load = document.getElementById('load') as HTMLInputElement;
        const $view = document.getElementById('view') as HTMLInputElement;

        $add.addEventListener('click', () => {
            if ($value.value.length > 0) {
                const v = Number($value.value);
                if (!isNaN(v)) {
                    model.addValue(v);
                }
            }
            $value.value = '';
        });

        $save.addEventListener('click', () => {
            window.alert(model.save());
        });

        $load.addEventListener('click', () => {
            const values = window.prompt('Load');
            if (values != null) {
                try {
                    model.load(values);
                }
                catch (e) {
                    window.alert(`Error: ${ e.message }`);
                }
                $value.value = '';
            }
        });

        model.addListener({
            updated(event: ModelEvent): void {
                $view.innerText = event.model.values.join(', ');
            }
        });
    }
}

new Controller(new Model(), document);


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
