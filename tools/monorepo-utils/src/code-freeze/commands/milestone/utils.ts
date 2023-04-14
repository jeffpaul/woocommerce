/**
 * External dependencies
 */
import { parse, inc } from 'semver';

export const WPIncrement = ( version: string ): string => {
	const parsedVersion = parse( version );
	return inc( parsedVersion, parsedVersion.minor === 9 ? 'major' : 'minor' );
};
