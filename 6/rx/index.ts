import { BehaviorSubject, fromEvent } from 'rxjs';
import { catchError, filter, map, mergeWith, scan, share } from 'rxjs/operators'

class Controller {
    constructor(document: HTMLDocument) {
        const $value = document.getElementById('value') as HTMLInputElement;
        const $add = document.getElementById('add') as HTMLInputElement;
        const $save = document.getElementById('save') as HTMLInputElement;
        const $load = document.getElementById('load') as HTMLInputElement;
        const $view = document.getElementById('view') as HTMLInputElement;
        const $sum = document.getElementById('sum') as HTMLInputElement;

        const loadedValues$ = fromEvent($load, 'click')
            .pipe(
                map(() => {
                    const values = window.prompt('Load');
                    return values != null ? parseNumberArray(values) : null;
                }),
                catchError((e, caught) => {
                    window.alert(`Error: ${ e.message }`);
                    return caught;
                }),
                filter((values: number[] | null): values is number[] => values != null)
            );

        const values$ = fromEvent($add, 'click')
            .pipe(
                map(() => $value.value),
                filter(value => value.length > 0),
                map(value => Number(value)),
                filter(value => !isNaN(value)),
                scan((values, value) => [...values, value], [] as number[]),
                mergeWith(loadedValues$),
                map((values): [number[], number] => [values, values.reduce((sum, value) => sum + value, 0)]),
                share({
                    connector: () => new BehaviorSubject<[number[], number]>([[], 0]),
                })
            );

        values$.subscribe(([values, _]) => {
            $view.innerText = values.join(', ');
        });

        values$.subscribe(([_, sum]) => {
            $sum.innerText = sum.toString();
        });

        values$.subscribe(_ => {
            $value.value = '';
        });

        fromEvent($save, 'click')
            .subscribe(() => {
                values$.subscribe(([values, _]) => {
                    window.alert(JSON.stringify(values));
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
