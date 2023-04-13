/**
 * External dependencies
 */
import { gt as greaterThan, prerelease } from 'semver';

/**
 * Internal dependencies
 */
import { graphQLRequest, gql } from '../../../../graphQL';

export const getLatestReleaseVersion = async ( options ) => {
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
		if ( greaterThan( current, latest ) ) {
			return current;
		}
		return latest;
	} );
	console.log( latestRelease );
};
