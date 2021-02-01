/* eslint eqeqeq: "off" */
let timeoutIDs = {};

export function debounce(name, callback, delay) {
	if (delay == 0) {
		callback.apply(this, null);
	} else {
		let toId = timeoutIDs[name];
		if (toId != null) clearTimeout(toId);
		timeoutIDs[name] = setTimeout(() => {
			delete timeoutIDs[name];
			callback.apply(this, null);
		}, delay);
	}
}


/**
 * crea una pausa async
 */
export function delay ( millisec ) {
    return new Promise(res => setTimeout(res, millisec));
}