---
id: "types"
title: 'Types'
sidebar_label: 'Types'
sidebar_position: 4
---

## StoreSetup
Lets you create a STORE with 'createStore'

```ts
export interface StoreSetup<T=any> {
	/** when LISTENERS change */
	onListenerChange?: (store: any, type: LISTENER_CHANGE) => void
	/** when the STORE state changes */
	onStateChange?: (store: StoreCore<T>, oldState: any) => void
	state?: T | (() => T),
	getters?: { [name: string]: CallStoreSetup<T> },
	actions?: { [name: string]: CallStoreSetup<T> },
	actionsSync?: { [name: string]: CallStoreSetup<T> },
	mutators?: { [name: string]: CallStoreSetup<T> },
}
```

## StoreCore
Instance of a STORE

```ts
export interface StoreCore<T=any> {
	state: T,
	_listeners: Set<ReducerCallback<any>>,
	_subscribe: (onStoreChange: ReducerCallback<any>, fn?: FnConditionalRendering<any>) => (() => void),
	_update: () => void
	/** called when listeners change */
	_listenerChange?: (store: any, type: LISTENER_CHANGE) => void
	_stateChange?: (store: any, oldState: any) => void
}
```

## Watcher
Identifies a `callback` called when a specific STORE `action/mutator` is executed

```ts
export interface Watcher {
	/** STORE instance to be observed */
	store: Store,
	/** name of the 'action' or 'mutator' to be observed */
	actionName: string,
	/** Function executed when 'action' or 'mutator' are called */
	callback: WatchCallback,
}
```

## WatchMsg
Data of an event that occurred in a STORE.

```ts
export interface WatchMsg {
	/** type of event, may be: `mutator`, `action` */
	type: EVENTS_TYPES,
	/** STORE instance that generated this event */
	store: Store,
	/** Name of the 'action' or 'mutator' that generated this event */
	key: string,
	/** Parameters sent to the 'action' or 'mutator' */
	payload: any,
	/** Value returned by 'action' */
	result: any,
	/** true if it is a call from another 'action' */
	subcall: boolean
}
```
