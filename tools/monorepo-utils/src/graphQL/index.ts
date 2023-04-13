/**
 * External dependencies
 */
import { GraphQLClient } from 'graphql-request';
export { gql } from 'graphql-request';

export const graphQLRequest = async ( query ) => {
	const endpoint = 'https://api.github.com/graphql';
	const graphQLClient = new GraphQLClient( endpoint );
	graphQLClient.setHeader(
		'authorization',
		`Bearer ${ process.env.GITHUB_TOKEN }`
	);
	return await graphQLClient.request( query );
};
