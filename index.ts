import { of, interval, ReplaySubject, defer, Observable, pipe } from "rxjs";
import {
  map,
  tap,
  shareReplay,
  publishReplay,
  multicast,
  refCount,
  materialize,
  take
} from "rxjs/operators";

/* 
  Replay custom operator

  circumvents rxjs < 6.4 shareReplay(1) behaviour - memory leak (ref: https://blog.strongbrew.io/share-replay-issue/)
 */
const replay = () =>
  pipe(
    multicast(() => new ReplaySubject(1)),
    refCount()
  );

const source$ = interval(1000).pipe(
  tap(i => console.log("tick")),
  // materialize(),
  // map(({ kind, value }) => ({ kind, value })),
  // shareReplay(1),// memory leak. Does not complete source Observable (ref: https://blog.strongbrew.io/share-replay-issue/)
  // publishReplay(1),
  // multicast(() => new ReplaySubject(1)),
  // refCount(),
  replay()
);

const modified$ = source$.pipe(
  tap(i => console.log("A-sub", i)),
  replay()
);

const sub1 = modified$.pipe(tap(i => console.log("B-sub", i))).subscribe();
const sub2 = modified$.pipe(tap(i => console.log("C-sub", i))).subscribe();

setTimeout(() => {
  sub1.unsubscribe();
}, 3000);

setTimeout(() => {
  sub2.unsubscribe();
}, 6000);

setTimeout(() => {
  source$
    .pipe(
      tap(i => console.log("D-sub", i)),
      take(1)
    )
    .subscribe();
}, 10000);
