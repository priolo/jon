
/**
 * renderizza se le proprietà specificate di due stati sono diversi
 * Confronta due stati e restituisce true se sono diversi in almeno una delle proprietà specificate
 */
export const renderOnChange = (properties: string[]) => (currentState: any, oldState: any) => !equalsSome(currentState, oldState, properties)


/**
 * Confronta le proprietà specificate di due oggetti
 * @param obj1 - Primo oggetto da confrontare
 * @param obj2 - Secondo oggetto da confrontare
 * @param properties - Array di nomi delle proprietà da confrontare
 * @returns true se tutte le proprietà specificate hanno valori uguali in entrambi gli oggetti, false altrimenti
 */
export function equalsSome<T extends Record<string, any>>(
	obj1: T,
	obj2: T,
	properties: (keyof T)[]
): boolean {
	// Verifica che entrambi gli oggetti esistano
	if (!obj1 || !obj2) return false
	// Confronta ogni proprietà specificata
	for (const property of properties) {
		if (obj1[property] !== obj2[property]) {
			return false;
		}
	}
	return true;
}

/**
 * Confronta due oggetti verificando che tutte le proprietà siano uguali, eccetto quelle da ignorare
 * @param obj1 - Primo oggetto da confrontare
 * @param obj2 - Secondo oggetto da confrontare
 * @param ignoredProperties - Array di nomi delle proprietà da ignorare nel confronto
 * @returns true se tutti i valori delle proprietà (eccetto quelle ignorate) sono uguali, false altrimenti
 */
export function equalsIgnore<T extends Record<string, any>>(
	obj1: T,
	obj2: T,
	ignoredProperties: (keyof T)[] = []
): boolean {
	// Verifica che entrambi gli oggetti esistano
	if (!obj1 || !obj2) return obj1 === obj2

	// Ottiene tutte le chiavi uniche dai due oggetti
	const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])

	// Converte l'array delle proprietà ignorate in un Set per una ricerca più efficiente
	const ignoredSet = new Set(ignoredProperties);

	// Confronta ogni proprietà che non deve essere ignorata
	for (const key of allKeys) {
		// Salta le proprietà che devono essere ignorate
		if (ignoredSet.has(key as keyof T)) continue
		// Se una proprietà esiste solo in uno dei due oggetti, non sono uguali
		if (!(key in obj1) || !(key in obj2)) return false
		// Se i valori delle proprietà sono diversi, non sono uguali
		if (obj1[key] !== obj2[key]) return false
	}

	return true
}

