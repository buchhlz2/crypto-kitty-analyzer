import React from 'react';
import renderer from 'react-test-renderer';
import Navbar from '../components/Navbar';

// 2. Test cases for calling `blockQueryRangeStateHandler`
// (a) 11500000 to 11845776 => matronId (0x1e6bef), matronNumberOfBirthsDuringRange (10) , numberOfBirthedKitties (2520)
// (b) 6607985 to 6607985 => matronId (0x00), matronNumberOfBirthsDuringRange (3099) , numberOfBirthedKitties (186652)
// (c) 11838307 to 11845776 => matronId (null), matronNumberOfBirthsDuringRange (null) , numberOfBirthedKitties (4)

test('renders Navbar', () => {
	const component = renderer.create(<Navbar />);
	let tree = component.toJSON();
	expect(tree).toMatchSnapshot();
});
