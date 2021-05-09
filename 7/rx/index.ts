import { BehaviorSubject, fromEvent } from 'rxjs';
import { catchError, filter, map, mergeWith, scan, share } from 'rxjs/operators'

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
        const $value = document.getElementById('value') as HTMLInputElement;
        const $add = document.getElementById('add') as HTMLInputElement;
        const $save = document.getElementById('save') as HTMLInputElement;
        const $load = document.getElementById('load') as HTMLInputElement;
        const $view = document.getElementById('view') as HTMLInputElement;
        const $sum = document.getElementById('sum') as HTMLInputElement;

        const loadedModel$ = fromEvent($load, 'click')
            .pipe(
                map(() => {
                    const values = window.prompt('Load');
                    return values != null ? Model.load(values) : null;
                }),
                catchError((e, caught) => {
                    window.alert(`Error: ${ e.message }`);
                    return caught;
                }),
                filter((model: Model | null): model is Model => model != null)
            );

        const model$ = fromEvent($add, 'click')
            .pipe(
                map(() => $value.value),
                filter(value => value.length > 0),
                map(value => Number(value)),
                filter(value => !isNaN(value)),
                scan((model, value) => model.addValue(value), new Model()),
                mergeWith(loadedModel$),
                share({
                    connector: () => new BehaviorSubject<Model>(new Model()),
                })
            );

        model$.subscribe(model => {
            $view.innerText = model.values.join(', ');
        });

        model$.subscribe(model => {
            $sum.innerText = model.sum.toString();
        });

        model$.subscribe(_ => {
            $value.value = '';
        });

        fromEvent($save, 'click')
            .subscribe(() => {
                model$.subscribe(model => {
                    window.alert(model.save());
                }).unsubscribe();
            });
    }
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
