/* eslint eqeqeq: "off" */

/**
 * @return if obj is an Object, including an Array.
 * @param {object}
 */
export function isObject(value) {
    return value !== null && typeof value === 'object';
}

/**
 * Fa un controllo "weak" tra due oggetti
 * @param {object} v1 oggetto da confrontare
 * @param {object} v2 oggetto da confrontare
 */
export function isEqual(v1, v2) {
    return Object.is(v1, v2);
}

/**
 * Fa un controllo "deep" tra due oggetti
 * @param {object} v1 
 * @param {object} v2 
 */
export function isEqualDeep(v1, v2) {
    if (!isObject(v1) || !isObject(v2)) {
        return isEqual(v1, v2);
    }
    for (let key in v1) {
        if (!isEqualDeep(v1[key], v2[key])) return false;
    }
    for (let key in v2) {
        if (!v1.hasOwnProperty(key)) return false;
    }
    return true;
}

/**
 * Fa un clone "deep" di un oggetto
 * @param {*} obj oggetto da clonare
 */
export function cloneDeep(obj) {
    if (obj == undefined) return undefined;
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Fa un clone "weak" di un oggetto
 * @param {object} obj oggetto da clonare
 */
export function clone(obj) {
    return { ...obj };
}


/**
 * restituisce un oggetto che è la differenza 
 * GESTIRE gli oggetti: Date e altri oggetti "nativi"
 * @param {object} obj1 
 * @param {object} obj2 
 */
export function diff(obj1, obj2) {

    // se sono primitive allora controlla se sono uguali e se lo sono restituisci null
    if (!isObject(obj1) || !isObject(obj2)) {
        return isEqual(obj1, obj2) ? null : obj2;
    }

    let ret = {};

    for (let key in obj1) {
        // se 2 ha la proprietà di 1 presa in esame
        if (obj2.hasOwnProperty(key)) {
            let res = diff(obj1[key], obj2[key]);

            // metti la proprietà solo se ci sono differenze
            if (res != null && Object.keys(res).length > 0) {
                ret[key] = res;
            }

            // se non ce l'ha vuol dire che è stata cancellata
        } else {
            if (ret._deleted == null) ret._deleted = [];
            ret._deleted.push(key);
        }
    }

    // inserisci tutte le proprietà nuove
    for (let key in obj2) {
        if (obj1.hasOwnProperty(key)) continue;
        ret[key] = obj2[key];
    }

    return ret;
}

/**
 * Aggiunge ad un json la differenza 
 * in maniera da ripristinare il valore precedente
 * @param {*} obj 
 * @param {*} diff 
 */
export function add(obj, diff) {

    if (!isObject(diff)) {
        return diff;
    }

    let ret = {};

    for (let key in diff) {
        if (key == "_deleted") continue;
        ret[key] = add(obj[key], diff[key]);
    }

    if (!isObject(obj)) return ret;

    for (let key in obj) {
        if (Object.keys(diff).some(k => k == key)) continue;
        if (diff._deleted && diff._deleted.some(k => k == key)) continue;
        ret[key] = obj[key];
    }

    return ret;
}

/**
 * Deep merge from two object
 */
export function merge(from, to) {
    return Object.keys(from).reduce((merged, key) => {
        if (from[key] instanceof Object && !Array.isArray(from[key])) {
            merged[key] = merge(from[key], merged[key] ?? {})
        } else {
            merged[key] = from[key]
        }
        return merged
    }, { ...to })
}
