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

        model.addListener({
            updated(event: ModelEvent): void {
                $view.innerText = event.model.values.join(', ');
            }
        });
    }
}

new Controller(new Model(), document);
