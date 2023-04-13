/**
 * External dependencies
 */
import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
// import { setOutput } from '@actions/core';

/**
 * Internal dependencies
 */
import { getLatestReleaseVersion } from './utils';
import { Options } from './types';

export const milesStoneCommand = new Command( 'milestone' )
	.description( 'Create a milestone' )
	.option(
		'-g --github',
		'CLI command is used in the Github Actions context.'
	)
	.option( '-d --dryRun', 'Prepare the milestone but do not create it.' )
	.option(
		'-o --owner <owner>',
		'Repository owner. Default: woocommerce',
		'woocommerce'
	)
	.option(
		'-n --name <name>',
		'Repository name. Default: woocommerce',
		'woocommerce'
	)
	.action( async ( options: Options ) => {
		// const { github, dryRun } = options;
		const latestReleaseVersion = await getLatestReleaseVersion( options );
		console.log(
			chalk.yellow(
				'The latest release version is: ' + latestReleaseVersion
			)
		);
	} );
