
/**
 * renders if the specified properties of two states are different
 * Compares two states and returns true if they differ in at least one of the specified properties
 */
export const renderOnChange = (properties: string[]) => (currentState: any, oldState: any) => !equalsSome(currentState, oldState, properties)


/**
 * Compares the specified properties of two objects
 * @param obj1 - First object to compare
 * @param obj2 - Second object to compare
 * @param properties - Array of property names to compare
 * @returns true if all the specified properties have equal values in both objects, false otherwise
 */
export function equalsSome<T extends Record<string, any>>(
	obj1: T,
	obj2: T,
	properties: (keyof T)[]
): boolean {
	// check that both objects exist
	if (!obj1 || !obj2) return false
	// compare each specified property
	for (const property of properties) {
		if (obj1[property] !== obj2[property]) {
			return false;
		}
	}
	return true;
}

/**
 * Compares two objects checking that all properties are equal, except the ones to ignore
 * @param obj1 - First object to compare
 * @param obj2 - Second object to compare
 * @param ignoredProperties - Array of property names to ignore in the comparison
 * @returns true if all property values (except the ignored ones) are equal, false otherwise
 */
export function equalsIgnore<T extends Record<string, any>>(
	obj1: T,
	obj2: T,
	ignoredProperties: (keyof T)[] = []
): boolean {
	// check that both objects exist
	if (!obj1 || !obj2) return obj1 === obj2

	// get all the unique keys of the two objects
	const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])

	// convert the array of ignored properties into a Set for a more efficient lookup
	const ignoredSet = new Set(ignoredProperties);

	// compare each property that must not be ignored
	for (const key of allKeys) {
		// skip the properties that must be ignored
		if (ignoredSet.has(key as keyof T)) continue
		// if a property exists in only one of the two objects, they are not equal
		if (!(key in obj1) || !(key in obj2)) return false
		// if the property values are different, they are not equal
		if (obj1[key] !== obj2[key]) return false
	}

	return true
}

