export interface Options {
	shouldRemoveDuplicates: boolean;
	shouldPrependCustomClasses: boolean;
	customTailwindPrefix: string;
}

/**
 * Sorts a string of CSS classes according to a predefined order.
 * @param classString The string to sort
 * @param sortOrder The default order to sort the array at
 *
 * @returns The sorted string
 */
export const sortClassString = (
	classString: string,
	sortOrder: string[],
	options: Options
): string => {
	let classArray = classString.split(/\s+/g);

	if (options.shouldRemoveDuplicates) {
		classArray = removeDuplicates(classArray);
	}

	// prepend custom tailwind prefix to all tailwind sortOrder-classes
	const sortOrderClone = [...sortOrder];
	if (options.customTailwindPrefix.length > 0) {
		for (var i = 0; i < sortOrderClone.length; i++) {
			sortOrderClone[i] = options.customTailwindPrefix + sortOrderClone[i];
		}
	}

	classArray = sortClassArray(
		classArray,
		sortOrderClone,
		options.shouldPrependCustomClasses
	);

	return classArray.join(' ');
};

const sortClassArray = (
	classArray: string[],
	sortOrder: string[],
	shouldPrependCustomClasses: boolean
): string[] => [
	...classArray.filter(
		(el) => shouldPrependCustomClasses && sortOrder.indexOf(el) === -1
	), // append the classes that were not in the sort order if configured this way
	...classArray
		.filter((el) => sortOrder.indexOf(el) !== -1) // take the classes that are in the sort order
		.sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b)), // and sort them
	...classArray.filter(
		(el) => !shouldPrependCustomClasses && sortOrder.indexOf(el) === -1
	), // prepend the classes that were not in the sort order if configured this way
];

const removeDuplicates = (classArray: string[]): string[] => [
	...new Set(classArray),
];

function isArrayOfStrings(value: string | string[]): value is string[] {
	return (
		Array.isArray(value) && value.every((item) => typeof item === 'string')
	);
}

export function buildRegexes(value: string | string[]): RegExp[] {
	if (isArrayOfStrings(value)) {
		return value.map((v) => new RegExp(v, 'gi'));
	} else {
		return [new RegExp(value, 'gi')];
	}
}

export function getTextMatch(
	regexes: RegExp[],
	text: string,
	callback: (text: string, startPosition: number) => void,
	startPosition: number = 0
): void {
	if (regexes.length >= 1) {
		let wrapper: RegExpExecArray | null;
		while ((wrapper = regexes[0].exec(text)) !== null) {
			const wrapperMatch = wrapper[0];
			const valueMatchIndex = wrapper.findIndex(
				(match, idx) => idx !== 0 && match
			);
			const valueMatch = wrapper[valueMatchIndex];

			const newStartPosition =
				startPosition + wrapper.index + wrapperMatch.lastIndexOf(valueMatch);

			if (regexes.length === 1) {
				callback(valueMatch, newStartPosition);
			} else {
				getTextMatch(regexes.slice(1), valueMatch, callback, newStartPosition);
			}
		}
	}
}
