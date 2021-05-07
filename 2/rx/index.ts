import { BehaviorSubject, fromEvent } from 'rxjs';
import { filter, map, scan, share } from 'rxjs/operators'

class Controller {
    constructor(document: HTMLDocument) {
        const $value = document.getElementById('value') as HTMLInputElement;
        const $add = document.getElementById('add') as HTMLInputElement;
        const $save = document.getElementById('save') as HTMLInputElement;
        const $view = document.getElementById('view') as HTMLInputElement;

        const values$ = fromEvent($add, 'click')
            .pipe(
                map(() => $value.value),
                filter(value => value.length > 0),
                map(value => Number(value)),
                filter(value => !isNaN(value)),
                scan((values, value, _) => [...values, value], [] as number[]),
                share({
                    connector: () => new BehaviorSubject<number[]>([]),
                })
            );

        values$.subscribe(values => {
            $view.innerText = values.join(', ');
            $value.value = '';
        });

        fromEvent($save, 'click')
            .subscribe(() => {
                values$.subscribe(values => window.alert(JSON.stringify(values))).unsubscribe();
            });
    }
}

new Controller(document);
