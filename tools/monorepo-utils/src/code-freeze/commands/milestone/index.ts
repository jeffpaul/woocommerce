/**
 * External dependencies
 */
import { Command } from '@commander-js/extra-typings';
// import chalk from 'chalk';
// import { setOutput } from '@actions/core';

/**
 * Internal dependencies
 */
import { getLatestReleaseVersion } from './utils';

export const milesStoneCommand = new Command( 'milestone' )
	.description( 'Create a milestone' )
	.option(
		'-g --github',
		'CLI command is used in the Github Actions context.'
	)
	.option( '-d --dryRun', 'Prepare the milestone but do not create it.' )
	.action( async ( options ) => {
		const { github, dryRun } = options;
		const latestReleaseVersion = getLatestReleaseVersion( options );
	} );
