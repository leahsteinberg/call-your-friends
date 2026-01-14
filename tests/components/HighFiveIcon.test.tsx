import React from 'react';
import { render } from '@testing-library/react-native';
import HighFiveIcon from '@/components/IconComponents/HighFiveIcon';

// Mock the SVG component
jest.mock('@/assets/images/high-five.svg', () => 'HighFiveSvg');

describe('HighFiveIcon', () => {
  it('should render with default dimensions', () => {
    const { getByTestId } = render(<HighFiveIcon testID="high-five-icon" />);
    const icon = getByTestId('high-five-icon');

    expect(icon).toBeTruthy();
    expect(icon.props.width).toBe(150);
    expect(icon.props.height).toBe(135);
  });

  it('should render with custom width and height', () => {
    const { getByTestId } = render(
      <HighFiveIcon testID="high-five-icon" width={200} height={180} />
    );
    const icon = getByTestId('high-five-icon');

    expect(icon.props.width).toBe(200);
    expect(icon.props.height).toBe(180);
  });

  it('should pass through additional SVG props', () => {
    const { getByTestId } = render(
      <HighFiveIcon
        testID="high-five-icon"
        fill="red"
        opacity={0.5}
      />
    );
    const icon = getByTestId('high-five-icon');

    expect(icon.props.fill).toBe('red');
    expect(icon.props.opacity).toBe(0.5);
  });
});
