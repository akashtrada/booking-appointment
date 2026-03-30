# Frontend Architecture & Component Guidelines

## Component Rules

### 1. No class components

- Always use simple function syntax

✅ Correct:

```jsx
export default function Button(props)
{
}
```

❌ Avoid:

```jsx
const Button = () =>
{
}
```

---

### 2. Props Handling

- Always accept `props` as a single object
- Destructure inside the component

✅ Correct:

```jsx
export default function Button(props)
{
  const {label, onClick} = props;
}
```

❌ Avoid:

```jsx
function Button({label, onClick})
```

---

### 3. Default Values

- Set defaults inside destructuring

```jsx
const {
  variant = 'primary',
  disabled = false
} = props;
```

---

### 4. File Naming

- Use **PascalCase** for components
- File name = component name

```
Button.jsx
Card.js
UserProfile.js
```

---

## Hooks Rules

- Place all custom hooks inside `/hooks`
- Prefix with `use`

```
useRecorder.js
useAuth.js
```

---

## Service Layer Rules

- API calls must be in `/services`
- Never call APIs directly inside components

---

## Standard Component Example

```jsx
import {useMemo} from 'react';

export default function Button(props)
{
  const {label, onClick, disabled = false} = props;

  const styles = useMemo(() => ({
    button: {
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    },
  }), [disabled]);

  return (
    <button onClick={onClick} disabled={disabled} style={styles.button}>
      {label}
    </button>
  );
}
```
