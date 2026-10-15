import { getElementMatchups, getElementMultiplier } from '../gameEngine';
import { ELEMENTS, ELEMENT_ADVANTAGES } from '../constants';

describe('getElementMatchups', () => {
  test('strong list matches the advantage table', () => {
    Object.keys(ELEMENTS).forEach(element => {
      expect(getElementMatchups(element).strong.sort()).toEqual([...ELEMENT_ADVANTAGES[element]].sort());
    });
  });

  test('weak list agrees with the combat multiplier', () => {
    Object.keys(ELEMENTS).forEach(element => {
      getElementMatchups(element).weak.forEach(other => {
        expect(getElementMultiplier({ element }, { element: other })).toBeLessThan(1);
      });
    });
  });

  test('fire is weak against water, earth and light', () => {
    expect(getElementMatchups('fire').weak.sort()).toEqual(['earth', 'light', 'water']);
  });
});
