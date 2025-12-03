# How to Use Custom Fonts

Your custom fonts are now loaded and ready to use! Here's how to use them in your components.

## Available Fonts

- **Catamaran** - Clean, modern sans-serif
- **Clockwise** - Light, elegant font
- **SantaAna** - Medium weight display font

## Usage Examples

### Method 1: Import from theme.ts (Recommended)

```typescript
import { CustomFonts } from '@/constants/theme';

const styles = StyleSheet.create({
  heading: {
    fontFamily: CustomFonts.catamaran,
    fontSize: 24,
    fontWeight: '600',
  },
  body: {
    fontFamily: CustomFonts.clockwise,
    fontSize: 16,
  },
  title: {
    fontFamily: CustomFonts.santaAna,
    fontSize: 20,
  },
});
```

### Method 2: Direct font name

```typescript
const styles = StyleSheet.create({
  text: {
    fontFamily: 'Catamaran',  // Or 'Clockwise', 'SantaAna'
    fontSize: 16,
  },
});
```

### Method 3: Inline styles

```tsx
<Text style={{ fontFamily: CustomFonts.catamaran, fontSize: 18 }}>
  Hello World
</Text>
```

## Full Component Example

```tsx
import { CustomFonts } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function MyComponent() {
  return (
    <View>
      <Text style={styles.heading}>This uses Catamaran</Text>
      <Text style={styles.body}>This uses Clockwise Light</Text>
      <Text style={styles.title}>This uses Santa Ana</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: CustomFonts.catamaran,
    fontSize: 24,
    fontWeight: '600',
  },
  body: {
    fontFamily: CustomFonts.clockwise,
    fontSize: 16,
  },
  title: {
    fontFamily: CustomFonts.santaAna,
    fontSize: 20,
  },
});
```

## Adding More Fonts

To add more fonts:

1. Add the `.otf` or `.ttf` file to `assets/images/fonts/`
2. Update `app/_layout.tsx` to load the font:
   ```typescript
   const [fontsLoaded] = useFonts({
     'Catamaran': require('../assets/images/fonts/Catamaran.otf'),
     'Clockwise': require('../assets/images/fonts/clockwise_light.otf'),
     'SantaAna': require('../assets/images/fonts/SantaAnaTRIAL-Medium.otf'),
     'YourNewFont': require('../assets/images/fonts/YourNewFont.otf'), // Add here
   });
   ```
3. Add to `constants/theme.ts`:
   ```typescript
   export const CustomFonts = {
     catamaran: 'Catamaran',
     clockwise: 'Clockwise',
     santaAna: 'SantaAna',
     yourNewFont: 'YourNewFont', // Add here
   } as const;
   ```

## Platform Compatibility

These custom fonts work identically on:
- ✅ iOS
- ✅ Android
- ✅ Web

No platform-specific code needed!
