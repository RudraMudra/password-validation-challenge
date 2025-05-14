import { useState, type CSSProperties, type Dispatch, type SetStateAction, FormEvent } from 'react';

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

function CreateUserForm({ setUserWasCreated }: CreateUserFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 10) errors.push('Password must be at least 10 characters long');
    if (pwd.length > 24) errors.push('Password must be at most 24 characters long');
    if (/\s/.test(pwd)) errors.push('Password cannot contain spaces');
    if (!/[0-9]/.test(pwd)) errors.push('Password must contain at least one number');
    if (!/[A-Z]/.test(pwd)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('Password must contain at least one lowercase letter');
    return errors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true); // Disable submit button on submit

    const clientValidation = validatePassword(password);
    setValidationMessages(clientValidation);

    if (!username || clientValidation.length > 0) {
      setIsSubmitting(false); // Enable button if validation fails
      return;
    }

    try {
      const response = await fetch(
        'https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsibXVkcmEucnVkcmExMjNAZ21haWwuY29tIl0sImlzcyI6Imhlbm5nZS1hZG1pc3Npb24tY2hhbGxlbmdlIiwic3ViIjoiY2hhbGxlbmdlIn0.tmKceSQGsfEekvhwhM2VtVsk6lmj21BMCAVsIShRgvw', // Replace with your token
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (response.ok) {
        setUserWasCreated(true);
      } else if (response.status === 400) {
        const data = await response.json();
        if (
          data.detail &&
          typeof data.detail === 'string' &&
          data.detail.includes('not allowed')
        ) {
          setErrorMessage(
            'Sorry, the entered password is not allowed, please try a different one.'
          );
        } else {
          setErrorMessage('Something went wrong, please try again.');
        }
      } else if (response.status === 401 || response.status === 403) {
        setErrorMessage('Not authenticated to access this resource.');
      } else {
        setErrorMessage('Something went wrong, please try again.');
      }
    } catch (error) {
      setErrorMessage('Something went wrong, please try again.');
    } finally {
      setIsSubmitting(false); // Re-enable button once done
    }
  };

  return (
    <div style={formWrapper}>
      <form style={form} onSubmit={handleSubmit}>
        <label style={formLabel} htmlFor="username">Username</label>
        <input
          id="username"
          style={formInput}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label style={formLabel} htmlFor="password">Password</label>
        <input
          id="password"
          style={formInput}
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setValidationMessages(validatePassword(e.target.value));
            setErrorMessage(''); // reset errors on input change
          }}
        />

        {validationMessages.length > 0 && (
          <ul style={validationList}>
            {validationMessages.map((msg, idx) => (
              <li key={idx} style={validationItem}>{msg}</li>
            ))}
          </ul>
        )}

        {errorMessage && <p style={errorText}>{errorMessage}</p>}

        <button style={formButton} disabled={isSubmitting}>
          {isSubmitting ? 'Creating User...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = {
  maxWidth: '500px',
  width: '80%',
  backgroundColor: '#efeef5',
  padding: '24px',
  borderRadius: '8px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: 'none',
  padding: '8px 16px',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#f8f7fa',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
};

const formButton: CSSProperties = {
  outline: 'none',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: '#7135d2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  height: '40px',
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
  alignSelf: 'flex-end',
  cursor: 'pointer',
};

const validationList: CSSProperties = {
  margin: '8px 0',
  paddingLeft: '16px',
  listStyleType: 'disc',
  color: '#ff0000',
};

const validationItem: CSSProperties = {
  fontSize: '14px',
};

const errorText: CSSProperties = {
  color: '#ff0000',
  fontSize: '14px',
  marginTop: '8px',
};
