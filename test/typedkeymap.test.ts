import * as chai from 'chai';
const expect = chai.expect;

import TypedKeyMap from '../src/typedkeymap';

type TypedKey = {type: 'a', key: string} | {type: 'b', key: number};

describe('TypedKeyMap Tests', function () {
  it('tests', () => {
    const map = new TypedKeyMap<TypedKey, string>();
    map.put([{type: 'a', key: 'aa'}, {type: 'b', key: 11}], 'AABB');
    map.put([{type: 'a', key: 'cc'}, {type: 'b', key: 22}], 'CCDD');
    expect(map.get({type: 'a', key: 'aa'})).eql('AABB');
    expect(map.get({type: 'b', key: 11})).eql('AABB');
    expect(map.get({type: 'a', key: 'cc'})).eql('CCDD');
    expect(map.get({type: 'b', key: 22})).eql('CCDD');
  });
});
