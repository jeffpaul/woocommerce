/**
 * Internal dependencies
 */
import { getLatestReleaseVersion } from '../repo';

jest.mock( '../api', () => {
	return {
		graphqlWithAuth: jest.fn().mockResolvedValue( {
			repository: {
				releases: {
					nodes: [
						{
							tagName: 'nightly',
						},
						{
							tagName: 'wc-beta-tester-99.99.00',
						},
						{
							tagName: '1.0.0',
						},
						{
							tagName: '1.1.0',
						},
						{
							tagName: '1.2.0',
						},
						{
							tagName: '2.0.0',
						},
						{
							tagName: '2.0.1',
						},
						{
							tagName: '1.0.1',
						},
					],
				},
			},
		} ),
	};
} );

it( 'should return the latest release version', async () => {
	expect(
		await getLatestReleaseVersion( {
			owner: 'woocommerce',
			name: 'woocommerce',
		} )
	).toBe( '2.0.1' );
} );
