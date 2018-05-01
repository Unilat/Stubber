import React from 'react';
import { shallow } from 'enzyme';

import { Folder } from '../../../src/assets/javascripts/components/Folder/Folder.js';

describe('Folder', () => {

    const folder = {
        name: 'Test Folder',
        id: 0,
        open: true,
        stubs: []
    };
    const mockUpdateDropdown = jest.fn();
    Folder.prototype.updateDropdown = mockUpdateDropdown;
    const wrapper = shallow(<Folder key={1} id={0} folder={folder} editing={false} disabled={false} actions={{}}></Folder>);

    test('renders', () => {
        expect(wrapper).toMatchSnapshot();
    });

    test('updates the dropdown on render', () => {
        expect(mockUpdateDropdown).toHaveBeenCalledTimes(1);
    });

    test('updates the dropdown on update', () => {
        wrapper.setProps({disabled: true});
        expect(mockUpdateDropdown).toHaveBeenCalledTimes(2);
    });
});