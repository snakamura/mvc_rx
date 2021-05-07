import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { catchError, filter, map, mapTo, scan, share, switchMap } from 'rxjs/operators'

class Values {
    constructor(readonly values: number[] = [], readonly action?: Action) {}
}

interface Action {
    updateValues(values: Values): Values;
    invoke(values: Values): void;
}

class Add implements Action {
    constructor(private readonly value: number) {}
    updateValues(values: Values): Values {
        return new Values([...values.values, this.value], this);
    }
    invoke(_values: Values): void {}
}

class Load implements Action {
    constructor(private readonly values: number[]) {}
    updateValues(_values: Values): Values {
        return new Values(this.values, this);
    }
    invoke(_values: Values): void {}
}

class Save implements Action {
    updateValues(values: Values): Values {
        return new Values(values.values, this);
    }
    invoke(values: Values): void {
        window.alert(JSON.stringify(values.values));
    }
}

class Err implements Action {
    constructor(private readonly error: Error) {}
    updateValues(values: Values): Values {
        return new Values(values.values, this);
    }
    invoke(_values: Values): void {
        window.alert(`Error: ${ this.error.message }`);
    }
}

class Controller {
    constructor(document: HTMLDocument) {
        const $value = document.getElementById('value') as HTMLInputElement;
        const $add = document.getElementById('add') as HTMLInputElement;
        const $save = document.getElementById('save') as HTMLInputElement;
        const $load = document.getElementById('load') as HTMLInputElement;
        const $view = document.getElementById('view') as HTMLInputElement;

        const addActions$ = fromEvent($add, 'click')
            .pipe(
                map(() => $value.value),
                filter(value => value.length > 0),
                map(value => Number(value)),
                filter(value => !isNaN(value)),
                map(value => new Add(value))
            );

        const loadActions$ = fromEvent($load, 'click')
            .pipe(
                switchMap(event => of(event).pipe(
                    map(() => {
                        const values = window.prompt('Load');
                        return values != null ? new Load(parseNumberArray(values)) : null;
                    }),
                    catchError(e => of(new Err(e))),
                )),
                filter((action: Load | Err | null): action is Load | Err => action != null)
            );

        const saveActions$ = fromEvent($save, 'click')
            .pipe(
                mapTo(new Save())
            );

        const values$ = merge(addActions$, loadActions$, saveActions$)
            .pipe(
                scan((values: Values, action: Action, _) => {
                    return action.updateValues(values);
                }, new Values()),
                share({
                    connector: () => new BehaviorSubject<Values>(new Values()),
                })
            );

        values$.subscribe(values => {
            if (values.action) {
                values.action.invoke(values);
            }

            $view.innerText = values.values.join(', ');
            $value.value = '';
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
