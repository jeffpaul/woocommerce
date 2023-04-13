/**
 * External dependencies
 */
import { Command } from '@commander-js/extra-typings';
import { gt, prerelease } from 'semver';
// import chalk from 'chalk';
// import { setOutput } from '@actions/core';

/**
 * Internal dependencies
 */
import { graphQLRequest, gql } from '../../../graphQL';

export const milesStoneCommand = new Command( 'milestone' )
	.description( 'Create a milestone' )
	.option(
		'-g --github',
		'CLI command is used in the Github Actions context.'
	)
	.option( '-d --dryRun', 'Prepare the milestone but do not create it.' )
	.action( async ( { github, dryRun } ) => {
		const repoOwner = 'woocommerce';
		const repoName = 'woocommerce';

		const query = gql`
			{
			    repository(owner: "${ repoOwner }", name: "${ repoName }") {
					releases(
						first: 25
						orderBy: { field: CREATED_AT, direction: DESC }
					) {
						nodes {
							tagName
						}
					}
				}
			}
		`;

		const data = await graphQLRequest( query );

		const tagNames = data.repository.releases.nodes.map(
			( node ) => node.tagName
		);
		console.log( tagNames );
		const majorMinors = tagNames.filter(
			( tagName ) =>
				tagName !== 'nightly' &&
				! prerelease( tagName ) &&
				// TODO for now...
				tagName !== 'wc-beta-tester-2.2.0'
		);
		console.log( majorMinors );
		const latestRelease = majorMinors.reduce( ( latest, current ) => {
			if ( gt( current, latest ) ) {
				return current;
			}
			return latest;
		} );
		console.log( latestRelease );
	} );
