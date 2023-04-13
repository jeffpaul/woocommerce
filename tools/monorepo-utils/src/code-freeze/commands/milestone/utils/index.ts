/**
 * External dependencies
 */
import { gt as greaterThan } from 'semver';

/**
 * Internal dependencies
 */
import { graphQLRequest, gql } from '../../../../graphQL';

export const getLatestReleaseVersion = async ( options ) => {
	const { owner, name } = options;

	// interface RepositoryReleases {
	// 	repository: { releases: { nodes: { tagName: string }[] } };
	// }

	const query = gql`
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
		`;

	const data = await graphQLRequest( query );

	const tagNames = data.repository.releases.nodes.map(
		( node ) => node.tagName
	);
	const majorMinors = tagNames.filter( ( tagName ) =>
		/^[\d.]+$/.test( tagName )
	);
	const latestRelease = majorMinors.reduce( ( latest, current ) => {
		if ( greaterThan( current, latest ) ) {
			return current;
		}
		return latest;
	} );

	return latestRelease;
};
