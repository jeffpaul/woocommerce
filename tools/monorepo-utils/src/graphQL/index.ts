/**
 * External dependencies
 */
import { graphql } from '@octokit/graphql';

export const graphqlWithAuth = graphql.defaults( {
	headers: {
		authorization: `Bearer ${ process.env.GITHUB_TOKEN }`,
	},
} );
