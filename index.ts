import { of, interval, ReplaySubject, defer, Observable, pipe } from "rxjs";
import {
  map,
  tap,
  shareReplay,
  publishReplay,
  multicast,
  refCount,
  materialize
} from "rxjs/operators";

const replay = () =>
  pipe(
    multicast(() => new ReplaySubject(1)),
    refCount()
  );

const source = interval(1000).pipe(
  tap(i => console.log("tick")),
  // materialize(),
  // map(({ kind, value }) => ({ kind, value })),
  // shareReplay(1),// memory leak. Does not complete source Observable (ref: https://blog.strongbrew.io/share-replay-issue/)
  // publishReplay(1),
  // multicast(() => new ReplaySubject(1)),
  // refCount(),
  replay()
);

const a$ = source.pipe(
  tap(i => console.log("A-sub", i)),
  replay()
);

const sub1 = a$.pipe(tap(i => console.log("B-sub", i))).subscribe();
const sub2 = a$.pipe(tap(i => console.log("C-sub", i))).subscribe();
// const sub3 = source.pipe(tap(i => console.log("sub2", i))).subscribe();

setTimeout(() => {
  sub1.unsubscribe();
}, 3000);

setTimeout(() => {
  sub2.unsubscribe();
}, 6000);

// setTimeout(() => {
//   sub3.unsubscribe();
// }, 9000);

setTimeout(() => {
  const sub3 = source.pipe(tap(i => console.log("sub", i))).subscribe();

  setTimeout(() => sub3.unsubscribe(), 4000);
}, 10000);
