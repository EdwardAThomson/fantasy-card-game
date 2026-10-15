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

  test('every element has at least one weakness', () => {
    Object.keys(ELEMENTS).forEach(element => {
      expect(getElementMatchups(element).weak.length).toBeGreaterThan(0);
    });
  });

  test('no two elements are strong against each other', () => {
    Object.entries(ELEMENT_ADVANTAGES).forEach(([element, beats]) => {
      beats.forEach(other => expect(ELEMENT_ADVANTAGES[other]).not.toContain(element));
    });
  });

  test('light is weak against lightning', () => {
    expect(getElementMatchups('light').weak).toEqual(['lightning']);
  });
});
