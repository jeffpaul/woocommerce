/**
 * External dependencies
 */
import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import { parse, inc } from 'semver';
import ora from 'ora';
// import { setOutput } from '@actions/core';

/**
 * Internal dependencies
 */
import { getLatestReleaseVersion } from './utils';
import { octokitWithAuth } from '../../../github-api';
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
		const { owner, name, dryRun } = options;
		const versionSpinner = ora( 'Getting latest release version' ).start();
		const latestReleaseVersion = await getLatestReleaseVersion( options );
		versionSpinner.succeed();

		console.log(
			chalk.yellow(
				`The latest release in ${ owner }/${ name } is version: ${ latestReleaseVersion }`
			)
		);

		const parsedLatestReleaseVersion = parse( latestReleaseVersion );
		const nextVersion = inc(
			latestReleaseVersion,
			parsedLatestReleaseVersion.minor === 9 ? 'major' : 'minor'
		);

		console.log(
			chalk.yellow(
				`The next release in ${ owner }/${ name } will be version: ${ nextVersion }`
			)
		);

		const milestoneSpinner = ora(
			`Creating a ${ nextVersion } milestone`
		).start();

		if ( dryRun ) {
			milestoneSpinner.succeed();
			console.log(
				chalk.green(
					`DRY RUN: Skipping actual creation of milestone ${ nextVersion }`
				)
			);

			process.exit( 0 );
		}

		try {
			await octokitWithAuth.request(
				`POST /repos/${ owner }/${ name }/milestones`,
				{
					title: nextVersion,
				}
			);
			milestoneSpinner.succeed();
		} catch ( e ) {
			console.log(
				chalk.red(
					`\nFailed to create milestone ${ nextVersion } in ${ owner }/${ name }`
				)
			);
			e.response.data.errors.forEach( ( error ) => {
				console.log(
					chalk.red(
						`Error in ${ error.field } field with error code `
					) + chalk.bgRed( error.code )
				);
			} );

			process.exit( 1 );
		}
	} );
