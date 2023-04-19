/**
 * External dependencies
 */
import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Internal dependencies
 */
import { getLatestReleaseVersion } from '../../../github/repo';
import { octokitWithAuth } from '../../../github/api';
import { WPIncrement } from './utils';
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
	.option(
		'-m --milestone <milestone>',
		'Milestone to create. Next milestone is gathered from Github if none is supplied'
	)
	.action( async ( options: Options ) => {
		const { owner, name, dryRun, milestone } = options;
		let nextMilestone;

		if ( milestone ) {
			nextMilestone = milestone;
		} else {
			const versionSpinner = ora(
				'No milestone supplied, going off the latest release version'
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

			const nextReleaseVersion = WPIncrement( latestReleaseVersion );

			console.log(
				chalk.yellow(
					`The next release in ${ owner }/${ name } will be version: ${ nextReleaseVersion }`
				)
			);

			nextMilestone = WPIncrement( nextReleaseVersion );

			console.log(
				chalk.yellow(
					`The next milestone in ${ owner }/${ name } will be: ${ nextMilestone }`
				)
			);
		}

		const milestoneSpinner = ora(
			`Creating a ${ nextMilestone } milestone`
		).start();

		if ( dryRun ) {
			milestoneSpinner.succeed();
			console.log(
				chalk.green(
					`DRY RUN: Skipping actual creation of milestone ${ nextMilestone }`
				)
			);

			process.exit( 0 );
		}

		try {
			await octokitWithAuth.request(
				`POST /repos/${ owner }/${ name }/milestones`,
				{
					title: nextMilestone,
				}
			);
		} catch ( e ) {
			const milestoneAlreadyExistsError = e.response.data.errors?.some(
				( error ) => error.code === 'already_exists'
			);

			if ( milestoneAlreadyExistsError ) {
				milestoneSpinner.succeed();
				console.log(
					chalk.green(
						`Milestone ${ nextMilestone } already exists in ${ owner }/${ name }`
					)
				);
				process.exit( 0 );
			} else {
				milestoneSpinner.fail();
				console.log(
					chalk.red(
						`\nFailed to create milestone ${ nextMilestone } in ${ owner }/${ name }`
					)
				);
				console.log( chalk.red( e.response.data.message ) );
				process.exit( 1 );
			}
		}

		milestoneSpinner.succeed();
		console.log(
			chalk.green(
				`Successfully created milestone ${ nextMilestone } in ${ owner }/${ name }`
			)
		);
	} );
