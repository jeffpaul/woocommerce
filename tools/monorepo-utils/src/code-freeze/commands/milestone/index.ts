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
	.option( '-m --milestone <milestone>', 'Milestone to create' )
	.action( async ( options: Options ) => {
		const { owner, name, dryRun, milestone } = options;
		let nextVersion;

		if ( ! milestone ) {
			const versionSpinner = ora(
				'No milestone supplied, getting latest release version'
			).start();
			const latestReleaseVersion = await getLatestReleaseVersion(
				options
			);
			versionSpinner.succeed();

			console.log(
				chalk.yellow(
					`The latest release in ${ owner }/${ name } is version: ${ latestReleaseVersion }`
				)
			);

			const parsedLatestReleaseVersion = parse( latestReleaseVersion );
			nextVersion = inc(
				latestReleaseVersion,
				parsedLatestReleaseVersion.minor === 9 ? 'major' : 'minor'
			);

			console.log(
				chalk.yellow(
					`The next release in ${ owner }/${ name } will be version: ${ nextVersion }`
				)
			);
		} else {
			nextVersion = milestone;
		}

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
		} catch ( e ) {
			console.log(
				chalk.red(
					`\nFailed to create milestone ${ nextVersion } in ${ owner }/${ name }`
				)
			);
			if ( e.response.data.errors ) {
				e.response.data.errors.forEach( ( error ) => {
					console.log(
						chalk.red(
							`Error in ${ error.field } field with error code `
						) + chalk.bgRed( error.code )
					);
				} );
			} else {
				console.log( chalk.red( e.response.data.message ) );
			}

			process.exit( 1 );
		}

		milestoneSpinner.succeed();
		console.log(
			chalk.green(
				`Successfully created milestone ${ nextVersion } in ${ owner }/${ name }`
			)
		);
	} );
