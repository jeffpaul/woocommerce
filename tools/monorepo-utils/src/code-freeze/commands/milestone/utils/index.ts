/**
 * External dependencies
 */
import { gt as greaterThan } from 'semver';
import { Repository } from '@octokit/graphql-schema';

/**
 * Internal dependencies
 */
import { graphqlWithAuth } from '../../../../github-api';
import { Options } from '../types';

export const getLatestReleaseVersion = async (
	options: Options
): Promise< string > => {
	const { owner, name } = options;

	const data = await graphqlWithAuth< { repository: Repository } >( `
			{
			    repository(owner: "${ owner }", name: "${ name }") {
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
		` );

	return data.repository.releases.nodes
		.map( ( node ) => node.tagName )
		.filter( ( tagName ) =>
			// Remove any non-numeric and decimal tags, ie prerelease, nightly, and beta tester tags.
			/^[\d.]+$/.test( tagName )
		)
		.reduce( ( latest, current ) =>
			greaterThan( current, latest ) ? current : latest
		);
};
